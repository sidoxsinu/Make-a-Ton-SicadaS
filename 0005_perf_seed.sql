-- 0005_perf_seed.sql
-- Load test data for the two second page budget. Run on a throwaway Supabase project or a local branch, never on real data.
-- Produces 10,000 customers, 10,000 active subscriptions, 30,000 invoices and about 18,000 payments.
-- Rows are labelled with the example.test domain so they can be removed with the cleanup block at the bottom.

insert into plans(name, price, billing_period) values ('Perf Monthly', 0, 'monthly') on conflict (name) do nothing;

insert into customers(name, email, company)
select 'Perf Customer ' || g, 'perf' || g || '@example.test', 'Perf Company ' || g
from generate_series(1, 10000) g;

insert into subscriptions(customer_id, plan_id, payment_term_id, status, start_date, expiry_date)
select c.id,
       (select id from plans where name = 'Perf Monthly'),
       (select id from payment_terms where name = 'Net 30'),
       'draft',
       date '2026-04-01' + (row_number() over (order by c.id))::int % 150,
       date '2027-12-31'
from customers c where c.email like 'perf%@example.test';

insert into subscription_lines(subscription_id, description, quantity, unit_price, position)
select s.id, 'Perf seat licence', 1 + (row_number() over (order by s.id))::int % 20, 500, 1
from subscriptions s join customers c on c.id = s.customer_id
where c.email like 'perf%@example.test';

-- walk the legal transitions so the guards are exercised
update subscriptions set status = 'quotation' where customer_id in (select id from customers where email like 'perf%@example.test');
update subscriptions set status = 'confirmed' where customer_id in (select id from customers where email like 'perf%@example.test');
update subscriptions set status = 'active', anchor_date = start_date, cycles_billed = 3, next_invoice_date = (start_date + interval '3 months')::date
 where customer_id in (select id from customers where email like 'perf%@example.test');

-- three invoices per subscription, confirmed, mixed due dates
insert into invoices(subscription_id, customer_id, status, invoice_date, due_date, period_start, period_end, subtotal, total)
select s.id, s.customer_id, 'confirmed', x.d, x.d + 30, x.d, (x.d + interval '1 month')::date - 1,
       sl.quantity * sl.unit_price, sl.quantity * sl.unit_price
from subscriptions s
join customers c on c.id = s.customer_id
join subscription_lines sl on sl.subscription_id = s.id
cross join generate_series(0, 2) k
cross join lateral (select (s.start_date + make_interval(months => k))::date as d) x
where c.email like 'perf%@example.test';

insert into invoice_lines(invoice_id, description, quantity, unit_price, line_total, position)
select i.id, 'Perf seat licence', 1, i.total, i.total, 1
from invoices i join customers c on c.id = i.customer_id
where c.email like 'perf%@example.test';

-- about 60 percent of invoices get a full payment, the payment trigger flips them to paid
insert into payments(invoice_id, method, amount, paid_on, note)
select q.id,
       (array['bank_transfer','upi','card','cash','cheque']::pay_method[])[1 + (q.rn % 5)::int],
       q.total, least(current_date, q.invoice_date + 5), 'perf seed'
from (
  select i.id, i.total, i.invoice_date, row_number() over (order by i.id) as rn
  from invoices i join customers c on c.id = i.customer_id
  where c.email like 'perf%@example.test'
) q
where q.rn % 10 < 6 and q.total > 0;

-- cleanup (run when finished). If deleting subscriptions is blocked by the line lock trigger, run
-- alter table subscription_lines disable trigger trg_sub_lines_lock;  before the deletes and
-- alter table subscription_lines enable trigger trg_sub_lines_lock;   after them.
-- delete from payments where note = 'perf seed';
-- delete from invoices where customer_id in (select id from customers where email like 'perf%@example.test');
-- delete from subscriptions where customer_id in (select id from customers where email like 'perf%@example.test');
-- delete from customers where email like 'perf%@example.test';
-- delete from plans where name = 'Perf Monthly';
