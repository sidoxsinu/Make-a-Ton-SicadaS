-- 0001_schema.sql
-- Target: Supabase free tier (PostgreSQL 15+). Run in the SQL editor or via supabase db push.
-- This file is NOT yet executed against a live database. Phase 1 of the build must run it and fix any typo.

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------- enums ----------
create type user_role      as enum ('admin','staff','customer');
create type product_type   as enum ('service','goods','digital');
create type billing_period as enum ('daily','weekly','monthly','yearly');
create type sub_status     as enum ('draft','quotation','confirmed','active','paused','closed');
create type invoice_status as enum ('draft','confirmed','paid','cancelled');
create type discount_kind  as enum ('fixed','percent');
create type discount_scope as enum ('product','subscription');
create type pay_method     as enum ('cash','bank_transfer','upi','card','cheque','other');

create sequence sub_number_seq;
create sequence inv_number_seq;

-- ---------- identity ----------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now()
);

create table customers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references profiles(id) on delete set null,
  name        text not null,
  email       citext not null unique,
  phone       text,
  company     text,
  address     text,
  tax_number  text,
  created_at  timestamptz not null default now()
);

-- New auth user: customers get a profile plus a linked customer row.
-- Staff are created by the admin through the Admin API with app_metadata {"role":"staff"}.
-- app_metadata cannot be set by a browser client, user_metadata can, so only app_metadata is trusted.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_app_meta_data->>'role','') = 'staff' then
    insert into profiles(id, full_name, role)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'staff');
    return new;
  end if;

  insert into profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'customer');

  update customers set user_id = new.id where email = new.email and user_id is null;
  if not found then
    insert into customers(user_id, name, email)
    values (new.id, coalesce(nullif(new.raw_user_meta_data->>'full_name',''), new.email), new.email);
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();

-- ---------- catalog ----------
create table payment_terms (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,
  days  int not null check (days >= 0)
);

create table taxes (
  id      uuid primary key default gen_random_uuid(),
  name    text not null unique,
  rate    numeric(6,3) not null check (rate >= 0 and rate <= 100),
  active  boolean not null default true
);

create table products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  type           product_type not null default 'service',
  sales_price    numeric(12,2) not null check (sales_price >= 0),
  cost_price     numeric(12,2) not null default 0 check (cost_price >= 0),
  default_tax_id uuid references taxes(id),
  notes          text,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table product_variants (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  attribute    text not null,                       -- example: Brand
  value        text not null,                       -- example: Odoo
  extra_price  numeric(12,2) not null default 0,    -- example: 560
  unique (product_id, attribute, value)
);

create table plans (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  price           numeric(12,2) not null default 0 check (price >= 0),
  billing_period  billing_period not null,
  min_quantity    int not null default 1 check (min_quantity >= 1),
  available_from  date not null default current_date,
  available_to    date,
  auto_close      boolean not null default false,   -- closes itself after expiry
  closable        boolean not null default true,    -- can be closed early
  pausable        boolean not null default false,
  renewable       boolean not null default false,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  check (available_to is null or available_to >= available_from)
);

create table quotation_templates (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  validity_days  int not null check (validity_days > 0),
  plan_id        uuid not null references plans(id),
  notes          text,
  active         boolean not null default true
);

create table quotation_template_lines (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid not null references quotation_templates(id) on delete cascade,
  product_id   uuid not null references products(id),
  variant_id   uuid references product_variants(id),
  quantity     int not null default 1 check (quantity > 0),
  position     int not null default 0
);

create table discounts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  kind          discount_kind not null,
  value         numeric(12,2) not null check (value > 0),
  scope         discount_scope not null,
  min_purchase  numeric(12,2) not null default 0 check (min_purchase >= 0),
  min_quantity  int not null default 0 check (min_quantity >= 0),
  starts_on     date,
  ends_on       date,
  usage_limit   int check (usage_limit is null or usage_limit > 0),
  used_count    int not null default 0 check (used_count >= 0),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table discount_products (
  discount_id uuid not null references discounts(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  primary key (discount_id, product_id)
);

-- Scope 'subscription': rows here limit the discount to those subscriptions. No rows means every subscription.
create table discount_subscriptions (
  discount_id     uuid not null references discounts(id) on delete cascade,
  subscription_id uuid not null,
  primary key (discount_id, subscription_id)
);

create table app_settings (
  key    text primary key,
  value  jsonb not null
);
insert into app_settings(key, value) values
  ('auto_confirm_invoices', 'false'::jsonb),
  ('currency', '"INR"'::jsonb),
  ('company_name', '"Brightloop Software"'::jsonb);

-- ---------- subscriptions ----------
create table subscriptions (
  id               uuid primary key default gen_random_uuid(),
  number           text not null unique default ('SUB-' || lpad(nextval('sub_number_seq')::text, 6, '0')),
  customer_id      uuid not null references customers(id),
  plan_id          uuid not null references plans(id),
  template_id      uuid references quotation_templates(id),
  payment_term_id  uuid not null references payment_terms(id),
  status           sub_status not null default 'draft',
  start_date       date not null,
  expiry_date      date not null,
  anchor_date      date not null,              -- billing cycles are counted from here
  cycles_billed    int not null default 0,
  next_invoice_date date,                      -- null means nothing left to bill
  quote_valid_until date,
  notes            text,
  created_by       uuid references profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (expiry_date > start_date)
);

alter table discount_subscriptions
  add constraint discount_subscriptions_sub_fk foreign key (subscription_id) references subscriptions(id) on delete cascade;

create or replace function sub_before_insert() returns trigger language plpgsql as $$
begin
  new.anchor_date := coalesce(new.anchor_date, new.start_date);
  return new;
end $$;
create trigger trg_sub_before_insert before insert on subscriptions
for each row execute function sub_before_insert();

create table subscription_lines (
  id               uuid primary key default gen_random_uuid(),
  subscription_id  uuid not null references subscriptions(id) on delete cascade,
  product_id       uuid references products(id),
  variant_id       uuid references product_variants(id),
  description      text not null,               -- snapshot, so customers never need product access
  quantity         int not null check (quantity > 0),
  unit_price       numeric(12,2) not null check (unit_price >= 0),
  tax_id           uuid references taxes(id),
  position         int not null default 0
);

create table subscription_status_history (
  id               uuid primary key default gen_random_uuid(),
  subscription_id  uuid not null references subscriptions(id) on delete cascade,
  from_status      sub_status,
  to_status        sub_status not null,
  changed_by       uuid,
  changed_at       timestamptz not null default now()
);

-- status history plus transition guard
create or replace function sub_status_guard() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    if not (
      (old.status = 'draft'     and new.status in ('quotation','closed')) or
      (old.status = 'quotation' and new.status in ('draft','confirmed','closed')) or
      (old.status = 'confirmed' and new.status in ('active','closed')) or
      (old.status = 'active'    and new.status in ('paused','closed')) or
      (old.status = 'paused'    and new.status in ('active','closed'))
    ) then
      raise exception 'Illegal subscription transition % to %', old.status, new.status;
    end if;
    insert into subscription_status_history(subscription_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end $$;
create trigger trg_sub_status_guard before update on subscriptions
for each row execute function sub_status_guard();

create or replace function sub_status_history_first() returns trigger language plpgsql as $$
begin
  insert into subscription_status_history(subscription_id, from_status, to_status, changed_by)
  values (new.id, null, new.status, auth.uid());
  return new;
end $$;
create trigger trg_sub_history_first after insert on subscriptions
for each row execute function sub_status_history_first();

-- lines are editable only while the subscription is draft or quotation
create or replace function sub_lines_lock() returns trigger language plpgsql as $$
declare v_status sub_status; v_id uuid;
begin
  v_id := coalesce(new.subscription_id, old.subscription_id);
  select status into v_status from subscriptions where id = v_id;
  if v_status not in ('draft','quotation') then
    raise exception 'Subscription lines are locked once the subscription is %', v_status;
  end if;
  return coalesce(new, old);
end $$;
create trigger trg_sub_lines_lock before insert or update or delete on subscription_lines
for each row execute function sub_lines_lock();

-- ---------- invoices ----------
create table invoices (
  id              uuid primary key default gen_random_uuid(),
  number          text not null unique default ('INV-' || lpad(nextval('inv_number_seq')::text, 6, '0')),
  subscription_id uuid not null references subscriptions(id),
  customer_id     uuid not null references customers(id),
  status          invoice_status not null default 'draft',
  invoice_date    date not null default current_date,
  due_date        date not null,
  period_start    date not null,
  period_end      date not null,
  subtotal        numeric(12,2) not null default 0,
  discount_total  numeric(12,2) not null default 0,
  tax_total       numeric(12,2) not null default 0,
  total           numeric(12,2) not null default 0,
  amount_paid     numeric(12,2) not null default 0,
  discount_id     uuid references discounts(id),   -- subscription level discount used, if any
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  check (amount_paid >= 0 and amount_paid <= total),
  check (period_end >= period_start)
);

-- Billing guard: one live invoice per subscription per period start.
create unique index uq_invoice_sub_period on invoices(subscription_id, period_start) where status <> 'cancelled';

create table invoice_lines (
  id              uuid primary key default gen_random_uuid(),
  invoice_id      uuid not null references invoices(id) on delete cascade,
  product_id      uuid references products(id),
  variant_id      uuid references product_variants(id),
  description     text not null,
  quantity        int not null,
  unit_price      numeric(12,2) not null,
  gross           numeric(12,2) generated always as (round(quantity * unit_price, 2)) stored,
  discount_id     uuid references discounts(id),   -- product level discount used, if any
  discount_amount numeric(12,2) not null default 0,
  tax_id          uuid references taxes(id),
  tax_rate        numeric(6,3) not null default 0,
  tax_amount      numeric(12,2) not null default 0,
  line_total      numeric(12,2) not null default 0,
  position        int not null default 0
);

create or replace function invoice_guard() returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'draft'     and new.status in ('confirmed','cancelled')) or
      (old.status = 'confirmed' and new.status in ('paid','cancelled')) or
      (old.status = 'paid'      and new.status = 'confirmed'
         and coalesce(current_setting('app.allow_unpay', true), '') = 'on')
    ) then
      raise exception 'Illegal invoice transition % to %', old.status, new.status;
    end if;
    if new.status = 'cancelled' and old.amount_paid > 0 then
      raise exception 'Cannot cancel an invoice that has payments';
    end if;
    if new.status = 'paid' and new.amount_paid <> new.total then
      raise exception 'Invoice is not fully paid';
    end if;
  end if;
  -- money fields are frozen after draft
  if old.status <> 'draft' and (
       new.subtotal <> old.subtotal or new.discount_total <> old.discount_total or
       new.tax_total <> old.tax_total or new.total <> old.total) then
    raise exception 'Invoice amounts are frozen after draft';
  end if;
  return new;
end $$;
create trigger trg_invoice_guard before update on invoices
for each row execute function invoice_guard();

-- ---------- payments ----------
create table payments (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id),
  method      pay_method not null,
  amount      numeric(12,2) not null check (amount > 0),
  paid_on     date not null default current_date,
  note        text,
  recorded_by uuid references profiles(id),
  created_at  timestamptz not null default now()
);

create or replace function payment_apply() returns trigger language plpgsql security definer set search_path = public as $$
declare inv invoices%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into inv from invoices where id = new.invoice_id for update;
    if inv.status <> 'confirmed' then
      raise exception 'Payments can only be recorded against confirmed invoices (invoice is %)', inv.status;
    end if;
    if inv.amount_paid + new.amount > inv.total then
      raise exception 'Payment exceeds the amount due (%)', inv.total - inv.amount_paid;
    end if;
    update invoices
       set amount_paid = amount_paid + new.amount,
           status = case when amount_paid + new.amount = total then 'paid'::invoice_status else status end
     where id = inv.id;
    return new;
  elsif tg_op = 'DELETE' then
    select * into inv from invoices where id = old.invoice_id for update;
    perform set_config('app.allow_unpay', 'on', true);
    update invoices
       set amount_paid = amount_paid - old.amount,
           status = case when status = 'paid' then 'confirmed'::invoice_status else status end
     where id = inv.id;
    return old;
  end if;
  return null;
end $$;
-- The DELETE path sets the transaction-local flag app.allow_unpay so invoice_guard permits paid to confirmed.
create trigger trg_payment_apply after insert or delete on payments
for each row execute function payment_apply();

-- ---------- billing audit ----------
create table billing_runs (
  id        uuid primary key default gen_random_uuid(),
  ran_at    timestamptz not null default now(),
  created   int not null default 0,
  failed    int not null default 0,
  detail    jsonb not null default '[]'::jsonb
);

-- ---------- indexes ----------
create index idx_sub_customer       on subscriptions(customer_id);
create index idx_sub_status         on subscriptions(status);
create index idx_sub_due            on subscriptions(next_invoice_date) where status = 'active';
create index idx_sub_lines_sub      on subscription_lines(subscription_id);
create index idx_inv_customer       on invoices(customer_id);
create index idx_inv_sub            on invoices(subscription_id);
create index idx_inv_status_due     on invoices(status, due_date);
create index idx_inv_date           on invoices(invoice_date);
create index idx_inv_lines_inv      on invoice_lines(invoice_id);
create index idx_pay_invoice        on payments(invoice_id);
create index idx_pay_date           on payments(paid_on);
create index idx_cust_user          on customers(user_id);
create index idx_history_sub        on subscription_status_history(subscription_id);
create index idx_variants_product   on product_variants(product_id);
