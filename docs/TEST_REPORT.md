# Acceptance Test & Quality Assurance Report

**Project:** Brightloop Subscription Management System (SMS)  
**Lead QA Analyst:** Lakshmi (SicadaS Team)  
**Infrastructure & Performance:** Roshan & Muhammed Sinan  
**Reviewed by:** Malavika M.T. & Muhammed Sinan  
**Date:** 31 October 2026  
**Status:** ALL 15 VITEST SUITES PASSED (72/72 TESTS) & PLAYWRIGHT E2E PASSED (6/6 TESTS)  

---

## 1. Acceptance Criteria Verification Matrix

| AC Identifier | Feature Scope | Target Specification | Automated Test | Result |
| :--- | :--- | :--- | :--- | :--- |
| **AC-AUTH-1** | Auth / Identity | Duplicate email registration blocked by DB uniqueness constraint | `tests/unit/auth-rls.test.ts` | **PASS** |
| **AC-AUTH-2** | Auth / Password | Complex passwords required (min 9 chars, upper, lower, symbol) | `tests/unit/password.test.ts` | **PASS** |
| **AC-AUTH-3** | Auth / Signout | Session invalidation and secure cookie clearing | Route handler & middleware | **PASS** |
| **AC-AUTH-4** | Auth / Profiles | Default signup role defaults strictly to `customer` | `tests/unit/auth-rls.test.ts` | **PASS** |
| **AC-AUTH-5** | Middleware | Customers confined to `/portal`; team redirected to `/dashboard` | `middleware.ts` & unit tests | **PASS** |
| **AC-CAT-1** | Catalog / Variants | Product base price + variant surcharge calculation (1000 + 560 = 1560) | `tests/unit/catalog.test.ts` | **PASS** |
| **AC-CAT-2** | Catalog / Plans | Plan stores billing periods, minimum quantities, and 4 capability switches | `tests/unit/catalog.test.ts` | **PASS** |
| **AC-CAT-3** | Catalog / RLS | Anonymous and customer sessions blocked from catalog and cost prices | `tests/unit/catalog.test.ts` | **PASS** |
| **AC-SUB-1** | Subscriptions | Template creation copies plan fee, lines, and sets quotation validity | `tests/unit/subscriptions.test.ts` | **PASS** |
| **AC-SUB-2** | State Machine | Legal state machine matrix enforced (`draft` -> `quotation` -> `confirmed` -> `active` -> `paused` -> `active` -> `closed`) | `tests/unit/subscriptions.test.ts` | **PASS** |
| **AC-SUB-3** | Subscriptions | Trigger locks subscription line modification once confirmed | `tests/unit/subscriptions.test.ts` | **PASS** |
| **AC-SUB-4** | Readiness | Quantity below plan minimum quantity halts quotation transition | `tests/unit/subscriptions.test.ts` | **PASS** |
| **AC-SUB-5** | Lifecycle | Switch-based capabilities obeyed (`pausable`, `closable`, `renewable`) | `tests/unit/subscriptions.test.ts` | **PASS** |
| **AC-INV-1** | Billing Engine | Automatic recurring invoice generation copies lines and computes tax | `tests/unit/invoices.test.ts` | **PASS** |
| **AC-INV-2** | Billing Engine | Unique constraint `uq_invoice_sub_period` enforces idempotency | `tests/unit/invoices.test.ts` | **PASS** |
| **AC-INV-5** | Invoices | Trigger freezes financial values after draft status | `tests/unit/invoices.test.ts` | **PASS** |
| **AC-DSC-1** | Discounts | Staff blocked from discount modification (admin only) | `tests/unit/discounts.test.ts` | **PASS** |
| **AC-DSC-2** | Discounts | Product discounts apply per-line; subscription discounts apply per-invoice | `tests/unit/discounts.test.ts` | **PASS** |
| **AC-DSC-3** | Discounts | Exhausted usage limit, expired date, or inactive switch stops application | `tests/unit/discounts.test.ts` | **PASS** |
| **AC-PAY-1** | Payments | Recording full payment automatically transitions invoice to `paid` | `tests/unit/payments-dashboard.test.ts` | **PASS** |
| **AC-PAY-2** | Payments | Overpayment rejected (`amount > balance_remaining`) | `tests/unit/payments-dashboard.test.ts` | **PASS** |
| **AC-PAY-3** | Payments | Partial payment updates balance remaining; invoice stays `confirmed` | `tests/unit/payments-dashboard.test.ts` | **PASS** |
| **AC-RPT-1** | Dashboard | KPI metrics (MRR, Active Subs, Collected, Receivables, Aging) match SQL | `tests/unit/payments-dashboard.test.ts` | **PASS** |
| **AC-RPT-2** | CSV Export | Edge runtime streaming export streams exact rows across pages | `app/api/export/[resource]` | **PASS** |
| **AC-RPT-3** | Performance | Query execution and dashboard summary within performance budget | `tests/unit/perf.bench.test.ts` | **PASS** |
| **AC-POR-1** | Customer Portal | Tenant isolation verified; Customer A cannot read or act on Customer B | `tests/unit/portal.test.ts` | **PASS** |

---

## 2. Mathematical Parity & Golden Vectors Verification

| Vector | Specification | Expected Result | Actual Result | Verification File |
| :--- | :--- | :--- | :--- | :--- |
| **V1** | 10 x 1560 @ 18% tax | Net: 15,600.00, Tax: 2,808.00, Total: 18,408.00 | Exact match to 2 decimal places | `pricing.parity.test.ts` |
| **V2** | V1 + 10% discount (min qty 5) | Subtotal: 15,600.00, Disc: 1,560.00, Tax: 2,527.20, Total: 16,567.20 | Exact match in SQL billing engine | `discounts.test.ts` |
| **V3** | V2 + fixed 500 sub discount | Total Disc: 2,060.00, Net: 13,540.00, Tax: 2,437.20, Total: 15,977.20 | Exact match in SQL billing engine | `discounts.test.ts` |
| **V4** | 3 x 33.33 @ 5% tax | Gross: 99.99, Tax: 5.00 (half-up), Total: 104.99 | Exact match to 2 decimal places | `pricing.parity.test.ts` |
| **V5** | Proportional fixed 10 sub discount across lines 100 & 200 | Line 1: 3.33 disc, Line 2: 6.67 disc, Invoice Total: 290.00 | Exact match in SQL billing engine | `discounts.test.ts` |
| **V6** | Fixed 80 discount on line gross 50 | Discount capped at 50.00, Line Total: 0.00 | Exact match in SQL billing engine | `discounts.test.ts` |
| **V7** | `add_periods` monthly from 2026-01-31 | Period 1: 2026-02-28, Period 2: 2026-03-31 | Exact match in PostgreSQL engine | `auth-rls.test.ts` |
| **V8** | `add_periods` leap year from 2024-02-29 | n=1: 2025-02-28, n=4: 2028-02-29 | Exact match in PostgreSQL engine | `auth-rls.test.ts` |
| **V9** | `add_periods` weekly & daily | Weekly n=2: 2026-11-14, Daily n=3: 2026-11-03 | Exact match in PostgreSQL engine | `auth-rls.test.ts` |
| **V10** | Partial payment of 6,000 on 18,408 | Balance: 12,408.00; second payment 12,408 -> Total Paid: 18,408.00, Status: `paid` | Exact match in database trigger | `payments-dashboard.test.ts` |

---

## 3. End-to-End User Journeys (Playwright Browser Verification)

Automated E2E tests executing against Chromium in `tests/e2e/journeys.spec.ts`:

| ID | Journey | Test Scope | Result |
|---|---|---|---|
| **J1** | Public Authentication & Checklist | Validates `/login` and `/signup` forms, weak vs strong password checklist indicators | **PASS** |
| **J2** | Middleware Route Isolation | Verifies unauthenticated redirects to `/login` for all protected routes | **PASS** |
| **J3** | Design System DOM Audit | Enforces 0 `<svg>` icons, 2px border radius on buttons, 0 box-shadows in browser DOM | **PASS** |
| **J4** | Forgot Password Request | Verifies password reset request submission and confirmation alert | **PASS** |
| **J5** | Reset Password Page | Form and matching password inputs with checklist compliance | **PASS** |
| **J6** | Clean Printable Invoice | Verifies printable invoice statement renders without application shells | **PASS** |

---

## 4. Performance & Latency Budget (AC-RPT-3)

Verified via `tests/unit/perf.bench.test.ts` and `scripts/db-benchmark.mjs`:

| Benchmark Focus | Query / Operation | Budget Target | Measured Status |
|---|---|---|---|
| **Dashboard Summary** | `rpc/dashboard_summary` | Under 3,000ms (cloud TLS) | **PASS** (~400-800ms) |
| **Active Subscriptions** | Filtered status index scan (`idx_subs_active_mrr`) | Under 2,000ms | **PASS** (~200-400ms) |
| **Confirmed Invoices** | Due date range query (`idx_invoices_confirmed_due`) | Under 2,000ms | **PASS** (~180-350ms) |
| **Customer Search** | GIN Trigram text search (`idx_customers_name_trgm`) | Under 2,000ms | **PASS** (~170-300ms) |
| **Payments Ledger** | Sorted date query (`idx_payments_date_method`) | Under 2,000ms | **PASS** (~160-250ms) |

---

## 5. Design System & Accessibility Compliance

- **Automated Design Ban Checker (`scripts/check-bans.mjs`):** **PASS**
  - Zero icon libraries used (lucide, react-icons, fontawesome, heroicons banned).
  - Pure text symbols and Unicode arrows used for UI indicators (`<`, `>`, `[x]`, `+`, `-`).
  - Strict max 2px border radius enforced across all components (`rounded-sm`).
  - Zero box shadows (`box-shadow: none` token rule).
  - Zero gradients.
  - `#fff` and `bg-white` completely banned; replaced by strict tokens (`bg-paper`, `bg-sheet`).
- **Contrast Ratios (WCAG AA Target >= 4.5:1):**
  - Primary text (`ink` on `paper`): **13.94:1** (Passes AAA)
  - Secondary text (`ink-2` on `paper`): **6.78:1** (Passes AA)
  - Accent button (`accent-ink` on `accent`): **8.19:1** (Passes AAA)
  - Success status (`ok` on `sheet`): **5.62:1** (Passes AA)
  - Warning status (`warn` on `sheet`): **5.65:1** (Passes AA)
  - Error status (`bad` on `sheet`): **6.85:1** (Passes AA)

---

## 6. Test Suite Execution Summary

```
========================= Vitest Unit & Parity Matrix =========================
 Test Files  15 passed (15)
      Tests  72 passed (72)
   Duration  73.60s (tests 71.87s)

========================= Playwright E2E Browser Suite ========================
 Test Files  1 passed (1)
      Tests  6 passed (6)
   Duration  6.10s
```
