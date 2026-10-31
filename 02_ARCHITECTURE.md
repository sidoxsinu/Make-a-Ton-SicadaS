# 02. Architecture and Zero Cost Stack

## 1. Platform decision

| Option | Customer portal for outside users | Roles and multi user | Free hosting | One codebase for team and customers | Verdict |
|---|---|---|---|---|---|
| Web app (Next.js + Supabase) | yes, any browser | yes, database enforced | yes | yes | Chosen |
| Java (Spring Boot or Swing) | needs a server and a web UI anyway | yes | free tiers sleep or limit | no, desktop client cannot serve customers | Rejected for the core. Desktop Swing cannot give customers a portal. |
| Swift (iOS or macOS) | customers would need an app install and an App Store account, which costs money | yes | App Store needs a paid developer account | no | Rejected. Violates C-1. |
| Web app now, native later | yes | yes | yes | yes | Possible later. A Swift or Tauri shell can call the same Supabase API without a rewrite. |

Reason in one line: the statement requires a customer self service portal plus team tools plus one database, and only a web app delivers all three with no spend.

## 2. Stack (all free, no card)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) with TypeScript | Server components give fast first paint. Server actions replace most API code. |
| Database, auth, row security | Supabase free tier (PostgreSQL, Auth, RLS) | Business rules live in SQL once, enforced for every client. |
| Scheduler | pg_cron inside Supabase | Billing job with no external worker. |
| Styling | Tailwind CSS with CSS variables as tokens | Tokens in one file, no component library defaults to fight (shadows, rounded corners). |
| Animation | GSAP and @gsap/react | Free for commercial use including plugins since the 2025 licence change. Confirm at gsap.com/standard-license before shipping. |
| Forms and validation | react-hook-form plus zod | One schema file per resource is used by form, server action and tests. |
| Email | Nodemailer over Brevo free SMTP (check the current daily limit), also set as Supabase Auth custom SMTP | Needed for reset links and invoice send. Supabase built in email is rate limited to a few messages per hour, so custom SMTP is required. |
| Fonts | @fontsource/ibm-plex-sans and @fontsource/ibm-plex-mono, self hosted | No external font requests, no banned fonts. |
| Charts | One small SVG component written in the repo | No chart library, full control of style, GSAP can animate it. |
| Tests | Vitest (unit), Playwright (end to end) | Both free. |
| Hosting | Vercel Hobby for the demo | Hobby is for personal non commercial use. For commercial use, deploy the same Next.js app on another free host and keep Supabase. |
| CI and keep alive | GitHub Actions | Free for public repositories. |

No table library, no UI kit, no icon library. Fewer dependencies means fewer changes.

## 3. System shape

```
Browser
  |  (session cookie, anon key only)
Next.js on Vercel
  - Server Components read data through the Supabase server client (RLS applies as the user)
  - Server Actions validate with zod, then call Supabase table writes or RPC functions
  - Route handlers: invoice send (SMTP), CSV export, staff creation (service role, admin only)
  |
Supabase
  - Auth (email and password, reset by email)
  - Postgres: tables, triggers, RLS, RPC functions, views
  - pg_cron: generate_due_invoices() daily
```

Rules of the shape:
1. Business rules (pricing, discounts, tax, state transitions, billing) exist only in SQL. The TypeScript pricing helper exists only to preview line amounts while editing a subscription, and a parity test pins it to the SQL result.
2. The browser never sees the service role key. Only the staff creation route handler uses it, after checking the caller is admin.
3. Every write goes through a server action. Server actions never trust form input; they re-validate with zod.
4. State changes (subscription status, invoice confirm or cancel) use RPC functions or guarded updates, never free form updates.

## 4. Repository layout

```
/
  app/
    (public)/login, signup, forgot-password, reset-password
    (team)/dashboard, customers, products, plans, templates, subscriptions,
           invoices, payments, discounts, taxes, payment-terms, staff, billing-runs, settings
    (portal)/portal, portal/subscriptions/[id], portal/invoices/[id], portal/account
    api/invoices/[id]/send/route.ts
    api/export/[resource]/route.ts
    api/admin/staff/route.ts
  components/
    ui/        Button, Field, Select, Badge, Table, Pager, Drawer, Dialog, Tabs, Money, DateText, EmptyState, Toast
    data/      ResourceList, ResourceForm, FilterBar, KpiLedger, BarSeries, LineItemsEditor, StateStepper, HistoryList
    shell/     TeamShell, PortalShell, NavList
  lib/
    supabase/  browser.ts, server.ts, admin.ts
    resources/ customers.ts, products.ts, plans.ts, templates.ts, taxes.ts, paymentTerms.ts, discounts.ts, staff.ts
    schema/    password.ts, common.ts (zod)
    pricing.ts, money.ts, dates.ts, roles.ts, csv.ts, mail.ts, motion.ts
  supabase/migrations/  0001_schema.sql ... 0004_seed.sql
  supabase/perf/        0005_perf_seed.sql
  tests/unit, tests/e2e
  docs/
```

## 5. Reuse strategy (minimal code change)

1. `defineResource` config. A resource file declares table, title, columns, filters, form fields, zod schema and permissions. `ResourceList` and `ResourceForm` render any resource. Customers, products, plans, templates, taxes, payment terms, discounts and staff are configuration only, around 40 lines each.
2. `LineItemsEditor` is used by subscription lines, quotation template lines and any future line based form. It takes column definitions and a price function.
3. `StateStepper` renders both subscription and invoice states from a list of steps and the current value.
4. `FilterBar` reads and writes URL search params. Every list page gets filtering, sorting and paging from the URL, which also makes pages shareable and cacheable.
5. `Money`, `DateText`, `Badge` are the only places that format money, dates and status labels. Changing currency or date format is a one file change.
6. `lib/motion.ts` is the only file that imports GSAP. Components call `useReveal`, `useCountUp`, `useStagger`, `useStepperFill`. Reduced motion is handled there once.
7. `roles.ts` exports a single permission map used by navigation, server actions and button visibility. The database remains the authority.

## 6. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only, used by api/admin/staff
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
NEXT_PUBLIC_APP_URL=
```
`.env.local` is git ignored. A `.env.example` with empty values is committed.

## 7. Free tier operations

- Supabase free projects pause after about a week without activity. Add `.github/workflows/keepalive.yml` that runs every 3 days and requests `NEXT_PUBLIC_SUPABASE_URL/rest/v1/` with the anon key header. Secrets are stored in the repository settings.
- Set the Vercel function region close to the Supabase region (for India, Mumbai on both) so each page makes its database calls over a short path. This matters for the 2 second budget.
- Database size on the free tier is limited (about 500 MB at the time of writing). The perf seed uses a small fraction of that. Verify current limits on the Supabase pricing page before relying on them.
- Backups: export the schema with `supabase db dump` before large changes. Free projects do not include scheduled backups.

## 8. Performance plan

1. Server components fetch only needed columns. No `select *` in list pages.
2. All lists paginate at 25 rows. Sort and filter columns have indexes (0001).
3. Total count uses the planned estimate when no filter is applied and the exact count when filters are applied.
4. Dashboard is one RPC, `dashboard_summary(from, to)`, returning JSON. It uses indexed aggregates only.
5. No client side data fetching waterfall on first paint. Interactive widgets (drawer, line editor) hydrate after the server rendered table is visible.
6. GSAP is imported only in client components that animate, and reveal animations never block content visibility.
7. Fonts are self hosted, two families, three weights.
8. Measure with the perf seed and the checks in 07, section 6.

## 9. Security checklist

- RLS enabled on all tables (0002). Test matrix in 07.
- Column level grants stop clients writing status or money fields directly.
- Password rule enforced in three places (form, server action, Supabase Auth settings).
- Only `app_metadata.role = staff` creates staff, and only via the admin route that checks `is_admin()` first.
- Rate limits: Supabase Auth defaults on, invoice send route limited to 20 emails per minute per admin.
- Output encoding is automatic in React. No `dangerouslySetInnerHTML`. Email HTML is built from escaped values.
- Secrets never in client bundles. Check `NEXT_PUBLIC_` prefixes in review.
