# 01. Product Requirements: Brightloop Subscription Management System

Version 1.0. Source: Subscription_Management_System.pdf (problem statement). Reading order: 00, 01, 02, 03, 04, 05, 06, 07, 08, then MASTER_PROMPT.

## 1. Purpose

One web platform that runs the whole life of a subscription business: catalog setup, quotations, subscriptions, automatic invoicing, payment recording, discounts, taxes, a customer portal and a finance dashboard.

Problems it removes (from the statement): subscriptions in a spreadsheet, missed renewals, hand typed invoices, payments matched by scrolling bank statements, quarterly manual revenue reports, no number for recurring revenue.

## 2. Hard constraints

| ID | Constraint |
|----|-----------|
| C-1 | Zero spend. Every tool, service and library must be free with no credit card. No paid plan, no per-transaction fee feature. |
| C-2 | Every list and dashboard page responds in under 2 seconds with 10,000 subscriptions and 30,000 invoices loaded. |
| C-3 | Minimal code change: new modules are configuration over shared components. Business logic lives in one place. |
| C-4 | Visual rules in 05_DESIGN_SYSTEM.md are binding. Banned items must not appear anywhere. |
| C-5 | Customers can see only their own data. Enforced in the database, not only in the UI. |

## 3. Personas and permissions

| Capability | Admin | Staff | Customer |
|---|---|---|---|
| Sign up, log in, reset password | yes | yes | yes |
| Add staff members | yes | no | no |
| Products, variants, plans, taxes, payment terms, quotation templates | create, edit, delete | read | none |
| Discount rules | create, edit, delete | read | none |
| Customers | all | create, edit, read | own record only |
| Subscriptions | all | create, edit, move through states | own, read, plus pause, resume, close, renew where the plan allows |
| Invoices | all | confirm, cancel, send, print, bulk confirm | own, read, print |
| Payments | record, delete | record | read own |
| Dashboard and reports | yes | yes | no |
| App settings | yes | read | none |

## 4. Scope by scene

Each scene in the statement maps to a module. Requirement IDs are used in tests (07) and build phases (08).

### 4.1 A new customer signs up (AUTH)
- FR-AUTH-1 Sign up with email and password. One account per email, case insensitive.
- FR-AUTH-2 Password must have at least 9 characters (decision D-01: "more than eight"), one uppercase letter, one lowercase letter, one special character. Validated in the form, in the server action and in the Supabase Auth password settings.
- FR-AUTH-3 Forgot password sends a reset link to the registered email. The reset page sets a new password under the same rules.
- FR-AUTH-4 Roles: admin, staff, customer. A new signup is always a customer. A customer row is created or linked by email automatically.
- FR-AUTH-5 Only an admin can add staff. Staff are created by a server action using the Admin API. There is no public path to a staff or admin role.
- FR-AUTH-6 Route access is decided by role. Team users go to the team app, customers go to the portal.

### 4.2 Launching a new plan (CAT)
- FR-CAT-1 Product: name, type, sales price, cost price, notes, default tax, active flag.
- FR-CAT-2 Variants per product: attribute, value, extra price. Example: Brand = Odoo adds 560. Line price is sales price plus variant extra price.
- FR-CAT-3 Plan: name, price, billing period (daily, weekly, monthly, yearly), minimum quantity, available from and to dates.
- FR-CAT-4 Per plan switches decided by the admin: auto close at end, closable early, pausable, renewable.
- FR-CAT-5 Taxes (name, rate), payment terms (name, days) managed by the admin.
- FR-CAT-6 Cost price is never exposed to customers.

### 4.3 Turning a quote into a subscription (SUB)
- FR-SUB-1 Quotation template: name, validity in days, plan, product lines with quantity and optional variant.
- FR-SUB-2 Create a subscription from a template in one action. It copies plan, lines, taxes and sets a quote validity date.
- FR-SUB-3 Subscription fields: auto number (SUB-000001), customer, plan, start date, expiry date, payment terms, lines (product, quantity, unit price, tax, amount).
- FR-SUB-4 States: Draft, Quotation, Confirmed, Active, Closed, plus Paused for pausable plans (D-10). Illegal moves are rejected by the database.
- FR-SUB-5 Status history is stored and shown on the detail page. Every team member sees the current state in lists and on the detail page.
- FR-SUB-6 Lines are editable only in Draft and Quotation.
- FR-SUB-7 Moving to Quotation or Confirmed checks: plan active, start date inside the plan window, at least one line, product line quantity at or above the plan minimum, quotation not expired.
- FR-SUB-8 Close early, pause, resume and renew obey the plan switches. Plans with auto close end themselves after expiry once the last invoice exists.

### 4.4 Billing day (INV)
- FR-INV-1 A daily database job creates invoices for every active subscription whose next invoice date has arrived, with customer, lines, discounts, taxes and totals filled in.
- FR-INV-2 Nothing is billed twice: unique index on subscription plus period start, row lock on the subscription, advisory lock around generation.
- FR-INV-3 Nothing is skipped: if the job missed days, it catches up one period at a time until current. Failures are recorded in billing_runs and shown to the team, and the rest of the batch continues.
- FR-INV-4 Taxes come from admin defined rates attached to products, calculated per line, rounded half up to 2 decimals.
- FR-INV-5 Invoice states: Draft, Confirmed, Paid, plus Cancelled. Team can confirm, cancel, send by email and print. Bulk confirm on billing day.
- FR-INV-6 Invoice amounts are frozen after Draft. A wrong invoice is cancelled and the period is regenerated by the team.
- FR-INV-7 Print uses a dedicated print stylesheet. Send uses free SMTP.

### 4.5 Discounts (DSC)
- FR-DSC-1 Only the admin creates discount rules: fixed or percent, minimum purchase, minimum quantity, start and end dates, usage limit.
- FR-DSC-2 Scope product (listed products) or subscription (whole subscription, limited to listed subscriptions or all).
- FR-DSC-3 Eligible discounts apply on the next invoice automatically and stop when expired, inactive or out of uses.
- FR-DSC-4 Usage count increases once per invoice that used the discount.

### 4.6 Payments (PAY)
- FR-PAY-1 Record method, amount, date, note against one invoice. Methods: cash, bank transfer, UPI, card, cheque, other. Recording is manual; no gateway (D-09).
- FR-PAY-2 Partial payments allowed. Payment above the amount due is rejected. Invoice becomes Paid when the sum equals the total.
- FR-PAY-3 Paid and outstanding invoices are visible at any moment. Overdue is derived: Confirmed and past due date with an amount due (D-07).
- FR-PAY-4 Only an admin can delete a payment. The invoice returns to Confirmed.

### 4.7 Finance dashboard (RPT)
- FR-RPT-1 One page with: active subscriptions, MRR, invoiced, collected, outstanding, overdue count and amount, overdue aging, monthly collections for 12 months.
- FR-RPT-2 Filters: date range for invoiced and collected. List filters on every table (status, customer, plan, dates).
- FR-RPT-3 Overdue invoice list with days overdue, customer, amount due, one click to the invoice.
- FR-RPT-4 CSV export of the current filtered list for invoices, payments and subscriptions.
- FR-RPT-5 Each page responds in under 2 seconds at the data volumes in C-2.

### 4.8 Customer portal (POR)
- FR-POR-1 Customer sees own subscriptions, invoices, payments and status.
- FR-POR-2 Customer can pause, resume, close or renew where the plan allows. Everything else is read only.
- FR-POR-3 Customer can print invoices and edit name, phone and address.

## 5. Decisions on ambiguities

| ID | Statement says | Decision |
|----|---------------|----------|
| D-01 | Password "more than eight" characters | Minimum 9. |
| D-02 | Currency not stated | Single currency, default INR, stored in app_settings, shown through one Money component. |
| D-03 | Plan has a price and products have prices | Plan price becomes an optional first line "Plan fee" copied into the subscription at creation. Product lines use sales price plus variant extra. Later plan edits never change existing subscriptions. |
| D-04 | Plan minimum quantity | Applies to every product line of a subscription on that plan. |
| D-05 | Billing timing | In advance. Invoice for a period is created on the period start date. Periods are counted from an anchor date by adding whole periods, so month end dates do not drift (31 Jan, 28 Feb, 31 Mar). |
| D-06 | Invoice creation | Created as Draft so the team can review. Setting auto_confirm_invoices makes them Confirmed on creation. Bulk confirm exists. |
| D-07 | Overdue | A derived flag, not a stored state. |
| D-08 | Partial payments | Allowed. |
| D-09 | Payment collection | Recording only. Payment gateways charge fees, which C-1 forbids. |
| D-10 | Pause | Adds a Paused state reachable from Active, only for pausable plans. Resume restarts the billing anchor at today. |
| D-11 | Discount stacking | Per line one best product discount. Per invoice one best subscription discount. The two stack. Fixed amounts apply once per line (product scope) or once per invoice (subscription scope), capped at the amount they discount. |
| D-12 | Tax | Prices are tax exclusive. Tax is calculated per line after discounts. |
| D-13 | Renewal | Extends expiry by the length of the original term. |
| D-14 | Customers without login | Staff can create customer records for large accounts without a login. When that email later signs up, the account links automatically. |
| D-15 | Quotation validity | A quotation past its validity date cannot be confirmed. |
| D-16 | Platform | Web application. See 02 for the comparison with Java and Swift. |

## 6. Non functional requirements

- Performance: server rendered pages, 25 row pagination, indexes in 0001, one round trip dashboard RPC. Budget 2 seconds per page at C-2 volumes, measured in 07.
- Security: Row Level Security on every table, no service role key in the browser, server side validation with the same zod schemas as the forms, no secrets in the repository.
- Integrity: money is numeric(12,2) in the database. All state changes go through guarded transitions. Invoices are immutable after Draft.
- Accessibility: keyboard reachable, visible focus, contrast at least 4.5 to 1, reduced motion respected, tables use real table markup.
- Audit: subscription status history, billing_runs, payments with recorded_by.

## 7. Out of scope for v1

Online payment gateways, proration, multi currency, usage based billing, dunning email sequences, refunds and credit notes, tax filing reports, SSO. The data model leaves room for each.

## 8. Risks

| Risk | Handling |
|------|----------|
| Supabase free project pauses after a week without traffic | GitHub Actions scheduled request (02, section 7). |
| Free email limits | Invoice send is queued by the team, bulk send is rate limited in the route. |
| Vercel Hobby is for non commercial use | Fine for the hackathon or portfolio. For commercial use deploy the same app on another free host (02). |
| Untested SQL in this package | Phase 1 and Phase 4 of the build plan run it and the golden vectors before anything is built on top. |
