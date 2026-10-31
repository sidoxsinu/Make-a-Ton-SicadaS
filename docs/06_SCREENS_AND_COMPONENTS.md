# 06. Screens and Reusable Components

## 1. Route map

| Route | Roles | Purpose |
|---|---|---|
| /login, /signup, /forgot-password, /reset-password | public | Auth |
| /dashboard | admin, staff | Finance view |
| /customers, /customers/[id] | admin, staff | Customer list and detail |
| /products, /products/[id] | admin write, staff read | Product with variants |
| /plans, /plans/[id] | admin write, staff read | Plans and their switches |
| /templates, /templates/[id] | admin write, staff read | Quotation templates |
| /subscriptions, /subscriptions/new, /subscriptions/[id] | admin, staff | Subscriptions |
| /invoices, /invoices/[id], /invoices/[id]/print | admin, staff | Invoices |
| /payments | admin, staff | Payment list and record |
| /discounts, /discounts/[id] | admin write, staff read | Discount rules |
| /taxes, /payment-terms | admin write, staff read | Reference data |
| /staff | admin | Staff list and add |
| /billing-runs | admin, staff | Job log and Run billing |
| /settings | admin write, staff read | Currency, auto confirm, company name |
| /portal | customer | Own subscriptions and invoices |
| /portal/subscriptions/[id], /portal/invoices/[id], /portal/invoices/[id]/print, /portal/account | customer | Own detail pages |

## 2. Reusable component catalog

All live in `components/`. Props shown are the contract; extra props are not added without need.

| Component | Props | Used by |
|---|---|---|
| `Button` | `variant: primary or secondary or quiet or danger`, `type`, `disabled`, `loading`, `href?` | everywhere |
| `Field` | `label`, `name`, `error?`, `help?`, children input | all forms |
| `Select`, `TextInput`, `NumberInput`, `DateInput`, `TextArea`, `Toggle` | controlled by react-hook-form | forms |
| `Badge` | `status: string` (looked up in the status color map) | tables, details |
| `Money` | `value: number or string`, `currency?` | all money output |
| `DateText` | `value: string or Date` | all date output |
| `Table` | `columns`, `rows`, `sort`, `onSortHref`, `empty` | ResourceList, dashboard |
| `Pager` | `page`, `pageSize`, `total`, `hrefFor(page)` | ResourceList |
| `FilterBar` | `fields: FilterField[]` reads and writes URL params | ResourceList, invoices, payments |
| `Drawer` | `open`, `onClose`, `title`, children | ResourceForm quick edit |
| `Dialog` | `open`, `title`, `body`, `confirmLabel`, `onConfirm` | destructive actions |
| `Tabs` | `items`, `value` (URL driven) | detail pages |
| `Toast` provider | `toast.success(msg)`, `toast.error(msg)` | all actions |
| `ResourceList` | `resource: Resource`, `searchParams` | all config driven lists |
| `ResourceForm` | `resource: Resource`, `initial?`, `mode` | create and edit |
| `LineItemsEditor` | `columns`, `value`, `onChange`, `priceFn`, `readOnly` | subscription lines, template lines |
| `StateStepper` | `steps: string[]`, `current: string` | subscription and invoice detail |
| `HistoryList` | `items: {at, label, by}[]` | subscription detail |
| `KpiLedger` | `rows: {label, value, format, context?}[]` | dashboard |
| `BarSeries` | `data: {label, value}[]`, `format` | dashboard |
| `TotalsLedger` | `subtotal`, `discount`, `tax`, `total`, `paid?`, `due?` | invoice and subscription detail |
| `ActionBar` | `actions: {label, onClick, variant, visible}[]` | detail pages |

`defineResource` shape:
```ts
defineResource({
  name: "taxes", table: "taxes", title: "Taxes",
  permissions: { read: ["admin","staff"], write: ["admin"] },
  columns: [{ key: "name", label: "Name", sortable: true },
            { key: "rate", label: "Rate", type: "percent", align: "right" },
            { key: "active", label: "Active", type: "boolean" }],
  filters: [{ key: "active", type: "boolean" }],
  fields: [{ key: "name", label: "Name", type: "text", required: true },
           { key: "rate", label: "Rate (%)", type: "number", min: 0, max: 100 },
           { key: "active", label: "Active", type: "toggle", default: true }],
  schema: taxSchema,            // zod, shared by form and server action
  search: ["name"],
})
```
A new master data screen is one file of this shape plus one navigation entry.

## 3. Screen specifications

### 3.1 Signup, login, reset
- Signup fields: full name, email, password, confirm password. Live checklist under the password field lists the four rules in plain text and marks each as Met or Not met in words and color, no check glyphs.
- Login: email, password, links to Sign up and Forgot password.
- Forgot password: email only, neutral confirmation message.
- Reset: new password and confirm, same live rule list.

### 3.2 Dashboard (admin, staff)
Top: filter bar with From and To dates (default: first day of this month to today) and an Apply button.
Block 1, `KpiLedger` rows:

| Row | Source | Context text |
|---|---|---|
| Active subscriptions | active_subscriptions | by_status summary: "{n} draft, {n} quotation, {n} confirmed, {n} paused" |
| Monthly recurring revenue | mrr | "Active lines, excluding tax and discounts" |
| Invoiced in period | invoiced | period dates |
| Collected in period | collected | period dates |
| Outstanding | outstanding | "All confirmed invoices with an amount due" |
| Overdue | overdue_amount | overdue_count invoices |

Block 2, split pane:
- Left (60 percent): table "Overdue invoices": Invoice, Customer, Due date, Days overdue, Amount due. Sorted by days overdue descending, 10 rows, link "View all overdue" to /invoices?overdue=1.
- Right (40 percent): table "Overdue aging" with rows 1 to 30 days, 31 to 60 days, over 60 days, each with amount, then `BarSeries` "Collected per month, last 12 months".

### 3.3 Customers
List columns: Name, Company, Email, Active subscriptions, Outstanding. Filters: search. Detail tabs: Details, Subscriptions, Invoices, Payments. Create form fields from FR in 03.

### 3.4 Products
List: Name, Type, Sales price, Cost price (team only), Default tax, Active. Detail: product fields plus Variants table (Attribute, Value, Extra price) editable inline using `LineItemsEditor`. A computed column shows Final price (sales plus extra).

### 3.5 Plans
Fields: name, price, billing period, minimum quantity, available from, available to, and four toggles with plain help text: Close automatically when it ends, Can be closed early, Can be paused, Can be renewed. List columns include the toggles as Yes or No.

### 3.6 Quotation templates
Fields: name, validity days, plan. Lines via `LineItemsEditor` (product, variant, quantity). Button "Create subscription from template" opens a Drawer asking for customer, start date, expiry date, payment terms, then calls `create_subscription_from_template` and opens the new subscription.

### 3.7 Subscriptions
List columns: Number, Customer, Plan, Status, Start, Expiry, Next invoice, Monthly value. Filters: status, plan, customer search, expiring within N days. CSV export.
New: choose Blank or From template. Blank asks customer, plan, dates, payment terms.
Detail:
- Header: number, `Badge` for status, `StateStepper` with Draft, Quotation, Confirmed, Active, Closed (Paused shown as a badge on Active when paused).
- Left: fields form (editable in Draft and Quotation) and `LineItemsEditor` (Product, Variant, Description, Quantity, Unit price, Tax, Amount). Product pick fills description, unit price and tax from product and variant using `lib/pricing.ts`. Quantity under the plan minimum shows an inline error.
- Right: `TotalsLedger` preview (before discounts), invoices list for this subscription, `HistoryList` from status history.
- `ActionBar` by state: Draft: Send for quotation, Close. Quotation: Confirm, Back to draft, Close. Confirmed: Activate, Close. Active: Pause (if allowed), Renew (if allowed), Close (if allowed), Bill now. Paused: Resume, Close.

### 3.8 Invoices
List columns: Number, Customer, Subscription, Invoice date, Due date, Total, Paid, Due, Status. Filters: status, overdue only, customer, date range, subscription. Row selection with bulk "Confirm selected" and "Confirm all drafts". CSV export.
Detail: header with number and `StateStepper` Draft, Confirmed, Paid (Cancelled shown as a badge). Lines table (Description, Quantity, Unit price, Discount, Tax, Total), `TotalsLedger`, payments table, `ActionBar`: Confirm, Cancel, Send, Print, Record payment, Mark paid (zero total only).
Print route renders the print stylesheet version.

### 3.9 Payments
List columns: Date, Invoice, Customer, Method, Amount, Note, Recorded by. Filters: method, date range, customer. "Record payment" opens a Drawer: invoice picker (confirmed invoices with amount due, searchable), method, amount (defaults to amount due), date (today), note. Shows amount due live.

### 3.10 Discounts (admin write)
Fields: name, kind, value, scope, minimum purchase, minimum quantity, start, end, usage limit, active. Scope product shows a product multi select. Scope subscription shows an optional subscription multi select with help text "Leave empty to apply to every subscription". List shows Used and Limit as "3 of 10" and a computed state: Scheduled, Running, Expired, Exhausted, Inactive.

### 3.11 Billing runs
Table of runs: Time, Created, Failed, expandable error detail. Button "Run billing now" calls `run_billing`. Shows count of subscriptions currently due.

### 3.12 Staff (admin)
List of staff. "Add staff" Drawer: full name, email, temporary password (same password rules). Deactivate action with `Dialog`.

### 3.13 Settings (admin)
Currency code, Company name, Confirm invoices automatically (toggle with help text explaining Draft review).

### 3.14 Portal (customer)
- /portal: ledger of own subscriptions (Number, Plan, Status, Next invoice, Expiry) and own invoices (Number, Date, Due, Total, Due amount, Status).
- Subscription detail: fields read only, lines, `StateStepper`, invoice list, actions allowed by plan (Pause, Resume, Close, Renew) each with a `Dialog` confirmation.
- Invoice detail: lines, totals, payments, Print.
- Account: edit name, phone, address. Change password link.

## 4. List page contract (applies to every list)

1. State lives in the URL: `?page=2&sort=due_date&dir=desc&status=confirmed&q=acme`.
2. Server component reads params, runs one query with `range`, `order`, filters, and selected columns only.
3. Page size 25. Count uses `planned` when no filters, `exact` when filters exist.
4. Empty result shows `EmptyState` with the active filters named in a sentence.
5. Row click opens the detail route. Keyboard users get a real link in the first column.

## 5. Quality bar per screen

Each screen is done when: it works for each allowed role, is hidden or blocked for others, passes `check:bans`, has loading and empty and error states, is keyboard usable, and its acceptance tests in 07 pass.
