# BrightLoop SMS — Team Environment Setup Guide

This guide enables teammates (**Roshan**, **Malavika**, **Lakshmi**) and evaluators to set up the **BrightLoop Subscription & Invoicing Management System** locally in under 2 minutes.

---

## 1. Quick Start (1-Minute Setup)

### Step 1: Clone & Install Dependencies
Ensure you have **Node.js 20+** installed.
```bash
git clone https://github.com/Make-a-Ton-SicadaS/brightloop-sms.git
cd brightloop-sms
npm install
```

### Step 2: Configure Environment Variables
You have two options:

#### Option A: Copy the Team Preset (Recommended)
Ask Sinan for `.env.team.local` (or copy the pre-configured file from internal channel), then copy it to `.env.local`:
```bash
cp .env.team.local .env.local
```

#### Option B: Create `.env.local` Manually
Create a file named `.env.local` in the project root with the following exact values:

```env
# Supabase Production Backend (Live Hosted Instance)
NEXT_PUBLIC_SUPABASE_URL=https://sjeaqqpxmafsjpzgkmvr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_gLXXbbK2bikWcv6psj00ng_KeBFkHmm
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZWFxcXB4bWFmc2pwemdrbXZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzQxNDQyMSwiZXhwIjoyMTA4OTkwNDIxfQ.u_z2Kfp6nWsL5-TXCHol72fv3zS7kMUzMFL9I4y7AB0

# App Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Transactional Email (Optional for local dev, console fallback active)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=billing@brightloop.com
```

> [!NOTE]
> `.env.local` and `.env.*.local` are already added to `.gitignore`. Your secrets will never be committed to Git.

---

## 2. Verify Database Connectivity

Run the pre-flight verification scripts to ensure full connectivity and RLS compliance:

```bash
# 1. Verify environment variables and ping Supabase REST endpoints:
npm run db:check

# 2. Verify live DB round-trip latency & database version:
npm run db:ping
```

Expected output:
```text
==> Checking database environment variables...
[OK] NEXT_PUBLIC_SUPABASE_URL is configured
[OK] NEXT_PUBLIC_SUPABASE_ANON_KEY is configured
[OK] SUPABASE_SERVICE_ROLE_KEY is configured
[OK] Live Supabase REST reachable: HTTP 200 OK
```

---

## 3. Pre-Seeded Production & Demo Accounts

The live database is pre-seeded with clean production catalog items, active subscriptions, and authenticated test users:

| Role | Email | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `sinan@brightloop.local` | `password123` | Full administrative access: invoices, subscriptions, catalog, discounts, billing run |
| **Staff** | `staff@brightloop.local` | `password123` | Staff access: view catalog, subscriptions, invoices, create payments |
| **Customer** | `demo.customer@brightloop.com` | `password123` | Customer Portal: view own active subscriptions, download invoices, pay outstanding balance |

---

## 4. Run Test Suites & Static Analysis

Before making commits, always run the full verification pipeline:

```bash
# Design system compliance check (verifies 0 banned SVG/white classes):
npm run check:bans

# TypeScript strict type checking:
npm run typecheck

# ESLint check:
npm run lint

# Run all 16 Vitest unit and integration test suites:
npm test

# Run all Playwright end-to-end user journey tests:
npm run e2e

# Run Next.js production build:
npm run build
```

---

## 5. Clean Test Records Script

If you run exploratory tests that create ephemeral customers or discounts with timestamp suffixes, clean them up anytime using:

```bash
npm run db:clean
```
This preserves the canonical demo companies (`NexaCorp`, `BlueSky Logistics`, `ZenFlow Health`) and demo users while purging ephemeral test entities.

---

## 6. Architecture & Data Flow

- **Frontend:** Next.js 14 App Router, Server Components + selective Client Components (`"use client"`).
- **Backend:** PostgreSQL 15+ hosted on Supabase.
- **Security:** Pure PostgreSQL Row Level Security (RLS) enforcing tenant isolation.
- **Design Tokens:** Design system tokens strictly enforced in `tailwind.config.ts` (0 SVG icons, maximum 2px radius, flat monochrome fills, no `#fff` or `bg-white`).
- **No Mock Data:** All routes pull directly from live Supabase tables via `@supabase/ssr`.

