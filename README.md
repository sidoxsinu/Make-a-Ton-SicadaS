# Brightloop Subscription Management System

> High-integrity, ledger-style subscription lifecycle and automated recurring billing platform built with Next.js 14 App Router, Supabase (PostgreSQL, Row Level Security, Auth), and strict constraint-driven design system.
> 
> **Team:** SicadaS | **Hackathon:** Make-a-Ton

---

## Architecture Overview

- **Frontend & App Layer:** Next.js 14 (App Router, Server Components, Server Actions, Edge Runtime Streaming CSV Export).
- **Database & Business Rules Authority:** PostgreSQL 15+ hosted on Supabase. Financial calculations, state transitions, idempotency guards, and locks execute in pure PL/pgSQL database functions and triggers.
- **Security & Multi-Tenancy:** Row Level Security (RLS) active across all 20 database tables. Role isolation ensures customer users are confined to self-service portals, staff are limited to operational catalog/subscription workflows, and administrators control financial policies and staff privileges.
- **Design System Constraints:** Max 2px border radius, flat fills, 1px rules, zero box-shadows, zero gradients, zero SVG or emoji icon libraries (pure text labels), `#fff`/`bg-white` banned, strict WCAG AA contrast compliance with IBM Plex Sans and IBM Plex Mono fonts.

---

## 12-Step Setup & Deployment Guide

Follow these sequential steps to deploy and run the system with free-tier accounts:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sinanm/Make-a-Ton-SicadaS.git
   cd Make-a-Ton-SicadaS
   ```

2. **Install approved dependencies:**
   ```bash
   npm install
   ```

3. **Create a Supabase Project:**
   Sign up for a free account at [supabase.com](https://supabase.com) and create a new project (e.g. region `ap-south-1` Mumbai).

4. **Enable Database Extensions:**
   In the Supabase Dashboard, navigate to **Database -> Extensions** and toggle on `pg_cron` and `pg_trgm`.

5. **Configure Authentication Policies:**
   Under **Authentication -> Providers -> Email**, set minimum password length to `9`, and require lowercase, uppercase, and special symbols.

6. **Apply PostgreSQL Migrations:**
   In **SQL Editor**, run the migration scripts in sequence from `supabase/migrations/`:
   - `0001_schema.sql` (Tables, constraints, snapshots, audit triggers)
   - `0002_rls.sql` (Row level security policies, role helpers)
   - `0003_billing.sql` (Billing engine, state machines, financial calculators)
   - `0004_seed.sql` (Initial admin profile promotion helper)
   - `0005_indexes_and_perf.sql` (Composite indexes and query accelerators)

7. **Configure Environment Variables:**
   Create your local environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your project credentials from **Project Settings -> API**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-publishable-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

8. **Promote the First Administrator:**
   Sign up via `/signup` with your admin email (or create user via Supabase Auth), then execute in the Supabase SQL Editor:
   ```sql
   update profiles set role = 'admin' where id = (select id from auth.users where email = 'your-admin@brightloop.local');
   ```

9. **Verify Design System Bans:**
   Run the automated script to enforce design token compliance (no icons, no gradients, no shadows, 2px radius):
   ```bash
   npm run check:bans
   ```

10. **Execute Test Matrix:**
    Run the comprehensive unit, RLS, and pricing test suite:
    ```bash
    npm test
    ```

11. **Compile Optimized Production Build:**
    ```bash
    npm run build
    ```

12. **Start the Production Application:**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to access the platform.

---

## Core Feature Capabilities

- **Catalog & Plan Management:** Products with variant price surcharges, billing periods (daily, weekly, monthly, yearly), minimum line quantities, auto-close switches, and quotation validity defaults.
- **Quotation & Subscription State Machine:** Strict transitions (`draft` -> `quotation` -> `confirmed` -> `active` -> `paused` / `closed`) with PostgreSQL trigger line locks once confirmed.
- **Automated Billing Engine:** Transaction-level advisory locked (`pg_advisory_xact_lock`) billing generation with strict unique constraints preventing double billing for any period.
- **Discounts & Promotions Engine:** Product-level discounts, invoice-level subscription discounts, stacking rules, validity windows, and usage counter exhaustion guards.
- **Payments & Cashflow Ledger:** Real-time payment recordings against confirmed invoices with overpayment rejection and automated invoice status transitions.
- **Executive Analytics Dashboard:** Real-time MRR calculation, active subscription counts, accounts receivable aging ledgers (0-30, 31-60, 61+ days), 12-month collection history, and streaming CSV export.
- **Customer Self-Service Portal:** Tenant-isolated portal where customers inspect their subscriptions, self-manage allowed actions (pause, resume, close, renew), download printable tax invoices, and edit account details.

---

## Team Contributions & Roles

| Member | Focus Area | Key Contributions |
| :--- | :--- | :--- |
| **Muhammed Sinan** | Team Leader & Full Stack | System architecture, Next.js App Router scaffold, live PostgreSQL billing engine, RLS matrix, pricing parity, and payments engine. |
| **Malavika M.T.** | UX Flow & Verification | UI foundations, customer portal story review, acceptance testing, and team route layout validation. |
| **Roshan** | DB & Infrastructure | Supabase project initialization, migration architecture, composite index performance optimization, and keepalive automation. |
| **Lakshmi** | QA & Compliance Verification | Test case execution, acceptance criteria validation, prompt engineering verification, and test documentation. |

---

## Quality Assurance & Verification Commands

```bash
npm run check:bans   # Enforces zero icon, flat fill, 2px radius design constraints
npm run typecheck    # Strict TypeScript verification with no emitted errors
npm run lint         # Next.js ESLint verification
npm test             # 14 test suites covering 67 automated test cases
```
