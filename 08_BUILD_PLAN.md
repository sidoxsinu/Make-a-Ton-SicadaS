# 08. Build Plan

Rules for every phase:
1. Touch only the files the phase lists. Do not refactor earlier phases unless a test fails.
2. Reuse before writing. If a component in 06 exists, use it. If a second screen needs something a first screen built, move it into `components/` in that same commit.
3. End each phase with: `npm run check:bans && npm run typecheck && npm run lint && npm test`, then commit with the message shown.
4. Append what was done, decisions and measured numbers to `docs/BUILD_LOG.md`.
5. If a SQL file fails on the database, fix the SQL file in `supabase/migrations`, record the fix in the build log, and continue. Never work around a database error in application code.

## Phase 0. Foundation (commit: "phase 0: scaffold, tokens, shell")

Create: Next.js app with TypeScript and Tailwind, `styles/tokens.css`, `tailwind.config.ts` (radius, shadow overrides from 05), fontsource imports, `lib/motion.ts` (all hooks, reduced motion guard), `components/ui/*` (Button, Field and inputs, Badge, Money, DateText, Table, Pager, Drawer, Dialog, Tabs, Toast, EmptyState), `components/shell/*`, `scripts/check-bans.mjs`, `package.json` scripts: `dev, build, lint, typecheck, test, e2e, check:bans`, `.env.example`, `.gitignore`, README skeleton.
Done when: an empty authenticated shell renders with the rail, top bar, tokens and fonts, contrast of every token pair is recorded in the build log, `check:bans` is clean.

## Phase 1. Database and auth (commit: "phase 1: schema, rls, auth")

Create Supabase project (free), enable pg_cron under Database Extensions, set Auth password rules (min 9, lower, upper, symbol), configure Brevo SMTP in Auth settings. Copy SQL files to `supabase/migrations`, run 0001 to 0004, fix any error. Create `lib/supabase/*`, `middleware.ts`, `lib/schema/password.ts`, signup, login, forgot, reset pages and actions, `lib/roles.ts`, role redirect logic. Promote first admin with the SQL in 0004.
Done when: AC-AUTH-1 to AC-AUTH-5 pass. Golden vectors V7 to V9 pass in SQL (`add_periods`). RLS matrix rows for anon and customer pass.

## Phase 2. Catalog (commit: "phase 2: resource framework and catalog")

Create: `defineResource`, `ResourceList`, `ResourceForm`, `FilterBar`, then resource files for taxes, payment terms, products (with variants editor), plans, templates (with `LineItemsEditor`), customers. Navigation entries from the permission map.
Done when: AC-CAT-1 to AC-CAT-3 pass. Adding the `taxes` resource took only its config file and a navigation line, recorded in the log as proof of reuse.

## Phase 3. Subscriptions (commit: "phase 3: subscriptions and lifecycle")

Create: `lib/pricing.ts` with tests (V1, V4), `StateStepper`, `HistoryList`, `TotalsLedger`, `ActionBar`, subscription list, new, detail pages, template to subscription drawer, transition actions, customer assignment.
Done when: AC-SUB-1 to AC-SUB-5 pass and the transition matrix in 07 section 5 is green.

## Phase 4. Billing engine and invoices (commit: "phase 4: billing and invoices")

Create: invoice list and detail, print route and print stylesheet, send route with `lib/mail.ts`, bulk confirm, Billing runs screen, cron schedule line from 0003, settings screen for auto confirm.
Done when: AC-INV-1 to AC-INV-5 pass, vectors V1, V4 to V6 pass in SQL, idempotency and catch up tests pass.

## Phase 5. Discounts (commit: "phase 5: discounts")

Create: discounts resource with product and subscription pickers, computed state column.
Done when: AC-DSC-1 to AC-DSC-3 pass and vectors V2, V3, V5, V6 pass through the real billing function.

## Phase 6. Payments and dashboard (commit: "phase 6: payments and dashboard")

Create: payments list and record drawer, overdue view usage, `KpiLedger`, `BarSeries`, dashboard page, CSV export route.
Done when: AC-PAY-1 to AC-PAY-3, AC-RPT-1, AC-RPT-2 pass, V10 passes.

## Phase 7. Customer portal (commit: "phase 7: portal")

Create: portal shell, portal pages, customer actions with `Dialog`, account page.
Done when: AC-POR-1 passes and the full RLS matrix is green.

## Phase 8. Performance, hardening, release (commit: "phase 8: performance and release")

Run `0005_perf_seed.sql` on a throwaway project, measure with 07 section 7, add `0006_indexes.sql` if needed, run all Playwright journeys, add the keep alive workflow, finalise README, remove perf data, run the security checklist in 02 section 9, tag `v1.0.0`.
Done when: section 10 of 07 is satisfied.

## Dependency list (the only packages to install)

Runtime: `next react react-dom @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers gsap @gsap/react nodemailer @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono`
Dev: `typescript tailwindcss postcss autoprefixer eslint eslint-config-next vitest @playwright/test @types/node @types/react @types/nodemailer`
Anything else needs a written reason in the build log.

## Suggested time split for a solo builder

Phase 0 and 1 first, because everything depends on them. Phases 2 and 3 are the largest. Phases 4 to 6 are mostly SQL already written, so they are screen work. Phase 8 must be reserved, not skipped, since the 2 second target is a stated requirement.
