-- 0002_rls.sql
-- Row level security. Roles come from profiles.role. The browser only ever holds the anon key plus the user session.
-- The service role key is used only inside server code for staff creation.

create or replace function app_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_team() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','staff') from profiles where id = auth.uid()), false)
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false)
$$;

create or replace function owns_customer(p_customer uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from customers where id = p_customer and user_id = auth.uid())
$$;

-- enable RLS everywhere
alter table profiles                    enable row level security;
alter table customers                   enable row level security;
alter table payment_terms               enable row level security;
alter table taxes                       enable row level security;
alter table products                    enable row level security;
alter table product_variants            enable row level security;
alter table plans                       enable row level security;
alter table quotation_templates         enable row level security;
alter table quotation_template_lines    enable row level security;
alter table discounts                   enable row level security;
alter table discount_products           enable row level security;
alter table discount_subscriptions      enable row level security;
alter table app_settings                enable row level security;
alter table subscriptions               enable row level security;
alter table subscription_lines          enable row level security;
alter table subscription_status_history enable row level security;
alter table invoices                    enable row level security;
alter table invoice_lines               enable row level security;
alter table payments                    enable row level security;
alter table billing_runs                enable row level security;

-- profiles: read own, team reads all; users may change only their own full_name; role changes only by admin via service role
create policy profiles_select on profiles for select using (id = auth.uid() or is_team());
create policy profiles_update_self on profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on profiles from authenticated;
grant update (full_name) on profiles to authenticated;
create policy profiles_admin_all on profiles for all using (is_admin()) with check (is_admin());

-- customers
create policy customers_select on customers for select using (is_team() or user_id = auth.uid());
create policy customers_team_write on customers for insert with check (is_team());
create policy customers_team_update on customers for update using (is_team()) with check (is_team());
create policy customers_admin_delete on customers for delete using (is_admin());

-- reference data any signed in user may read (no secrets in these tables)
create policy plans_read on plans for select using (auth.uid() is not null);
create policy terms_read on payment_terms for select using (auth.uid() is not null);
create policy taxes_read on taxes for select using (auth.uid() is not null);
create policy plans_admin on plans for all using (is_admin()) with check (is_admin());
create policy terms_admin on payment_terms for all using (is_admin()) with check (is_admin());
create policy taxes_admin on taxes for all using (is_admin()) with check (is_admin());

-- catalog and discounts: team reads, admin writes. Customers get no direct access (cost_price stays private).
create policy products_read on products for select using (is_team());
create policy products_admin on products for all using (is_admin()) with check (is_admin());
create policy variants_read on product_variants for select using (is_team());
create policy variants_admin on product_variants for all using (is_admin()) with check (is_admin());
create policy templates_read on quotation_templates for select using (is_team());
create policy templates_admin on quotation_templates for all using (is_admin()) with check (is_admin());
create policy template_lines_read on quotation_template_lines for select using (is_team());
create policy template_lines_admin on quotation_template_lines for all using (is_admin()) with check (is_admin());
create policy discounts_read on discounts for select using (is_team());
create policy discounts_admin on discounts for all using (is_admin()) with check (is_admin());
create policy discount_products_read on discount_products for select using (is_team());
create policy discount_products_admin on discount_products for all using (is_admin()) with check (is_admin());
create policy discount_subs_read on discount_subscriptions for select using (is_team());
create policy discount_subs_admin on discount_subscriptions for all using (is_admin()) with check (is_admin());
create policy settings_read on app_settings for select using (is_team());
create policy settings_admin on app_settings for all using (is_admin()) with check (is_admin());

-- subscriptions
create policy subs_select on subscriptions for select using (is_team() or owns_customer(customer_id));
create policy subs_team_insert on subscriptions for insert with check (is_team() and status = 'draft' and cycles_billed = 0);
create policy subs_team_update on subscriptions for update using (is_team()) with check (is_team());
create policy subs_admin_delete on subscriptions for delete using (is_admin() and status = 'draft');

create policy sub_lines_select on subscription_lines for select using (
  is_team() or exists (select 1 from subscriptions s where s.id = subscription_id and owns_customer(s.customer_id)));
create policy sub_lines_team_write on subscription_lines for all using (is_team()) with check (is_team());

create policy history_select on subscription_status_history for select using (
  is_team() or exists (select 1 from subscriptions s where s.id = subscription_id and owns_customer(s.customer_id)));

-- invoices: created only by billing functions. Team may update status. Customers read their own.
create policy inv_select on invoices for select using (is_team() or owns_customer(customer_id));
create policy inv_team_update on invoices for update using (is_team()) with check (is_team());
create policy inv_lines_select on invoice_lines for select using (
  is_team() or exists (select 1 from invoices i where i.id = invoice_id and owns_customer(i.customer_id)));

-- payments
create policy pay_select on payments for select using (
  is_team() or exists (select 1 from invoices i where i.id = invoice_id and owns_customer(i.customer_id)));
create policy pay_team_insert on payments for insert with check (is_team());
create policy pay_admin_delete on payments for delete using (is_admin());

create policy runs_read on billing_runs for select using (is_team());

-- Column level grants: the UI changes subscription status and billing fields only through the RPC functions in 0003.
-- Table level UPDATE is revoked, then the editable columns are granted back.
revoke update on subscriptions from authenticated;
grant update (customer_id, plan_id, template_id, payment_term_id, start_date, expiry_date, quote_valid_until, notes)
  on subscriptions to authenticated;

-- Invoices: staff may change status (confirm, cancel, mark sent). Amounts and paid totals are system managed.
revoke update on invoices from authenticated;
grant update (status, sent_at) on invoices to authenticated;
