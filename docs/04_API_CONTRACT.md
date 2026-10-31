# 04. Actions, RPC and Route Contract

Notation: SA = Next.js server action, RPC = Postgres function called through Supabase, RH = route handler. All inputs are validated by zod on the server. Errors return `{ ok: false, message, fieldErrors? }`. Success returns `{ ok: true, data }`. Database exception text is passed through to the toast because the SQL messages are written for users.

## 1. Auth

| Name | Type | Input | Rule | Result |
|---|---|---|---|---|
| signUp | SA | fullName, email, password | `passwordSchema` (below). Calls `supabase.auth.signUp`. One email can only ever belong to one auth user (Supabase enforces it). With email confirmation on, Supabase hides whether an email exists, so the page shows: "Check your inbox to confirm. If you already have an account, sign in or reset your password." | Confirmation email sent if confirmation is on, else signed in |
| signIn | SA | email, password | Generic failure message, no hint which part was wrong | Redirect by role: team to /dashboard, customer to /portal |
| requestReset | SA | email | Always shows the same confirmation text, whether or not the email exists | Email with link to /reset-password |
| setNewPassword | SA | password, confirm | `passwordSchema`, must match | Redirect to /login |
| signOut | SA | none | | Redirect to /login |

`passwordSchema`:
```ts
z.string()
  .min(9, "Use at least 9 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Add a special character")
```
Supabase Auth dashboard: set minimum length 9 and require lowercase, uppercase and a symbol, so the rule also holds if someone calls the Auth API directly.

## 2. Staff (admin only)

| Name | Type | Input | Rule |
|---|---|---|---|
| createStaff | RH `POST /api/admin/staff` | fullName, email, temporaryPassword | Verify caller `is_admin()` using the session. Then `admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: 'staff' }, user_metadata: { full_name } })`. The `handle_new_user` trigger makes the staff profile. Staff are told to use Forgot password on first login. |
| deactivateStaff | SA | profileId | Admin only. Uses Admin API `ban_duration`. |

## 3. Generic resource actions (config driven)

For every resource defined with `defineResource`:

| Name | Type | Behaviour |
|---|---|---|
| list | server component query | Reads URL params: `page`, `sort`, `dir`, `q`, plus declared filters. Returns rows and total. |
| create | SA | Validates with the resource zod schema, inserts, revalidates the list path. |
| update | SA | Same, by id. |
| remove | SA | Deletes. Foreign key errors become the message "In use, deactivate instead". Resources with an `active` column offer deactivate. |

Resources: customers, products (with nested variants), plans, templates (with nested lines), taxes, paymentTerms, discounts (with product and subscription links), staff (read only list).

## 4. Subscriptions

| Name | Type | Input | Notes |
|---|---|---|---|
| createFromTemplate | RPC `create_subscription_from_template` | templateId, customerId, startDate, expiryDate, paymentTermId | Default expiry in the form is start plus one year |
| createBlank | SA insert | customer, plan, dates, term | Status draft |
| updateSubscription | SA update | editable columns only | Column grants block status and billing fields |
| saveLines | SA | subscriptionId, lines[] | Replaces lines in one call. Rejected by trigger when not Draft or Quotation |
| transition | RPC `sub_transition` | id, to | to in quotation, confirmed, active, paused, closed, draft |
| renew | RPC `sub_renew` | id | Team or the owning customer |
| customerAction | RPC `customer_sub_action` | id, action (pause, resume, close, renew) | Portal only |
| billNow | RPC `run_billing` | subscriptionId | Team. Shows created count |

## 5. Invoices

| Name | Type | Input | Notes |
|---|---|---|---|
| runBilling | RPC `run_billing` | none | Same function the cron runs. Returns created, failed, errors |
| confirm | SA update status | id | Draft to Confirmed |
| confirmMany | RPC `confirm_draft_invoices` | ids[] or null for all drafts | Returns count |
| cancel | SA update status | id | Draft or Confirmed with no payments |
| markZeroPaid | RPC `mark_zero_invoice_paid` | id | Total must be 0 |
| send | RH `POST /api/invoices/[id]/send` | id | Team only. Builds an HTML email with the invoice table and a portal link. Sets sent_at. If the invoice is Draft the route confirms it first only when the user passed `confirm=true`. |
| print | page `/invoices/[id]/print` and `/portal/invoices/[id]/print` | id | Print stylesheet, `window.print()` button |

## 6. Payments

| Name | Type | Input | Notes |
|---|---|---|---|
| recordPayment | SA insert | invoiceId, method, amount, paidOn, note | Trigger enforces status and remaining amount. Also reachable from the invoice detail page with the invoice preselected |
| deletePayment | SA delete | id | Admin only |

## 7. Reports

| Name | Type | Input | Result |
|---|---|---|---|
| dashboardSummary | RPC `dashboard_summary` | from, to | JSON: active_subscriptions, by_status, mrr, invoiced, collected, outstanding, overdue_count, overdue_amount, aging, monthly |
| overdueList | query on view `v_invoices` | filters, page | rows with days_overdue, amount_due |
| exportCsv | RH `GET /api/export/[resource]?...filters` | resource in invoices, payments, subscriptions | Streams CSV of the filtered set, limit 50,000 rows, team only |

## 8. Customer self service

| Name | Type | Input |
|---|---|---|
| updateMyDetails | RPC `update_my_details` | name, phone, address |
| customerAction | RPC `customer_sub_action` | see section 4 |

## 9. Middleware

`middleware.ts` refreshes the Supabase session and redirects:
- Anonymous user on any route outside `(public)` goes to /login.
- Customer on a team route goes to /portal.
- Team user on /portal goes to /dashboard.
- Staff on admin only routes (/staff, /settings write, discount create) get a 403 page. Server actions check the same permission map and the database has the final say.

## 10. Error vocabulary

| Source | User message |
|---|---|
| Illegal subscription transition | "That change is not allowed from the current state." |
| Readiness failures | Passed through from SQL text |
| Payment exceeds due | "Payment exceeds the amount due (X)." |
| Duplicate email | "Check your inbox to confirm. If you already have an account, sign in or reset your password." |
| Foreign key violation | "This record is in use. Deactivate it instead." |
| RLS denial | "You do not have access to this." |
