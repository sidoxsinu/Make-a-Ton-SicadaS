-- supabase/seed.sql
-- Idempotent baseline seed data for development and demonstration environments.

-- 1. Standard Payment Terms
insert into payment_terms (name, days) values
  ('Immediate', 0),
  ('Net 15', 15),
  ('Net 30', 30),
  ('Net 60', 60)
on conflict do nothing;

-- 2. GST and Standard Tax Tiers
insert into taxes (name, rate, active) values
  ('GST 18%', 18.00, true),
  ('GST 12%', 12.00, true),
  ('GST 5%', 5.00, true),
  ('Exempt / Zero Tax', 0.00, true)
on conflict do nothing;

-- 3. Default Application Settings
insert into app_settings (key, value) values
  ('auto_confirm_invoices', 'true'),
  ('currency', 'INR'),
  ('company_name', 'Brightloop SMS Technologies Private Limited')
on conflict (key) do nothing;

