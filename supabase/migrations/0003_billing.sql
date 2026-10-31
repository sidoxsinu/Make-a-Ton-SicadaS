-- 0003_billing.sql
-- Billing engine, subscription transitions, customer actions, reports, cron.
-- Untested against a live database. Phase 4 must run it and pass the golden vectors in docs/07.

create or replace function add_periods(p_start date, p_period billing_period, p_n int)
returns date language sql immutable as $$
  select case p_period
    when 'daily'   then p_start + p_n
    when 'weekly'  then p_start + 7 * p_n
    when 'monthly' then (p_start + make_interval(months => p_n))::date
    when 'yearly'  then (p_start + make_interval(years => p_n))::date
  end
$$;

-- ---------- create a subscription from a quotation template ----------
create or replace function create_subscription_from_template(
  p_template uuid, p_customer uuid, p_start date, p_expiry date, p_term uuid
) returns uuid language plpgsql security definer set search_path = public as $$
declare t quotation_templates%rowtype; pl plans%rowtype; v_id uuid;
begin
  if not is_team() then raise exception 'Not allowed'; end if;
  select * into t from quotation_templates where id = p_template and active;
  if not found then raise exception 'Template not found'; end if;
  select * into pl from plans where id = t.plan_id;

  insert into subscriptions(customer_id, plan_id, template_id, payment_term_id, start_date, expiry_date,
                            quote_valid_until, created_by)
  values (p_customer, t.plan_id, t.id, p_term, p_start, p_expiry, current_date + t.validity_days, auth.uid())
  returning id into v_id;

  if pl.price > 0 then
    insert into subscription_lines(subscription_id, description, quantity, unit_price, position)
    values (v_id, 'Plan fee: ' || pl.name, 1, pl.price, 0);
  end if;

  insert into subscription_lines(subscription_id, product_id, variant_id, description, quantity, unit_price, tax_id, position)
  select v_id, l.product_id, l.variant_id,
         p.name || coalesce(' (' || v.attribute || ': ' || v.value || ')', ''),
         greatest(l.quantity, pl.min_quantity),
         p.sales_price + coalesce(v.extra_price, 0),
         p.default_tax_id, l.position + 1
  from quotation_template_lines l
  join products p on p.id = l.product_id
  left join product_variants v on v.id = l.variant_id
  where l.template_id = t.id;

  return v_id;
end $$;

-- ---------- readiness check used by quotation and confirm transitions ----------
create or replace function sub_check_ready(s subscriptions) returns void language plpgsql as $$
declare pl plans%rowtype; v_bad int; v_lines int;
begin
  select * into pl from plans where id = s.plan_id;
  if not pl.active then raise exception 'Plan is not active'; end if;
  if s.start_date < pl.available_from or (pl.available_to is not null and s.start_date > pl.available_to) then
    raise exception 'Start date is outside the plan availability window';
  end if;
  select count(*) into v_lines from subscription_lines where subscription_id = s.id;
  if v_lines = 0 then raise exception 'Add at least one line'; end if;
  select count(*) into v_bad from subscription_lines
   where subscription_id = s.id and product_id is not null and quantity < pl.min_quantity;
  if v_bad > 0 then raise exception 'Minimum quantity for this plan is %', pl.min_quantity; end if;
end $$;

-- ---------- team transitions ----------
create or replace function sub_transition(p_id uuid, p_to sub_status) returns void
language plpgsql security definer set search_path = public as $$
declare s subscriptions%rowtype; pl plans%rowtype;
begin
  if not is_team() then raise exception 'Not allowed'; end if;
  select * into s from subscriptions where id = p_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  select * into pl from plans where id = s.plan_id;

  if p_to = 'quotation' then
    perform sub_check_ready(s);
    update subscriptions set status = 'quotation' where id = p_id;
  elsif p_to = 'confirmed' then
    if s.quote_valid_until is not null and s.quote_valid_until < current_date then
      raise exception 'Quotation expired on %', s.quote_valid_until;
    end if;
    perform sub_check_ready(s);
    update subscriptions set status = 'confirmed' where id = p_id;
  elsif p_to = 'active' and s.status = 'confirmed' then
    update subscriptions set status = 'active', anchor_date = start_date, cycles_billed = 0,
           next_invoice_date = start_date where id = p_id;
  elsif p_to = 'active' and s.status = 'paused' then
    if not pl.pausable then raise exception 'Plan cannot be paused'; end if;
    update subscriptions set status = 'active', anchor_date = current_date, cycles_billed = 0,
           next_invoice_date = case when current_date <= expiry_date then current_date end where id = p_id;
  elsif p_to = 'paused' then
    if not pl.pausable then raise exception 'Plan cannot be paused'; end if;
    update subscriptions set status = 'paused', next_invoice_date = null where id = p_id;
  elsif p_to = 'closed' then
    if s.status in ('active','paused') and not pl.closable then raise exception 'Plan cannot be closed early'; end if;
    update subscriptions set status = 'closed', next_invoice_date = null where id = p_id;
  elsif p_to = 'draft' then
    update subscriptions set status = 'draft' where id = p_id;
  else
    raise exception 'Unsupported transition';
  end if;
end $$;

create or replace function sub_renew(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare s subscriptions%rowtype; pl plans%rowtype; v_new_expiry date; v_next date;
begin
  select * into s from subscriptions where id = p_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  if not (is_team() or owns_customer(s.customer_id)) then raise exception 'Not allowed'; end if;
  select * into pl from plans where id = s.plan_id;
  if not pl.renewable then raise exception 'Plan cannot be renewed'; end if;
  if s.status not in ('active','paused') then raise exception 'Only active or paused subscriptions can be renewed'; end if;

  v_new_expiry := s.expiry_date + (s.expiry_date - s.start_date);
  v_next := s.next_invoice_date;
  if s.status = 'active' and v_next is null then
    v_next := add_periods(s.anchor_date, pl.billing_period, s.cycles_billed);
    if v_next > v_new_expiry then v_next := null; end if;
  end if;
  update subscriptions set expiry_date = v_new_expiry, next_invoice_date = v_next where id = p_id;
end $$;

-- customer self service: pause, resume, close, renew on their own subscription only
create or replace function customer_sub_action(p_id uuid, p_action text) returns void
language plpgsql security definer set search_path = public as $$
declare s subscriptions%rowtype; pl plans%rowtype;
begin
  select * into s from subscriptions where id = p_id for update;
  if not found or not owns_customer(s.customer_id) then raise exception 'Not allowed'; end if;
  select * into pl from plans where id = s.plan_id;
  if p_action = 'renew' then
    perform sub_renew(p_id);
  elsif p_action = 'pause' and s.status = 'active' and pl.pausable then
    update subscriptions set status = 'paused', next_invoice_date = null where id = p_id;
  elsif p_action = 'resume' and s.status = 'paused' and pl.pausable then
    update subscriptions set status = 'active', anchor_date = current_date, cycles_billed = 0,
           next_invoice_date = case when current_date <= expiry_date then current_date end where id = p_id;
  elsif p_action = 'close' and s.status in ('active','paused') and pl.closable then
    update subscriptions set status = 'closed', next_invoice_date = null where id = p_id;
  else
    raise exception 'Action % is not available for this subscription', p_action;
  end if;
end $$;

-- ---------- invoice generation ----------
-- Serialised by an advisory lock so discount usage counts cannot race. Idempotent through the unique index.
create or replace function generate_invoice(p_sub uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  s subscriptions%rowtype; pl plans%rowtype; term payment_terms%rowtype;
  v_inv uuid; v_start date; v_end date; v_next date;
  v_sub_net numeric; v_qty int; v_disc discounts%rowtype; v_amt numeric;
  v_left numeric; v_share numeric; v_n int; v_count int := 0; r record;
  v_auto boolean;
begin
  perform pg_advisory_xact_lock(hashtext('billing'));

  select * into s from subscriptions where id = p_sub for update;
  if not found or s.status <> 'active' or s.next_invoice_date is null or s.next_invoice_date > current_date then
    return null;
  end if;
  select * into pl from plans where id = s.plan_id;
  select * into term from payment_terms where id = s.payment_term_id;

  v_start := s.next_invoice_date;
  if v_start > s.expiry_date then
    update subscriptions set next_invoice_date = null where id = s.id;
    return null;
  end if;
  v_next := add_periods(s.anchor_date, pl.billing_period, s.cycles_billed + 1);
  v_end  := least(v_next - 1, s.expiry_date);
  if v_next > s.expiry_date then v_next := null; end if;

  insert into invoices(subscription_id, customer_id, invoice_date, due_date, period_start, period_end)
  values (s.id, s.customer_id, current_date, current_date + term.days, v_start, v_end)
  returning id into v_inv;

  -- lines
  insert into invoice_lines(invoice_id, product_id, variant_id, description, quantity, unit_price, tax_id, tax_rate, position)
  select v_inv, sl.product_id, sl.variant_id, sl.description, sl.quantity, sl.unit_price, sl.tax_id,
         coalesce(t.rate, 0), sl.position
  from subscription_lines sl left join taxes t on t.id = sl.tax_id
  where sl.subscription_id = s.id;

  -- product level discount: best single eligible discount per line
  update invoice_lines il
     set discount_id = best.did, discount_amount = best.amt
    from (
      select distinct on (l.id) l.id as line_id, d.id as did,
             least(l.gross, case d.kind when 'fixed' then d.value else round(l.gross * d.value / 100, 2) end) as amt
        from invoice_lines l
        join discount_products dp on dp.product_id = l.product_id
        join discounts d on d.id = dp.discount_id
       where l.invoice_id = v_inv and d.scope = 'product' and d.active
         and (d.starts_on is null or d.starts_on <= current_date)
         and (d.ends_on   is null or d.ends_on   >= current_date)
         and (d.usage_limit is null or d.used_count < d.usage_limit)
         and l.quantity >= d.min_quantity and l.gross >= d.min_purchase
       order by l.id,
                least(l.gross, case d.kind when 'fixed' then d.value else round(l.gross * d.value / 100, 2) end) desc,
                d.id
    ) best
   where il.id = best.line_id;

  -- subscription level discount: best single eligible discount on the net subtotal
  select coalesce(sum(gross - discount_amount), 0), coalesce(sum(quantity), 0), count(*)
    into v_sub_net, v_qty, v_n from invoice_lines where invoice_id = v_inv;

  select d.* into v_disc
    from discounts d
   where d.scope = 'subscription' and d.active
     and (d.starts_on is null or d.starts_on <= current_date)
     and (d.ends_on   is null or d.ends_on   >= current_date)
     and (d.usage_limit is null or d.used_count < d.usage_limit)
     and v_qty >= d.min_quantity and v_sub_net >= d.min_purchase
     and (not exists (select 1 from discount_subscriptions x where x.discount_id = d.id)
          or exists (select 1 from discount_subscriptions x where x.discount_id = d.id and x.subscription_id = s.id))
   order by least(v_sub_net, case d.kind when 'fixed' then d.value else round(v_sub_net * d.value / 100, 2) end) desc, d.id
   limit 1;

  if found and v_sub_net > 0 then
    v_amt := least(v_sub_net, case v_disc.kind when 'fixed' then v_disc.value else round(v_sub_net * v_disc.value / 100, 2) end);
    v_left := v_amt;
    for r in select id, gross - discount_amount as net from invoice_lines where invoice_id = v_inv order by position, id loop
      v_count := v_count + 1;
      if v_count = v_n then
        v_share := least(v_left, r.net);
      else
        v_share := least(round(v_amt * r.net / v_sub_net, 2), r.net, v_left);
      end if;
      update invoice_lines set discount_amount = discount_amount + v_share where id = r.id;
      v_left := v_left - v_share;
    end loop;
    update invoices set discount_id = v_disc.id where id = v_inv;
  end if;

  -- tax per line on the discounted amount, half up to 2 decimals
  update invoice_lines
     set tax_amount = round((gross - discount_amount) * tax_rate / 100, 2),
         line_total = (gross - discount_amount) + round((gross - discount_amount) * tax_rate / 100, 2)
   where invoice_id = v_inv;

  update invoices i set
     subtotal       = x.sub,
     discount_total = x.disc,
     tax_total      = x.tax,
     total          = x.tot
    from (select coalesce(sum(gross),0) sub, coalesce(sum(discount_amount),0) disc,
                 coalesce(sum(tax_amount),0) tax, coalesce(sum(line_total),0) tot
            from invoice_lines where invoice_id = v_inv) x
   where i.id = v_inv;

  -- count each discount once per invoice
  update discounts set used_count = used_count + 1
   where id in (select discount_id from invoice_lines where invoice_id = v_inv and discount_id is not null
                union
                select discount_id from invoices where id = v_inv and discount_id is not null);

  -- advance the subscription
  update subscriptions set cycles_billed = cycles_billed + 1, next_invoice_date = v_next where id = s.id;

  select coalesce((value)::text::boolean, false) into v_auto from app_settings where key = 'auto_confirm_invoices';
  if coalesce(v_auto, false) then
    update invoices set status = 'confirmed' where id = v_inv;
  end if;

  return v_inv;
end $$;

create or replace function generate_due_invoices(p_sub uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; v_id uuid; v_created int := 0; v_failed int := 0; v_errors jsonb := '[]'::jsonb; v_guard int;
begin
  for r in select id from subscriptions
            where status = 'active' and next_invoice_date <= current_date and (p_sub is null or id = p_sub)
            order by next_invoice_date loop
    v_guard := 0;
    loop
      begin
        v_id := generate_invoice(r.id);
        exit when v_id is null;
        v_created := v_created + 1;
      exception when others then
        v_failed := v_failed + 1;
        v_errors := v_errors || jsonb_build_object('subscription', r.id, 'error', sqlerrm);
        exit;
      end;
      v_guard := v_guard + 1;
      exit when v_guard >= 60;
    end loop;
  end loop;

  -- close plans that end by themselves, only after their last invoice exists
  update subscriptions s set status = 'closed', next_invoice_date = null
    from plans p
   where p.id = s.plan_id and p.auto_close and s.status in ('active','paused')
     and s.expiry_date < current_date and s.next_invoice_date is null
     and (p_sub is null or s.id = p_sub);

  insert into billing_runs(created, failed, detail) values (v_created, v_failed, v_errors);
  return jsonb_build_object('created', v_created, 'failed', v_failed, 'errors', v_errors);
end $$;

-- the engine functions are never callable from the browser
revoke execute on function generate_invoice(uuid) from public, anon, authenticated;
revoke execute on function generate_due_invoices(uuid) from public, anon, authenticated;

-- button on the UI: team only
create or replace function run_billing(p_sub uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not is_team() then raise exception 'Not allowed'; end if;
  return generate_due_invoices(p_sub);
end $$;

-- bulk invoice actions for billing day
create or replace function confirm_draft_invoices(p_ids uuid[] default null) returns int
language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  if not is_team() then raise exception 'Not allowed'; end if;
  update invoices set status = 'confirmed' where status = 'draft' and (p_ids is null or id = any(p_ids));
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- zero total invoices (100 percent discounts) cannot receive a payment, so staff close them here
create or replace function mark_zero_invoice_paid(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_team() then raise exception 'Not allowed'; end if;
  update invoices set status = 'paid' where id = p_id and status = 'confirmed' and total = 0;
  if not found then raise exception 'Only confirmed invoices with a zero total can be marked paid'; end if;
end $$;

-- ---------- customer self edit ----------
create or replace function update_my_details(p_name text, p_phone text, p_address text) returns void
language sql security definer set search_path = public as $$
  update customers set name = p_name, phone = p_phone, address = p_address where user_id = auth.uid()
$$;

-- ---------- reporting ----------
create or replace view v_invoices with (security_invoker = true) as
select i.*, (i.total - i.amount_paid) as amount_due,
       case when i.status = 'confirmed' and i.due_date < current_date then true else false end as is_overdue,
       case when i.status = 'confirmed' and i.due_date < current_date then current_date - i.due_date else 0 end as days_overdue
from invoices i;

create or replace function dashboard_summary(p_from date, p_to date) returns jsonb
language plpgsql stable security invoker set search_path = public as $$
declare v_out jsonb;
begin
  if not is_team() then raise exception 'Not allowed'; end if;
  select jsonb_build_object(
    'active_subscriptions', (select count(*) from subscriptions where status = 'active'),
    'by_status', (select coalesce(jsonb_object_agg(status::text, n), '{}'::jsonb) from (select status, count(*) n from subscriptions group by status) q),
    'mrr', (select coalesce(round(sum(sl.quantity * sl.unit_price *
              case p.billing_period when 'daily' then 365.0/12 when 'weekly' then 52.0/12 when 'monthly' then 1 else 1.0/12 end), 2), 0)
            from subscriptions s join plans p on p.id = s.plan_id join subscription_lines sl on sl.subscription_id = s.id
            where s.status = 'active'),
    'invoiced', (select coalesce(sum(total), 0) from invoices where status in ('confirmed','paid') and invoice_date between p_from and p_to),
    'collected', (select coalesce(sum(amount), 0) from payments where paid_on between p_from and p_to),
    'outstanding', (select coalesce(sum(total - amount_paid), 0) from invoices where status = 'confirmed'),
    'overdue_count', (select count(*) from invoices where status = 'confirmed' and due_date < current_date),
    'overdue_amount', (select coalesce(sum(total - amount_paid), 0) from invoices where status = 'confirmed' and due_date < current_date),
    'aging', (select jsonb_build_object(
        'd0_30',  coalesce(sum(total - amount_paid) filter (where current_date - due_date between 1 and 30), 0),
        'd31_60', coalesce(sum(total - amount_paid) filter (where current_date - due_date between 31 and 60), 0),
        'd61_up', coalesce(sum(total - amount_paid) filter (where current_date - due_date > 60), 0))
        from invoices where status = 'confirmed' and due_date < current_date),
    'monthly', (select coalesce(jsonb_agg(jsonb_build_object('month', m, 'collected', c) order by m), '[]'::jsonb)
        from (select to_char(date_trunc('month', paid_on), 'YYYY-MM') m, sum(amount) c
                from payments where paid_on >= (date_trunc('month', current_date) - interval '11 months')::date
               group by 1) q)
  ) into v_out;
  return v_out;
end $$;

-- ---------- scheduling (Supabase free tier supports pg_cron; enable it under Database > Extensions) ----------
-- 00:30 UTC is 06:00 in India. Run once after enabling the extension:
-- select cron.schedule('daily-billing', '30 0 * * *', $$select generate_due_invoices()$$);
