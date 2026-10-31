# Brightloop

Ledger-grade subscription lifecycle and automated recurring billing platform.

**Team SicadaS** · Make-a-Ton Hackathon

Built with Next.js 14 (App Router) and Supabase (PostgreSQL, Row Level Security, Auth). All financial logic lives in the database, not the app layer.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Team](#team)

---

## Features

| Area | Capabilities |
| :--- | :--- |
| **Catalog** | Products, variant price surcharges, billing periods (daily, weekly, monthly, yearly), minimum line quantities, auto-close, default quotation validity |
| **Lifecycle** | `draft` → `quotation` → `confirmed` → `active` → `paused` / `closed`. Lines are locked by a database trigger once confirmed |
| **Billing** | Advisory-locked invoice generation (`pg_advisory_xact_lock`) with unique constraints that prevent double billing for any period |
| **Discounts** | Product-level and invoice-level discounts, stacking rules, validity windows, usage-limit guards |
| **Payments** | Payments recorded against confirmed invoices, overpayment rejection, automatic invoice status transitions |
| **Analytics** | MRR, active subscriptions, receivables aging (0–30, 31–60, 61+ days), 12-month collection history, streaming CSV export |
| **Customer portal** | Tenant-isolated view of subscriptions, self-service pause / resume / close / renew, printable tax invoices, account editing |

---

## Architecture

- **App layer:** Next.js 14 with Server Components, Server Actions, and Edge Runtime streaming for CSV export.
- **Business rules:** PostgreSQL 15+ on Supabase. Calculations, state transitions, idempotency guards, and locks run as PL/pgSQL functions and triggers, so the database is the single source of truth.
- **Security:** Row Level Security on all 20 tables.

  | Role | Access |
  | :--- | :--- |
  | Customer | Own self-service portal only |
  | Staff | Catalog and subscription operations |
  | Admin | Financial policies and staff privileges |

- **Design system:** Max 2px border radius, flat fills, 1px rules, no box-shadows, no gradients, no icon libraries or emoji (text labels only), `#fff` / `bg-white` banned, WCAG AA contrast, IBM Plex Sans and IBM Plex Mono. Enforced by `npm run check:bans`.

---

## Prerequisites

- Node.js 18.17 or later and npm
- A free [Supabase](https://supabase.com) account
- Git

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/sinanm/Make-a-Ton-SicadaS.git
cd Make-a-Ton-SicadaS
npm install
```

### 2. Create the Supabase project

1. Create a new project (for example, region `ap-south-1` Mumbai).
2. Go to **Database → Extensions** and enable `pg_cron` and `pg_trgm`.
3. Go to **Authentication → Providers → Email** and set the minimum password length to `9`, requiring lowercase, uppercase, and special characters.

### 3. Apply migrations

In the Supabase **SQL Editor**, run these files from `supabase/migrations/` **in order**:

| # | File | Contents |
| :-: | :--- | :--- |
| 1 | `0001_schema.sql` | Tables, constraints, snapshots, audit triggers |
| 2 | `0002_rls.sql` | Row Level Security policies, role helpers |
| 3 | `0003_billing.sql` | Billing engine, state machines, financial calculators |
| 4 | `0004_seed.sql` | Initial admin promotion helper |
| 5 | `0005_indexes_and_perf.sql` | Composite indexes and query accelerators |

### 4. Configure environment

```bash
# For teammates & quick setup (see docs/ENVIRONMENT_SETUP.md for full credentials guide):
cp .env.example .env.local
```

Fill in the values from **Project Settings → API** (see [Environment Variables](#environment-variables)). For SicadaS teammates, refer to `docs/ENVIRONMENT_SETUP.md` or copy the pre-configured `.env.team.local`.

### 5. Create the first administrator

Sign up at `/signup` (or create the user in Supabase Auth), then run in the SQL Editor:

```sql
update profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'your-admin@brightloop.local'
);
```

### 6. Verify

```bash
npm run check:bans   # Design system compliance
npm test             # Unit, RLS, and pricing tests
```

### 7. Build and run

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

For development with hot reload, use `npm run dev`.

---

## Environment Variables

| Variable | Description | Exposure |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon / publishable key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key, bypasses RLS | **Server only** |
| `NEXT_PUBLIC_APP_URL` | App base URL, e.g. `http://localhost:3000` | Public |

> **Security:** Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It bypasses Row Level Security.

---

## Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run check:bans` | Enforce design constraints (no icons, gradients, shadows; 2px radius) |
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint` | Next.js ESLint |
| `npm test` | 16 test suites, 79 test cases (unit, financial golden vectors, RLS) |
| `npm run e2e` | Playwright end-to-end tests (6 critical user journeys) |
| `npm run db:check` | Verify live Supabase environment configuration |
| `npm run db:ping` | Test live database connection & round-trip latency |
| `npm run db:clean` | Purge throwaway test records while preserving demo data |
| `npm run db:demo-seed` | Seed demo accounts, subscriptions & overdue invoice |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

---

## Troubleshooting

| Symptom | Likely cause and fix |
| :--- | :--- |
| Migration fails with "relation does not exist" | Migrations were run out of order. Run `0001` through `0005` sequentially. |
| `pg_cron` or `pg_trgm` errors | Extensions not enabled. Toggle them on under **Database → Extensions** and re-run. |
| Signup rejected | Password must be at least 9 characters with lowercase, uppercase, and a special character. |
| Admin pages return no data | The admin promotion SQL was not run, or the email does not match. Check `profiles.role`. |
| App fails to start with Supabase errors | `.env.local` is missing or has wrong values. Restart the dev server after editing it. |
| `check:bans` fails | A banned pattern (icon, gradient, shadow, radius above 2px, `#fff`) was introduced. Fix the offending file it reports. |

---

## Team

| Member | Role | Contributions |
| :--- | :--- | :--- |
| **Muhammed Sinan** | Team Leader, Full Stack | Architecture, Next.js scaffold, PostgreSQL billing engine, RLS matrix, pricing parity, payments engine |
| **Malavika M.T.** | UX Flow, Verification | UI foundations, customer portal story review, acceptance testing, route layout validation |
| **Roshan** | Database, Infrastructure | Supabase initialization, migration architecture, composite index optimization, keepalive automation |
| **Lakshmi** | QA, Compliance | Test case execution, acceptance criteria validation, prompt engineering verification, test documentation |
