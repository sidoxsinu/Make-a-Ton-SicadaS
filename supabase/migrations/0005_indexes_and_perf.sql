-- ============================================================================
-- Migration 0005: Performance Indexes, Trigram Search, and Query Acceleration
-- Authored by: Roshan (SicadaS Team - Backend & Database Infrastructure)
-- ============================================================================

-- 1. Enable pg_trgm for fast customer search across large customer datasets
create extension if not exists pg_trgm;

-- 2. GIN Trigram indexes on customer name and email
create index if not exists idx_customers_name_trgm on customers using gin (name gin_trgm_ops);
create index if not exists idx_customers_email_trgm on customers using gin (email gin_trgm_ops);

-- 3. Composite index on subscriptions for rapid status & customer queries
create index if not exists idx_subs_cust_status on subscriptions(customer_id, status);

-- 4. Filtered index for active subscriptions to accelerate MRR and billing aggregations
create index if not exists idx_subs_active_mrr on subscriptions(plan_id, status) where status = 'active';

-- 5. Composite index on invoices for overdue queries and collection tracking
create index if not exists idx_invoices_confirmed_due on invoices(status, due_date) where status = 'confirmed';

-- 6. Index on payments for rapid receipt ledger filtering and reporting
create index if not exists idx_payments_date_method on payments(payment_date desc, payment_method);

-- 7. Diagnostic helper function to inspect query planner execution times
create or replace function explain_plan(p_query text) returns table(plan_line text)
language plpgsql security definer set search_path = public as $$
begin
  if not is_team() then raise exception 'Not allowed'; end if;
  return query execute 'EXPLAIN (ANALYZE, BUFFERS) ' || p_query;
end $$;

