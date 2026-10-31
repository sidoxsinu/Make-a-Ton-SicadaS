# 03. Data Model and Business Rules

The executable source of truth is in `supabase/migrations/0001` to `0004`. This file explains it and fixes the rules the build must keep.

## 1. Entities

| Table | Purpose | Key fields |
|---|---|---|
| profiles | One row per auth user | id, full_name, role (admin, staff, customer) |
| customers | Billing party | name, email (unique, case insensitive), phone, company, address, tax_number, user_id (nullable) |
| payment_terms | Due date rule | name, days |
| taxes | Tax rates | name, rate (percent), active |
| products | Sellable item | name, type, sales_price, cost_price, default_tax_id, notes, active |
| product_variants | Price adjustments | product_id, attribute, value, extra_price |
| plans | Billing cadence and rules | name, price, billing_period, min_quantity, available_from, available_to, auto_close, closable, pausable, renewable |
| quotation_templates and lines | Reusable offer | name, validity_days, plan_id; lines: product, variant, quantity |
| discounts | Rules | kind, value, scope, min_purchase, min_quantity, starts_on, ends_on, usage_limit, used_count; link tables to products and to subscriptions |
| subscriptions | Contract | number, customer, plan, status, start_date, expiry_date, anchor_date, cycles_billed, next_invoice_date, payment term, quote_valid_until |
| subscription_lines | Contract lines | description snapshot, quantity, unit_price, tax_id |
| subscription_status_history | Audit | from_status, to_status, changed_by, changed_at |
| invoices | Bill for one period | number, subscription, customer, status, invoice_date, due_date, period_start, period_end, subtotal, discount_total, tax_total, total, amount_paid, sent_at |
| invoice_lines | Bill lines | description, quantity, unit_price, gross (generated), discount_amount, tax_rate, tax_amount, line_total |
| payments | Money received | invoice_id, method, amount, paid_on, note, recorded_by |
| billing_runs | Job log | created, failed, detail |
| app_settings | Key value | auto_confirm_invoices, currency, company_name |

Relationships: customer 1..n subscriptions 1..n invoices 1..n payments. Subscription 1..n lines. Invoice 1..n lines. Product 1..n variants. Discount n..n products and n..n subscriptions.

## 2. State machines

Subscription
```
Draft -> Quotation -> Confirmed -> Active -> Closed
Quotation -> Draft            (rework)
Active    -> Paused           (pausable plans only)
Paused    -> Active           (resume)
Draft, Quotation, Confirmed, Active, Paused -> Closed
```
- Draft to Quotation and Quotation to Confirmed run the readiness check (FR-SUB-7).
- Confirmed to Active sets anchor_date = start_date, cycles_billed = 0, next_invoice_date = start_date.
- Active to Paused clears next_invoice_date. Paused to Active sets anchor_date = today, cycles_billed = 0, next_invoice_date = today (if not past expiry).
- Closed clears next_invoice_date. Closing an active or paused subscription needs plan.closable.
- Lines are locked outside Draft and Quotation.

Invoice
```
Draft -> Confirmed -> Paid
Draft -> Cancelled
Confirmed -> Cancelled (only when amount_paid = 0)
Paid -> Confirmed (only through admin payment deletion)
```
- Paid is set by the payment trigger when amount_paid equals total. A zero total invoice is closed with `mark_zero_invoice_paid`.
- Overdue is `status = confirmed and due_date < today`. Shown as a badge on top of Confirmed, never stored.

## 3. Billing algorithm (what generate_invoice does)

Inputs: subscription id. Runs under an advisory lock and a row lock.

1. Skip unless status is Active and next_invoice_date is today or earlier.
2. period_start = next_invoice_date. next boundary = add_periods(anchor_date, period, cycles_billed + 1). period_end = min(boundary minus 1 day, expiry_date). If boundary is after expiry, next_invoice_date becomes null after this invoice.
3. Create the invoice with invoice_date today and due_date = today + payment term days.
4. Copy subscription lines to invoice lines (description, quantity, unit_price, tax rate).
5. Product discount per line: among active discounts of scope product, in date range, with uses left, covering the line product, with quantity >= min_quantity and gross >= min_purchase, take the one giving the largest amount. Fixed amount is capped at the line gross. Percent is round(gross x value / 100, 2).
6. Subscription discount: sum net lines after step 5. Among active, in range, with uses left, quantity and min_purchase met, and either listed for this subscription or listing no subscriptions, take the largest. Spread the amount over lines in proportion to net, remainder to the last line, never above a line net.
7. Tax per line = round((gross minus discount) x rate / 100, 2), half up. Line total = net + tax.
8. Invoice totals are sums of line values.
9. used_count + 1 for each distinct discount used on the invoice.
10. cycles_billed + 1, next_invoice_date set. If auto_confirm_invoices is true the invoice becomes Confirmed.

The daily job loops subscriptions due today or earlier, repeating generation until the subscription is current (maximum 60 periods per subscription per run), isolates errors per subscription, writes a billing_runs row, then closes auto close plans whose expiry has passed and whose last invoice exists.

## 4. Idempotency and "nothing twice, nothing skipped"

- Twice: `uq_invoice_sub_period` rejects a second live invoice for the same subscription and period start. The subscription row is locked while generating, so two runs cannot interleave.
- Skipped: next_invoice_date is advanced only in the same transaction that creates the invoice. A failed generation rolls back both, leaves the subscription due, and is retried on the next run. Errors appear in the Billing Runs screen.
- Date drift: periods are always counted from anchor_date. Example for a monthly subscription anchored on 2026-01-31: 2026-01-31, 2026-02-28, 2026-03-31, 2026-04-30.

## 5. Price and tax formulas

```
line price      = product.sales_price + variant.extra_price      (copied into subscription line at creation)
gross           = round(quantity x unit_price, 2)
net             = gross - discount_amount
tax_amount      = round(net x tax_rate / 100, 2)                  (half up)
line_total      = net + tax_amount
invoice.total   = sum(line_total)
```
MRR (monthly recurring revenue) = sum over active subscription lines of quantity x unit_price x factor, where factor is 365/12 for daily, 52/12 for weekly, 1 for monthly, 1/12 for yearly. Tax and discounts are excluded from MRR.

## 6. Permission rules in the database

- Admin: everything.
- Staff: read catalog, discounts, settings. Write customers, subscriptions (draft fields only, state through RPC), invoice status, payments.
- Customer: select rows tied to their customer record. Actions only through `customer_sub_action` and `update_my_details`.
- Nobody can change invoice money fields after Draft. Nobody can insert invoices except the billing function.

## 7. Edge cases the build must handle

| Case | Expected result |
|---|---|
| Plan has available_to before subscription start | Rejected at Quotation. |
| Quantity below plan minimum | Rejected at Quotation with the minimum shown. |
| Discount usage limit reached mid batch | The next invoice in the batch gets no discount. Count never exceeds the limit. |
| Discount fixed amount larger than the line | Capped at the line gross. |
| 100 percent discount | Total 0, invoice confirmed, closed with the zero invoice action. |
| Payment larger than amount due | Rejected with the remaining amount in the message. |
| Payment on Draft or Cancelled invoice | Rejected. |
| Job runs twice the same day | Second run creates nothing. |
| Job missed three days | Catch up invoices are created, each for its own period, invoice_date today. |
| Customer email already registered | No second account is created. Signup shows the neutral message in 04 section 1. |
| Quotation past validity | Cannot be confirmed. |
| Auto close plan past expiry with last invoice created | Subscription becomes Closed on the next job run. |
| Staff tries to create a discount | Database rejects it. UI hides the button. |
