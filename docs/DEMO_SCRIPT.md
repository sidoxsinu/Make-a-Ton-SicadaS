# Brightloop SMS — Live Pitch & Demo Walkthrough Script

> **Team SicadaS | Make-a-Ton Hackathon**  
> **Platform:** Brightloop Subscription Management System (SMS)  
> **Target Audience:** Hackathon Judges, Technical Evaluators, and Business Stakeholders  
> **Recommended Time:** 4 to 6 Minutes  

---

## 1. Quick Demo Credentials Reference

| Role | Email Address | Password | Landing Route | Access Scope |
|---|---|---|---|---|
| **Administrator** | `sinan@brightloop.local` | `Brightloop1!` (or 1-click on `/`) | `/dashboard` | Complete platform control, staff manager, financial settings, and discount authoring. |
| **Operations Staff** | `staff@brightloop.local` | `Brightloop1!` (or 1-click on `/`) | `/dashboard` | Catalog, subscriptions, invoice generation, payment recording; blocked from staff/discounts. |
| **Customer Portal** | `demo.customer@brightloop.com` | `Customer1!` (or 1-click on `/`) | `/portal` | Tenant-isolated self-service portal, subscription pause/resume, online invoice payment. |

---

## 2. Core Value Proposition & Differentiators

When pitching to judges, emphasize these 4 foundational design decisions:

1. **Pure Database Authority:** Unlike fragile web apps that compute totals in JavaScript, every financial calculation, state transition, concurrency lock, and snapshot immutability trigger executes in pure PostgreSQL 15+ PL/pgSQL functions on Supabase.
2. **Strict Ledger Design System:** Designed for high-density financial operations: 0 SVG icons, 0 gradients, 0 box-shadows, maximum 2px border radius, strict IBM Plex typography, and 100% WCAG AAA/AA contrast compliance.
3. **Multi-Tenant Row Level Security (RLS):** All 20 tables enforce strict RLS policies. Customer data isolation is mathematically enforced at the database level—customer A cannot read or modify customer B records.
4. **Zero-Cost Production Stack:** Engineered to run 100% on free tiers (Next.js 14 on Vercel Hobby, Supabase free PostgreSQL, Brevo SMTP) with automated GitHub Actions keepalive cron preventing dormancy.

---

## 3. Step-by-Step 5-Minute Live Demo Flow

### Act I: The Executive Dashboard (Time: 0:00 - 1:00)
- **Login:** Sign in as `sinan@brightloop.local` with password `Brightloop1!` (or click `[Admin]` on `/login` or `Launch Executive Dashboard` on `/`).
- **Action:** Open [`/dashboard`](http://localhost:3000/dashboard).
- **Talking Points:**
  - *"Welcome to the Brightloop SMS Executive Dashboard. Here leadership monitors real-time business health."*
  - Point to the **KPI Ledger**:
    - **Monthly Recurring Revenue (MRR):** ₹1,33,100 / month, calculated across active subscriptions taking daily, weekly, monthly, and yearly cadences into account.
    - **Total Invoiced:** ₹5,46,930
    - **Total Collected:** ₹5,22,150
    - **Outstanding Receivables:** ₹24,780 with aged breakdown (31-60 days and 61+ days).
  - Point to the **12-Month Collections Chart (`BarSeries`)**:
    - Flat-fill SVG bar chart rendering month-by-month cashflow with exact values.
  - Point to the **Overdue Invoices Table**:
    - Highlight the overdue invoice badge (e.g. `INV-000200` past due by 41 days).
  - **Click "Export CSV" Button:**
    - Demonstrate instant streaming download of invoices via Next.js Edge runtime, bypassing Vercel Hobby 10-second timeout limits.

---

### Act II: Catalog & Plan Configuration (Time: 1:00 - 1:45)
- **Navigate to:** [`/plans`](http://localhost:3000/plans) and [`/products`](http://localhost:3000/products).
- **Talking Points:**
  - *"Our catalog framework is built with a declarative `defineResource` abstraction, enabling full CRUD, filtering, and validation with zero code duplication."*
  - Open **"Enterprise Scale Monthly"**:
    - Show the 4 plan capability switches: `pausable`, `closable`, `renewable`, `auto_close`.
    - Explain: *"These switches dictate the state machine transitions available to both staff and customers."*
  - Open **"Enterprise Cloud Suite"** product:
    - Show base sales price (₹15,000) and product variants:
      - *Dedicated VPC (+₹5,000)*
      - *Realtime Multi-Region (+₹2,500)*
    - Demonstrate how variant surcharges calculate composite line pricing (₹15,000 + ₹5,000 = ₹20,000).

---

### Act III: Subscription Lifecycle Stepper (Time: 1:45 - 2:30)
- **Navigate to:** [`/subscriptions`](http://localhost:3000/subscriptions).
- **Action:** Open an active subscription (e.g. Acme Technologies).
- **Talking Points:**
  - *"Subscriptions follow a strict state machine: `Draft` -> `Quotation` -> `Confirmed` -> `Active`."*
  - Point to the **`StateStepper`** component:
    - Visual stepper showing the subscription's current state and full audit trail in `HistoryList`.
  - Point to the **Line Item Snapshot**:
    - *"Once a subscription transitions beyond Quotation, our database trigger `trg_sub_lines_lock` irreversibly freezes the line items, preventing price tampering while the contract is active."*

---

### Act IV: Automated Recurring Billing & Invoices (Time: 2:30 - 3:30)
- **Navigate to:** [`/invoices`](http://localhost:3000/invoices).
- **Action:** Open invoice detail view.
- **Talking Points:**
  - *"Billing runs use transaction-level advisory locks (`pg_advisory_xact_lock`) and unique period constraints (`uq_invoice_sub_period`) to eliminate double-billing risks."*
  - Click **"Print Invoice"**:
    - Show the clean, print-optimized invoice view with zero application chrome, ready for PDF export or physical printing.
  - Click **"Record Payment"** drawer:
    - Enter partial payment (e.g. ₹5,000) via UPI.
    - Show that invoice status stays `confirmed` and balance updates instantly.
    - Try entering an overpayment: show that the database rejects it with an explicit balance warning.
    - Settle the full remaining balance: show that the database trigger automatically flips status to `paid`.

---

### Act V: Customer Self-Service Portal (Time: 3:30 - 4:30)
- **Action:** Sign out, then sign in as `demo.customer@brightloop.com` with password `Customer1!` (or click `[Customer]` on `/login`).
- **Landing Page:** Automatically routed by middleware to [`/portal`](http://localhost:3000/portal).
- **Talking Points:**
  - *"Customers are isolated from the team workspace. They see only their own subscriptions, invoices, and payments."*
  - Open the customer's subscription:
    - Click **"Pause Subscription"**:
      - Confirmation dialog pops up. Confirm pause: status flips to `paused`, and next billing date is cleared.
    - Click **"Resume Subscription"**:
      - Subscription reactivates, resetting the anchor billing date to today.
  - Open an unpaid/overdue invoice:
    - Point to **"Pay Balance Now"**:
      - Modal opens with simulated settlement method selector (`Credit/Debit Card`, `UPI Instant`, `Bank Wire`).
      - Confirm payment: status instantly flips to `PAID`, receipt is generated, and balance updates to ₹0.00!
  - Navigate to **"Account Details"**:
    - Update customer phone or billing address.
    - Show secure password reset request trigger.

---

### Act VI: Role Security & Code Quality Audits (Time: 4:30 - 5:00)
- **Action:** Show security and compliance metrics:
  - Try manually accessing [`/dashboard`](http://localhost:3000/dashboard) as a customer: immediately bounced back to `/portal`.
  - Sign in as `staff@brightloop.local`: navigating to `/staff` returns HTTP 403 Forbidden.
- **Terminal Proof:**
  - Run `npm run check:bans` in terminal: **clean** (no icons, 2px radius, no white literals).
  - Run `npm test` in terminal: **16 test files passed, 79/79 tests green**.
  - Run `npm run e2e` in terminal: **6 Playwright browser journeys passed**.

---

## 4. Anticipated Judge Q&A & Technical Answers

**Q: How do you prevent double-billing if two cron jobs trigger simultaneously?**  
> *A: We use PostgreSQL transaction-level advisory locks `pg_advisory_xact_lock(hashtext('sub_' || p_sub::text))` inside the `generate_invoice` function, backed by a hard database constraint `uq_invoice_sub_period(subscription_id, period_start)`. Even with concurrent worker invocations, only one invoice can ever be written.*

**Q: How do you prevent customer data leaks across tenants?**  
> *A: Multi-tenant isolation is enforced at the PostgreSQL engine level via Row Level Security (RLS) on all 20 tables. The database rejects any query by a customer requesting rows where `customer_id != auth.uid()`, returning empty results even if an ID is guessed.*

**Q: Why IBM Plex typography and no SVG icons?**  
> *A: Brightloop SMS is designed as an industrial ledger system. Banning SVG icons and non-standard colors improves page performance, eliminates visual ambiguity, guarantees WCAG AAA/AA readability, and enforces a dense, utilitarian UI focused on financial accuracy.*

