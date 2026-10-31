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
