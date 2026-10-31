# 07. Tests and Acceptance

Nothing is "done" until its rows here pass. Tests are free tools only: Vitest, Playwright, and SQL run in the Supabase SQL editor or the local Supabase CLI.

## 1. Acceptance criteria by scene

| ID | Requirement | Pass condition |
|---|---|---|
| AC-AUTH-1 | FR-AUTH-1 | Signing up twice with the same email, in any letter case, never creates a second account. |
| AC-AUTH-2 | FR-AUTH-2 | Password table in section 3 gives the listed result in the form, the server action and a direct Auth API call. |
| AC-AUTH-3 | FR-AUTH-3 | Forgot password delivers a link to the registered inbox. Link opens /reset-password. New password works. Old password stops working. |
| AC-AUTH-4 | FR-AUTH-4, 5 | A new signup has role customer. No UI or API call from a non admin can produce staff or admin. Admin creates staff and the staff can log in. |
| AC-AUTH-5 | FR-AUTH-6 | Customer opening /dashboard lands on /portal. Staff opening /staff gets 403. |
| AC-CAT-1 | FR-CAT-1, 2 | Product with variant Brand = Odoo (+560) and sales price 1000 yields a subscription line price of 1560. |
| AC-CAT-2 | FR-CAT-3, 4 | Plan saves period, minimum quantity, dates and four switches. Each switch changes the available actions on a subscription of that plan. |
| AC-CAT-3 | FR-CAT-6 | A customer session cannot read the products table or cost price. |
| AC-SUB-1 | FR-SUB-2 | Create from template copies plan fee line, product lines, taxes and sets quote_valid_until = today plus validity days. |
| AC-SUB-2 | FR-SUB-4 | Every illegal move in the matrix (section 5) is rejected. Every legal move succeeds and writes a history row. |
| AC-SUB-3 | FR-SUB-6 | Editing lines on a Confirmed subscription fails with a clear message. |
| AC-SUB-4 | FR-SUB-7 | Quantity under plan minimum, start date outside plan window, expired quotation, zero lines each block the move with the expected message. |
| AC-SUB-5 | FR-SUB-8 | Pause, close early, renew buttons appear only when the plan switch is on. The database also refuses when called directly. |
| AC-INV-1 | FR-INV-1 | Running billing with 200 due subscriptions creates 200 invoices with customer, lines, tax and totals filled. |
| AC-INV-2 | FR-INV-2 | Running billing twice the same day creates no new invoices. Two concurrent runs create no duplicates. |
| AC-INV-3 | FR-INV-3 | A subscription due 3 periods ago gets 3 invoices with correct period ranges after one run. One subscription forced to fail does not stop the rest, and appears in the Billing runs screen. |
| AC-INV-4 | FR-INV-4 | Golden vectors V1 to V6 produce the exact numbers in section 2. |
| AC-INV-5 | FR-INV-5, 6 | Confirm, cancel, send, print work. Totals cannot be edited after Draft, even by direct SQL as the authenticated role. |
| AC-DSC-1 | FR-DSC-1 | Staff session cannot insert or update a discount (UI hidden, database rejects). |
| AC-DSC-2 | FR-DSC-2, 3 | A product discount applies only to listed products. A subscription discount applies to whole subscriptions. Both appear on the next invoice without manual steps. |
| AC-DSC-3 | FR-DSC-3, 4 | Expired, inactive, not started, and exhausted discounts do not apply. Usage limit 2 with 3 due subscriptions gives 2 discounted invoices and used_count 2. |
| AC-PAY-1 | FR-PAY-1, 2 | Partial then final payment turns the invoice Paid at the exact total. Overpayment is rejected. Payment on a Draft invoice is rejected. |
| AC-PAY-2 | FR-PAY-3 | Confirmed invoices past due show Overdue. Paid invoices never show Overdue. |
| AC-PAY-3 | FR-PAY-4 | Admin deletes a payment, the invoice returns to Confirmed with the right amount due. Staff cannot delete. |
| AC-RPT-1 | FR-RPT-1 to 3 | Dashboard figures equal independent SQL sums on the same data (section 4). |
| AC-RPT-2 | FR-RPT-4 | CSV for a filtered invoice list contains exactly the rows on screen across all pages. |
| AC-RPT-3 | FR-RPT-5 | Performance table in section 6 is met. |
| AC-POR-1 | FR-POR-1, 2 | Customer A sees only A rows. Customer A direct requests for B ids return nothing. Allowed portal actions work. |

## 2. Golden vectors for pricing (unit tests and SQL tests)

Setup: tax GST 18 (18 percent), product "Odoo CRM" sales price 1000, default tax GST 18, variant Brand = Odoo extra 560. Monthly plan with plan price 0.

| Vector | Input | Expected |
|---|---|---|
| V1 | One line, quantity 10, unit price 1560, tax 18, no discount | gross 15,600.00, discount 0.00, tax 2,808.00, total 18,408.00 |
| V2 | V1 plus product discount 10 percent, minimum quantity 5 | discount 1,560.00, tax 2,527.20, total 16,567.20 |
| V3 | V2 plus subscription discount fixed 500 | line discount 2,060.00, net 13,540.00, tax 2,437.20, total 15,977.20, discount_total 2,060.00 |
| V4 | One line, quantity 3, unit price 33.33, tax 5 | gross 99.99, tax 5.00 (4.9995 rounds half up), total 104.99 |
| V5 | Line A gross 100.00, line B gross 200.00, no tax, subscription discount fixed 10.00 | Line A discount 3.33, line B discount 6.67, invoice total 290.00 |
| V6 | One line gross 50.00, product discount fixed 80.00 | discount 50.00, total 0.00 |
| V7 | Monthly, anchor 2026-01-31 | Invoice period starts 2026-01-31, 2026-02-28, 2026-03-31, 2026-04-30. First period ends 2026-02-27, second ends 2026-03-30 |
| V8 | `add_periods` yearly from 2024-02-29 for n = 1, 2, 4 | 2025-02-28, 2026-02-28, 2028-02-29 |
| V9 | `add_periods` from 2026-10-31: weekly n = 2, daily n = 3 | weekly 2026-11-14, daily 2026-11-03 |
| V10 | MRR: monthly line 500, yearly line 12000, weekly line 100, daily line 10, one quantity each | 2,237.50 |

`lib/pricing.ts` must reproduce V1 to V4 for the editor preview (without discounts for V1 and V4). A Vitest file `pricing.parity.test.ts` stores V1 and V4 and the SQL test file stores V1 to V10.

## 3. Password rule table

| Password | Expected | Reason |
|---|---|---|
| Abcdefg1! | pass | 9 characters, all classes |
| Abcdefg! | fail | 8 characters |
| abcdefgh1! | fail | no uppercase |
| ABCDEFGH1! | fail | no lowercase |
| Abcdefgh12 | fail | no special character |

## 4. Independent report checks

After loading the perf seed, run in SQL and compare with the dashboard JSON:
```sql
select count(*) from subscriptions where status = 'active';
select coalesce(sum(total - amount_paid), 0) from invoices where status = 'confirmed';
select coalesce(sum(amount), 0) from payments where paid_on between :from and :to;
select count(*), coalesce(sum(total - amount_paid), 0) from invoices where status = 'confirmed' and due_date < current_date;
```
Each result must equal the corresponding dashboard value to the cent.

## 5. Transition matrix tests

Subscription legal: draft to quotation, draft to closed, quotation to draft, quotation to confirmed, quotation to closed, confirmed to active, confirmed to closed, active to paused, active to closed, paused to active, paused to closed.
Subscription illegal examples (must raise): draft to confirmed, draft to active, confirmed to quotation, active to draft, closed to anything.
Invoice legal: draft to confirmed, draft to cancelled, confirmed to paid (via full payment), confirmed to cancelled (no payments).
Invoice illegal: paid to cancelled, confirmed to draft, cancelled to anything, confirmed to cancelled with payments.

## 6. Security tests (RLS matrix)

Run as three real users through the Supabase client, not the SQL editor.

| Action | admin | staff | customer A | anon |
|---|---|---|---|---|
| select own customer row | yes | yes | yes | no |
| select another customer row | yes | yes | no | no |
| select products | yes | yes | no | no |
| insert product | yes | no | no | no |
| insert discount | yes | no | no | no |
| select own invoices | yes | yes | yes | no |
| select another customer invoices | yes | yes | no | no |
| update invoice total | no | no | no | no |
| update subscription status directly | no | no | no | no |
| `sub_transition` via RPC | yes | yes | no | no |
| `customer_sub_action` on own subscription | n/a | n/a | yes if plan allows | no |
| `customer_sub_action` on another customer subscription | n/a | n/a | no | no |
| call `generate_invoice` | no | no | no | no |
| `run_billing` | yes | yes | no | no |
| set own role to admin | no | no | no | no |

## 7. Performance budget (AC-RPT-3)

Dataset: `0005_perf_seed.sql` (10,000 customers, 10,000 active subscriptions, 30,000 invoices, about 18,000 payments).
Method: Playwright loads each page 20 times warm, records time to the end of the main table render. Pass when p95 is under 2.0 seconds. The first request after idle (serverless cold start) is recorded and reported separately.

| Page | Query focus | DB time target |
|---|---|---|
| /dashboard | dashboard_summary | under 300 ms |
| /subscriptions (default, status filter, customer search) | indexed range and ilike on number | under 150 ms |
| /invoices (default, overdue filter, date range) | `idx_inv_status_due`, `idx_inv_date` | under 150 ms |
| /payments (date range) | `idx_pay_date` | under 150 ms |
| /customers (search) | name search with trigram index if needed | under 150 ms |
| /portal | own rows by customer_id | under 100 ms |

Method for database time: `explain (analyze, buffers)` on the exact queries issued by the pages. If a query uses a sequential scan on a large table, add the index in a new migration `0006_indexes.sql` and record it in the build log. Customer name search above 10,000 rows may need `create extension pg_trgm` and a trigram index; free tier supports it.

## 8. End to end journeys (Playwright)

| ID | Journey |
|---|---|
| J1 | Signup with a bad then good password, confirm, log in, see portal. |
| J2 | Forgot password flow using the Supabase local mail inbox (Inbucket in the CLI) or a test mailbox. |
| J3 | Admin adds staff, staff logs in, staff cannot see Staff or Settings write. |
| J4 | Admin creates product with variant, plan with switches, template. |
| J5 | Staff creates subscription from template, walks Draft to Active, history shows 4 rows. |
| J6 | Billing run creates invoice for the subscription, staff confirms, sends (mail captured), prints. |
| J7 | Admin creates discount, next billing shows the discount, usage count increases. |
| J8 | Staff records two payments, invoice becomes Paid, overdue list updates, dashboard values change. |
| J9 | Customer portal: sees own data only, pauses a pausable subscription, tries a non allowed action and sees it hidden. |

## 9. Unit tests (Vitest)

`passwordSchema`, `pricing.ts`, `money.ts`, `dates.ts` (add periods, parity with SQL cases V7 to V9), `roles.ts` permission map, `csv.ts` escaping (commas, quotes, newlines), resource schema validation for each resource, filter param parsing.

## 10. Definition of done for the whole project

1. All AC rows pass. 2. `npm run check:bans`, `npm run lint`, `npm run typecheck`, `npm test` and `npm run e2e` pass. 3. Migrations apply cleanly on an empty Supabase project from 0001 to 0004. 4. README explains setup in under 15 steps with free accounts only. 5. No secret in git history. 6. Perf table met and numbers recorded in `docs/BUILD_LOG.md`.
