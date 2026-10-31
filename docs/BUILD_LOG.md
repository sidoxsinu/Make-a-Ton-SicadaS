# Build Log: Brightloop Subscription Management System

Team: SicadaS | Make-a-Ton Hackathon

---

## Pre-Build System Summary & Risk Assessment

- **Architecture:** Next.js (App Router, TypeScript) + Supabase (Postgres, Auth, RLS) + Tailwind CSS + GSAP.
- **Visual Spec:** Ledger style, IBM Plex Sans & Mono fonts, max 2px border radius, flat fills, 1px rules, no shadows, no icons.
- **Business Rules Authority:** Pure PostgreSQL (migrations 0001–0004), client/server code validates inputs and calls SQL RPC functions.
- **Identified Risks & Solutions:**
  - Vercel Hobby serverless region latency: Mumbai not selectable on Hobby, ~150-200ms latency trade-off noted.
  - CSV export execution limit: Vercel Hobby 10s timeout bypassed by using Edge runtime for `/api/export/[resource]`.
  - Auth Password validation: Supabase Auth dashboard configured with min length 9 + complex characters; server action zod schema acts as primary enforcer.

---

## Phase 0: Scaffold, Tokens, Shell

**Commit message:** `phase 0: scaffold, tokens, shell`

### Files Created / Modified
- `package.json` - approved dependencies installed (Next 14, React 18, Supabase SSR, GSAP, Zod, React Hook Form, Nodemailer, Fontsource IBM Plex).
- `tsconfig.json`, `postcss.config.mjs`, `tailwind.config.ts`, `.eslintrc.json` - configuration with strict 2px radius and shadowless tokens.
- `styles/tokens.css` - paper, sheet, ink, rule, accent, status variables.
- `styles/globals.css` - fontsource imports, base layer, focus-visible outline.
- `.env.example` - environment variable template.
- `scripts/check-bans.mjs` - automated ban-enforcement script.
- `lib/motion.ts` - GSAP hooks (`useReveal`, `useStagger`, `useCountUp`, `useStepperFill`, `useDrawer`, `useDrawSeries`) with `prefers-reduced-motion` safety.
- `components/ui/`:
  - `Button.tsx` (primary, secondary, quiet, danger, disabled)
  - `Field.tsx` (label, error, help text)
  - `Inputs.tsx` (TextInput, NumberInput, DateInput, TextArea, Select, Toggle)
  - `Badge.tsx` (all 10 status colors mapped)
  - `Money.tsx` (INR format, IBM Plex Mono tabular numbers)
  - `DateText.tsx` (e.g. 31 Oct 2026, IBM Plex Mono tabular numbers)
  - `Table.tsx` (IBM Plex Sans/Mono, text-only sort labels, hover state)
  - `Pager.tsx` (text-only previous/next, item counts)
  - `Drawer.tsx` (480px width, GSAP slide, accessible escape close)
  - `Dialog.tsx` (480px width, centered, destructive confirmations)
  - `Tabs.tsx` (ruled horizontal bar, counts)
  - `Toast.tsx` (bottom-left, error stay until closed, success auto-dismiss)
  - `EmptyState.tsx` (text-only prompt with primary action)
- `components/shell/`:
  - `NavList.tsx` (Sell, Billing, Catalog, Admin groups, role filter)
  - `TeamShell.tsx` (232px rail, 48px top bar, responsive overlay)
  - `PortalShell.tsx` (top bar navigation for customer self-service)
- `app/layout.tsx` & `app/page.tsx` - interactive UI ledger showcase.
- `vitest.config.ts` & `tests/unit/tokens.test.ts` - token contrast ratio unit tests.

### Measured Token Contrast Ratios (WCAG AA Target: >= 4.5:1)
- `ink` (#1B1F23) on `paper` (#EFEBE2): **13.94:1** (Passes AAA)
- `ink-2` (#4B525A) on `paper` (#EFEBE2): **6.78:1** (Passes AA)
- `accent-ink` (#F7F4EC) on `accent` (#1E4D5C): **8.19:1** (Passes AAA)
- `ok` (#2D6A3E) on `sheet` (#F7F4EC): **5.62:1** (Passes AA)
- `warn` (#85560A) on `sheet` (#F7F4EC): **5.65:1** (Passes AA)
- `bad` (#9B2C25) on `sheet` (#F7F4EC): **6.85:1** (Passes AA)

### Verification Commands Run
- `npm run check:bans` -> **clean** (no banned icons, fonts, colors, shadows, or gradients)
- `npm run typecheck` -> **0 errors**
- `npm test` -> **6/6 passed**
- `npm run lint` -> **0 warnings, 0 errors**
- `npm run build` -> **Compiled successfully**


---

## Phase 1: Database and Auth

**Commit message:** `phase 1: schema, rls, auth`

### What was completed:
- Verified all 20 database tables, constraints, triggers, and RPC functions in Supabase instance (`sjeaqqpxmafsjpzgkmvr.supabase.co`).
- Implemented `lib/supabase/browser.ts`, `lib/supabase/server.ts` (with `server-only`), and `lib/supabase/admin.ts` (with `server-only`).
- Implemented `lib/schema/password.ts` with strict 9+ character complex regex and live checklist validator.
- Implemented `lib/roles.ts` permission matrix and role redirect rules.
- Implemented `middleware.ts` enforcing session refresh, public route isolation, customer -> `/portal` confinement, team -> `/dashboard` redirection, and staff 403 on `/staff`.
- Created authentication pages with ledger UI:
  - `(public)/login`: Minimal ledger form, redirects based on database role.
  - `(public)/signup`: Form with live text-based requirement checklist (Met / Not met).
  - `(public)/forgot-password`: Single email input with neutral confirmation text.
  - `(public)/reset-password`: Form with matching password validation and live rule checklist.
- Created server actions in `app/auth/actions.ts`: `signUpAction`, `signInAction`, `requestResetAction`, `setNewPasswordAction`, `signOutAction`.
- Created route handlers: `/auth/signout/route.ts`, `/auth/callback/route.ts`, `/api/admin/staff/route.ts`.
- Created initial admin account `sinan@brightloop.local` with `admin` role.

### Acceptance Criteria & Tests Verified:
- **AC-AUTH-1**: Duplicate email signup blocked by database uniqueness constraint.
- **AC-AUTH-2**: Password table rules verified (length >= 9, upper, lower, special character).
- **AC-AUTH-4**: Default signup role verified as `customer` in `profiles` table.
- **AC-AUTH-5**: Role middleware redirects verified.
- **RLS Matrix**: Anon completely blocked from `products`, `customers`, `invoices`. Admin granted access.
- **Golden Vectors V7, V8, V9**: `add_periods()` SQL function verified against live Supabase database:
  - V7 (Monthly from 2026-01-31): period 1 = `2026-02-28`, period 2 = `2026-03-31`
  - V8 (Yearly leap year from 2024-02-29): n=1 = `2025-02-28`, n=4 = `2028-02-29`
  - V9 (Weekly from 2026-10-31): n=2 = `2026-11-14`; Daily n=3 = `2026-11-03`
- All 16 unit tests passed. `check-bans: clean`. Production build passed.

---

## Phase 2: Resource Framework and Catalog

**Commit message:** `phase 2: resource framework and catalog`

### What was completed:
- Built the generic resource configuration framework:
  - `lib/resources/types.ts`: `defineResource()` configuration engine specifying table, permissions, columns, filters, fields, and zod schema.
  - `lib/resources/actions.ts`: Generic server actions (`createResourceAction`, `updateResourceAction`, `deleteResourceAction`) with error handling for foreign keys ("This record is in use. Deactivate it instead.").
  - `lib/resources/fetcher.ts`: Server-side parameterized fetcher with dynamic sorting, filtering, multi-column search, and pagination.
  - `components/data/ResourceList.tsx`: Reusable list view displaying table, search/filter bar, pager, edit/create drawers, and delete confirmation dialog.
  - `components/data/ResourceForm.tsx`: Reusable schema-driven form supporting all input types with client/server zod validation.
  - `components/data/FilterBar.tsx`: URL-driven filter bar supporting text search, select dropdowns, and boolean toggles.
  - `components/data/LineItemsEditor.tsx`: Generic editable ledger table for nested lines and product variants.
- Built catalog resources and screens:
  - `taxes`: Complete resource definition (`lib/resources/taxes.ts`) & route (`app/(team)/taxes/page.tsx`). Adding the taxes resource took only its 35-line config file and page wrapper, serving as proof of reuse.
  - `payment_terms`: Resource definition (`lib/resources/paymentTerms.ts`) & route (`app/(team)/payment-terms/page.tsx`).
  - `customers`: Resource definition (`lib/resources/customers.ts`) & route (`app/(team)/customers/page.tsx`).
  - `plans`: Resource definition (`lib/resources/plans.ts`) with all 4 switches (`auto_close`, `closable`, `pausable`, `renewable`) & route (`app/(team)/plans/page.tsx`).
  - `products`: Resource definition (`lib/resources/products.ts`), list route (`app/(team)/products/page.tsx`), and detail route (`app/(team)/products/[id]/page.tsx`) with interactive variant price editor and live computed final price.
  - `quotation_templates`: Resource definition (`lib/resources/templates.ts`), list route (`app/(team)/templates/page.tsx`), and detail route (`app/(team)/templates/[id]/page.tsx`) with product line editor.

### Acceptance Criteria & Tests Verified:
- **AC-CAT-1**: Product with sales price 1000 + variant Brand = Odoo (extra 560) yields line price 1560.
- **AC-CAT-2**: Plan saves period, minimum quantity, dates, and all 4 boolean switches (`pausable`, `closable`, `renewable`, `auto_close`).
- **AC-CAT-3**: Customer and anon sessions cannot read products table or cost price (verified via Supabase RLS).
- All 19 unit tests passing. `check-bans: clean`. Production build passed.

---

## Phase 3: Subscriptions and Lifecycle

**Commit message:** `phase 3: subscriptions and lifecycle`

### What was completed:
- `lib/pricing.ts`: Client/Server pricing calculation engine matching SQL rules (`roundHalfUp`, gross, discount, tax, totals).
- `components/data/StateStepper.tsx`: Ruled state stepper supporting steps (`Draft`, `Quotation`, `Confirmed`, `Active`, `Closed`) and status overlays (e.g. `Paused` on Active).
- `components/data/HistoryList.tsx`: Audit history log rendering status transitions (`from_status` -> `to_status`), timestamps, and actor profiles.
- `components/data/TotalsLedger.tsx`: Standard financial summary definition list (Subtotal, Discounts, Taxes, Total, Amount Paid, Amount Due).
- `components/data/ActionBar.tsx`: Contextual action bar rendering allowed actions per state (`Send for Quotation`, `Confirm Quotation`, `Activate`, `Pause`, `Resume`, `Renew`, `Close`, `Bill Now`).
- Subscription Screens:
  - `app/(team)/subscriptions/page.tsx`: Subscriptions ledger list with status badges, customer/plan joins, next invoice dates, and filters.
  - `app/(team)/subscriptions/new/page.tsx`: Dual-tab wizard allowing creation from Quotation Templates or Blank Drafts.
  - `app/(team)/subscriptions/[id]/page.tsx`: Full detail view with split 2:1 layout:
    - Left column: Contract metadata and `LineItemsEditor` for subscription lines with inline min-quantity validation and product price lookups.
    - Right column: `TotalsLedger` preview, generated invoices list, and audit `HistoryList`.
- Server Actions in `app/(team)/subscriptions/actions.ts`:
  - `createFromTemplateAction`: calls `create_subscription_from_template` RPC.
  - `createBlankSubscriptionAction`: inserts draft subscription.
  - `transitionSubscriptionAction`: calls `sub_transition` RPC.
  - `renewSubscriptionAction`: calls `sub_renew` RPC.
  - `billNowAction`: calls `run_billing` RPC.
  - `saveSubscriptionLinesAction`: atomic line updates while draft.

### Acceptance Criteria & Tests Verified:
- **AC-SUB-1**: Template creation clones template lines with current prices.
- **AC-SUB-2**: Valid transitions execute cleanly; invalid transitions (e.g. Draft directly to Active) fail.
- **AC-SUB-3**: Pause / Resume shifts anchor date and preserves cycles billed.
- **AC-SUB-4**: Minimum quantity checks prevent advancing to quotation if lines violate plan `min_quantity`.
- **Parity**: Golden vectors V1 & V4 financial pricing calculations match SQL exactness.
- All 23 unit tests passing. `check-bans: clean`.

---

## Phase 4: Billing Engine and Invoices

**Commit message:** `phase 4: billing and invoices`

### What was completed:
- `lib/mail.ts`: Transactional email service using Nodemailer with Brevo SMTP fallback, console logger for development, and strict plain/HTML formats.
- `app/api/invoices/[id]/send/route.ts`: Email dispatch route sending invoice summary, line breakdown, total due, and customer portal deep link.
- `app/(team)/invoices/actions.ts`: Server actions for invoice management:
  - `confirmInvoiceAction`: Single invoice status transition to `confirmed`.
  - `confirmDraftInvoicesAction`: Bulk invoice confirmation.
  - `cancelInvoiceAction`: Transition to `cancelled`.
  - `markZeroInvoicePaidAction`: Direct zero-total invoice settlement.
  - `runBillingAction`: Staff trigger for automated periodic billing run.
- Screens & UI:
  - `app/(team)/invoices/InvoiceListClient.tsx` & `page.tsx`: Invoices list view with multi-select checkboxes for bulk confirmation, status badges (`draft`, `confirmed`, `paid`, `cancelled`, and computed `overdue`), search, and pagination.
  - `app/(team)/invoices/[id]/InvoiceDetailClient.tsx` & `page.tsx`: Detail view with StateStepper (`draft` -> `confirmed` -> `paid`), frozen line items, tax breakdowns, payment history, "Send by Email" trigger, and "Print" trigger.
  - `app/(team)/invoices/[id]/print/page.tsx` & `PrintButton.tsx`: Dedicated clean, crisp print stylesheet for customer paper and PDF output.
  - `app/(team)/billing-runs/BillingRunsClient.tsx` & `page.tsx`: Automated billing run monitor showing run logs (`created`, `failed`, duration, JSON detail), and manual "Run Billing Now" trigger.
  - `app/(team)/settings/actions.ts`, `SettingsClient.tsx`, `page.tsx`: Application settings editor for `auto_confirm_invoices` switch and default currency.

### Acceptance Criteria & Tests Verified:
- **AC-INV-1**: `run_billing` generates invoice with correct period start/end dates, line item copies, and recalculates financial totals.
- **AC-INV-2**: Billing idempotency prevents double-run on the same period (`uq_invoice_sub_period`).
- **AC-INV-5**: Invoice lines and amounts are frozen after Draft (`sub_lines_lock` and column security).
- All 25 unit tests passing. `check-bans: clean`. Typecheck and lint pass.

---

## Phase 5: Discounts and Promotions

**Commit message:** `phase 5: discounts`

### What was completed:
- `lib/resources/discounts.ts`:
  - Resource configuration for discounts table with fields (`kind`, `value`, `scope`, `min_purchase`, `min_quantity`, `starts_on`, `ends_on`, `usage_limit`, `active`).
  - `getDiscountStatus()`: Deterministic status resolver computing `Scheduled`, `Running`, `Expired`, `Exhausted`, or `Inactive`.
  - Schema validation enforcing percentage <= 100%, positive values, and valid date intervals.
- `app/(team)/discounts/actions.ts`:
  - `saveDiscountTargetsAction`: Server action updating product associations (`discount_products`) or subscription associations (`discount_subscriptions`) with admin permission checks.
- Screens & UI:
  - `app/(team)/discounts/page.tsx`: Discounts list with computed status badges, value formatting (percentage vs currency), scope tags, usage counters, and drawer for rapid rule creation.
  - `app/(team)/discounts/[id]/DiscountDetailClient.tsx` & `page.tsx`: Discount detail view featuring:
    - Left column: Financial rule ledger (kind, value, thresholds, validity dates, lifetime usage).
    - Right column: Interactive target selector for eligible catalog products or specific subscriptions (with "Make Global" clear option).
    - Audit list showing recent invoices claiming the discount.
- Test Suite (`tests/unit/discounts.test.ts`):
  - **AC-DSC-1**: Staff session cannot insert or update discounts; database RLS rejects non-admin modifications.
  - **AC-DSC-2**: Product discount applies to matching lines; subscription discount applies to overall invoice.
  - **AC-DSC-3**: Usage limit enforcement stops application once exhausted; expired or inactive rules are skipped.
  - **Golden Vectors Parity via Live Database Billing Engine**:
    - **Vector V2**: 10% product discount on line 10 x 1560 with 18% tax -> subtotal 15,600.00, discount 1,560.00, tax 2,527.20, total 16,567.20.
    - **Vector V3**: V2 stacked with fixed 500 subscription discount -> discount total 2,060.00, net 13,540.00, tax 2,437.20, total 15,977.20.
    - **Vector V5**: Proportional distribution of fixed 10 discount across lines A (100) and B (200) -> Line A discount 3.33, Line B discount 6.67, invoice total 290.00.
    - **Vector V6**: Fixed 80 discount on line gross 50 -> discount capped at 50.00, invoice total 0.00.
- Merged Phase A contributions by teammate Malavika (`roles`, `format`, `listParams`, UI foundations).
- All 12 test files (58 tests) passing. `check-bans: clean`. Typecheck clean.

---

## Phase 6: Payments and Dashboard

**Commit message:** `phase 6: payments and dashboard`

### What was completed:
- `app/(team)/payments/actions.ts`:
  - `recordPaymentAction`: Validates payment amount > 0 and <= balance remaining on the invoice, inserts into `payments` table with method, reference note, and date, which invokes Postgres triggers to update invoice paid status.
  - `deletePaymentAction`: Admin-only deletion of payment with balance recalculation.
- `app/(team)/payments/PaymentRecordDrawer.tsx`:
  - Reusable slide-out drawer conforming to ledger styles (480px, no shadows, 2px radius max).
  - Validates amount against outstanding balance in real time, method selection (`bank_transfer`, `upi`, `card`, `cash`, `other`), transaction reference, and notes.
- Screens & UI:
  - `app/(team)/payments/page.tsx` & `PaymentsClient.tsx`:
    - Full payments ledger displaying receipt timestamp, invoice reference number, customer name, payment method badge, transaction reference, and formatted INR amount.
    - Search by reference / customer, filter by payment method, CSV export link.
    - Destructive confirmation dialog for payment deletion with role guard (admin only).
  - Integrated `PaymentRecordDrawer` into `app/(team)/invoices/[id]/InvoiceDetailClient.tsx`:
    - "Record Payment" button opens drawer on confirmed invoices with balance > 0.
    - Real-time refresh of invoice status, amount due, and payment ledger upon recording.
  - `app/(team)/dashboard/page.tsx` & `DashboardClient.tsx`:
    - Executive business health dashboard with date-range filter.
    - `KpiLedger` presenting 5 top-line metrics: Monthly Recurring Revenue (MRR), Active Subscriptions count, Total Collected, Outstanding Receivables, and Aging Overdue balance (>30 days).
    - `BarSeries` charting 12-month historical collections with month-by-month cashflow breakdown.
    - Urgent overdue invoices alert table with direct navigation links.
  - `app/api/export/[resource]/route.ts`:
    - High-throughput Edge runtime streaming CSV export endpoint (`invoices`, `payments`, `subscriptions`, `customers`).
    - Robust CSV escaping (quotes, commas, linebreaks, empty values) bypassing Vercel Hobby execution limits.
- Test Suite (`tests/unit/payments-dashboard.test.ts`):
  - **AC-PAY-1**: Record payment >= amount due automatically transitions invoice status to `paid` via database trigger.
  - **AC-PAY-2**: Overpayment rejected (`amount > balance_remaining`).
  - **AC-PAY-3**: Partial payment leaves invoice in `confirmed` status with updated remaining balance.
  - **AC-RPT-1**: Dashboard KPI metrics aggregate correctly across active subscriptions, invoices, and payments.
  - **Golden Vector V10**: Partial payment of 6,000 on 18,408 invoice reduces balance to 12,408; second payment of 12,408 marks invoice as `paid` with 0 balance.
- All 13 test files (62 tests) passing. `check-bans: clean`. Typecheck and lint clean.

  - `transitionSubscriptionAction`: calls `sub_transition` RPC.
  - `renewSubscriptionAction`: calls `sub_renew` RPC.
  - `billNowAction`: calls `run_billing` RPC for immediate invoice generation.
  - `saveSubscriptionLinesAction`: replaces lines for draft/quotation subscriptions (locked once confirmed).

### Acceptance Criteria & Tests Verified:
- **AC-SUB-1**: Template creation copies plan fee, product lines, and sets `quote_valid_until`.
- **AC-SUB-2**: Full state machine matrix verified against live database:
  - Legal: `draft -> quotation -> confirmed -> active -> paused -> active -> closed` (all 6 transitions recorded in history).
  - Illegal: `draft -> confirmed` rejected; `closed -> draft` rejected.
- **AC-SUB-3**: Line item modification locked once subscription reaches `confirmed` (PostgreSQL trigger `trg_sub_lines_lock` enforced).
- **AC-SUB-4**: Readiness check `sub_check_ready` rejects moving to quotation when product line quantity is below plan minimum.
- **AC-SUB-5**: Switch-based actions (`pausable`, `closable`, `renewable`) obeyed.
- **Golden Vectors V1 & V4**: `pricing.parity.test.ts` passed:
  - V1 (10 x 1560 @ 18% tax): gross 15,600.00, tax 2,808.00, total 18,408.00.
  - V4 (3 x 33.33 @ 5% tax): gross 99.99, tax 5.00 (half-up rounding), total 104.99.
- All 23 tests passing. `check-bans: clean`. Production build passed.
