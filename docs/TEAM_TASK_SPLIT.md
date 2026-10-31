# Brightloop SMS — Team Task Split

> Make-a-Ton Hackathon | Team SicadaS
> System: Brightloop Subscription Management System
> Stack: Next.js + Supabase + Tailwind + GSAP

---

## Team Profiles

| # | Name | Availability | Skills |
|---|------|-------------|--------|
| 1 | **Sinan** (Leader) | Highest | Full-stack (FE-heavy), cloud, architecture, all areas |
| 2 | **Roshan** | Low-medium | Backend, databases, cloud gateways, SQL, infra |
| 3 | **Malavika** | High (2nd after Sinan) | 3D design, storytelling/flow, testing, prompting, QA |
| 4 | **Lakshmi** | Half-day only | Prompting, testing, needs guided instructions |

---

## Phase → Owner Matrix

```
Phase 0  Foundation          → Sinan (1 person job, critical path)
Phase 1  Database + Auth     → Roshan (leads SQL) + Sinan (leads Auth)
Phase 2  Catalog             → Sinan (defineResource) + Malavika (testing)
Phase 3  Subscriptions       → Sinan (leads) + Malavika (flow checks)
Phase 4  Billing + Invoices  → Roshan (billing SQL wiring) + Sinan (invoice UI)
Phase 5  Discounts           → Sinan (UI) + Roshan (SQL parity)
Phase 6  Payments + Dashboard → Sinan (dashboard) + Malavika (testing)
Phase 7  Customer Portal     → Malavika (portal flow) + Sinan (code)
Phase 8  Perf + Hardening    → Roshan (DB tuning) + Sinan + Malavika (E2E journeys) + Lakshmi (guided testing)
```

---

## Teammate 1 — Sinan (Leader)

**Role:** Architect + Lead Developer. Owns all technical decisions, code structure, and any cross-cutting concerns.

### Your Tasks

#### Pre-Build (Do First, Before Any Code)
- [ ] Read all PRD documents in order: `00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → MASTER_PROMPT`
- [ ] **Fix the critical SQL bug** in `docs/0001_schema.sql` line 237: change `confirmed → active` to `confirmed → active, closed` in `sub_status_guard()`
- [ ] Create `docs/BUILD_LOG.md` with the system summary (as required by MASTER_PROMPT)
- [ ] Brief the team: share the PRD analysis doc and each person's task list

#### Phase 0 — Foundation (Sinan Solo)
- [ ] Bootstrap Next.js app with TypeScript and Tailwind
- [ ] Set up `styles/tokens.css` with all CSS variables from `05_DESIGN_SYSTEM`
- [ ] Configure `tailwind.config.ts` (radius override to 2px, no shadows, color map)
- [ ] Import IBM Plex Sans + IBM Plex Mono via fontsource
- [ ] Build ALL UI primitives: `Button`, `Field`, `Badge`, `Money`, `DateText`, `Table`, `Pager`, `Drawer`, `Dialog`, `Tabs`, `Toast`, `EmptyState` — one file each in `components/ui/`
- [ ] Build `components/shell/TeamShell` and `PortalShell` and `NavList`
- [ ] Set up `scripts/check-bans.mjs` (copy from `docs/`)
- [ ] Set up `package.json` scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `e2e`, `check:bans`
- [ ] Create `.env.example` (empty values for all 8 env vars)
- [ ] Verify: shell renders with rail, topbar, tokens. Run `check:bans`. Record contrast ratios.
- [ ] Commit: `"phase 0: scaffold, tokens, shell"`

#### Phase 1 — Auth (Sinan owns Auth UI, Roshan owns SQL)
- [ ] Create `lib/supabase/browser.ts`, `server.ts`, `admin.ts` (add `import 'server-only'` to server + admin)
- [ ] Create `middleware.ts` with role-based redirects
- [ ] Create `lib/schema/password.ts` (zod passwordSchema)
- [ ] Create `lib/roles.ts` permission map
- [ ] Build auth pages: `(public)/login`, `signup`, `forgot-password`, `reset-password`
- [ ] Build server actions: `signUp`, `signIn`, `requestReset`, `setNewPassword`, `signOut`
- [ ] Test: run AC-AUTH-1 through AC-AUTH-5
- [ ] Commit: `"phase 1: schema, rls, auth"`

#### Phase 2 — Resource Framework + Catalog
- [ ] Build the `defineResource` engine
- [ ] Build `ResourceList`, `ResourceForm`, `FilterBar`
- [ ] Write resource configs: `taxes`, `paymentTerms`, `products`, `plans`, `templates`, `customers`, `discounts`, `staff`
- [ ] Wire navigation entries from `lib/roles.ts`
- [ ] Add `LineItemsEditor` for products/variants and templates
- [ ] Test: AC-CAT-1, AC-CAT-2, AC-CAT-3
- [ ] Commit: `"phase 2: resource framework and catalog"`

#### Phase 3 — Subscriptions
- [ ] Write `lib/pricing.ts` (editor preview only, parity with V1 and V4)
- [ ] Build `StateStepper`, `HistoryList`, `TotalsLedger`, `ActionBar`
- [ ] Build subscription list, new, detail pages
- [ ] Build template-to-subscription drawer
- [ ] Wire transition actions (`sub_transition` RPC)
- [ ] Test: AC-SUB-1 through AC-SUB-5 + transition matrix
- [ ] Commit: `"phase 3: subscriptions and lifecycle"`

#### Phase 4 — Invoices UI (Roshan owns billing SQL wiring)
- [ ] Build invoice list, detail, print route + print stylesheet
- [ ] Build invoice send route (`api/invoices/[id]/send`) with `lib/mail.ts`
- [ ] Build Billing Runs screen with "Run billing now" button
- [ ] Build Settings screen (auto confirm toggle, currency, company name)
- [ ] Test: AC-INV-1 through AC-INV-5 (coordinate with Roshan for billing tests)
- [ ] Commit: `"phase 4: billing and invoices"`

#### Phase 5 — Discounts UI
- [ ] Build discounts resource with product picker and subscription picker
- [ ] Add computed state column (Scheduled/Running/Expired/Exhausted/Inactive)
- [ ] Test: AC-DSC-1 through AC-DSC-3
- [ ] Commit: `"phase 5: discounts"`

#### Phase 6 — Dashboard + Payments UI
- [ ] Build payments list and record drawer
- [ ] Build overdue view
- [ ] Build `KpiLedger`, `BarSeries` SVG chart
- [ ] Build dashboard page wired to `dashboard_summary` RPC
- [ ] Build CSV export route (`api/export/[resource]`) — use Edge runtime
- [ ] Test: AC-PAY-1 through AC-PAY-3, AC-RPT-1, AC-RPT-2
- [ ] Commit: `"phase 6: payments and dashboard"`

#### Phase 7 — Customer Portal (Malavika leads flow checks)
- [ ] Build portal shell (top bar nav instead of rail)
- [ ] Build portal pages: `/portal`, `/portal/subscriptions/[id]`, `/portal/invoices/[id]`, `/portal/account`
- [ ] Wire customer actions (pause, resume, close, renew) with Dialog confirmations
- [ ] Test: AC-POR-1 + full RLS matrix
- [ ] Commit: `"phase 7: portal"`

#### Phase 8 — Performance + Release
- [ ] Coordinate perf test run on throwaway Supabase project (Roshan does DB tuning, Sinan sets it up)
- [ ] Add keep-alive GitHub Actions workflow (`.github/workflows/keepalive.yml`)
- [ ] Finalize README (free setup in ≤15 steps)
- [ ] Run security checklist from `02_ARCHITECTURE` section 9
- [ ] Tag `v1.0.0`
- [ ] Commit: `"phase 8: performance and release"`

---

## Teammate 2 — Roshan

**Role:** Database & Infrastructure Lead. Owns all SQL execution, RLS, billing engine, and performance tuning.

### Your Tasks

#### Pre-Build
- [ ] Read `01_PRD.md` section 2, 4.4, 4.5 (billing and discounts)
- [ ] Read ALL of `03_DATA_AND_RULES.md` carefully (billing algorithm, state machines)
- [ ] Read `0001_schema.sql`, `0002_rls.sql`, `0003_billing.sql`, `0004_seed.sql`
- [ ] Read `07_TEST_AND_ACCEPTANCE` sections 2, 5, 6, 7 (golden vectors, RLS matrix, perf budget)
- [ ] **Create free Supabase project** (free tier, choose ap-south-1 Mumbai region)
- [ ] Enable `pg_cron` extension in Supabase dashboard (Database → Extensions)
- [ ] Configure Brevo SMTP in Supabase Auth settings (custom SMTP)

#### Phase 1 — SQL Execution (Critical)
- [ ] Copy `docs/0001_schema.sql` through `0004_seed.sql` to `supabase/migrations/`
- [ ] **First: fix the critical bug** in `0001_schema.sql` (Sinan will tell you what to change — `confirmed → active, closed` in the trigger)
- [ ] Run migrations 0001 → 0004 in order via Supabase SQL editor
- [ ] Fix any syntax errors found during execution. Log each fix in `docs/BUILD_LOG.md`
- [ ] Set Auth password rules in Supabase dashboard: min length 9, require uppercase, lowercase, symbol
- [ ] Promote first admin: run the SQL from `0004_seed.sql` that promotes the first signup
- [ ] **Run golden vectors V7, V8, V9** in SQL editor to validate `add_periods()` function
- [ ] Verify RLS: connect as customer role and confirm they CANNOT read `products` or `cost_price`
- [ ] Share the Supabase URL and anon key with Sinan (via private message, never commit)

#### Phase 4 — Billing Engine Validation
- [ ] After Sinan builds the invoice UI, you validate the billing SQL
- [ ] Run golden vectors **V1 through V6** in the SQL editor directly
- [ ] Run the billing job manually via `run_billing()` RPC call in SQL editor
- [ ] Test idempotency: run `run_billing()` twice, confirm no duplicate invoices created
- [ ] Test catch-up: manually set a subscription's `next_invoice_date` to 3 days ago, run billing, confirm 3 invoices created
- [ ] Test concurrent runs: if possible, open two SQL editor tabs and fire `run_billing()` simultaneously
- [ ] Verify `pg_cron` schedule is active (should be set by `0003_billing.sql`)
- [ ] Log results in `BUILD_LOG.md`

#### Phase 5 — Discount SQL Validation
- [ ] Run golden vectors **V2, V3, V5, V6** through the real billing function
- [ ] Confirm usage limits work correctly (V exhausted limit scenario)
- [ ] Log results

#### Phase 6 — Dashboard RPC Validation
- [ ] Run the 4 independent SQL checks from `07_TEST_AND_ACCEPTANCE` section 4
- [ ] Compare each result to the dashboard JSON from `dashboard_summary()`
- [ ] They must match to the cent. If not, debug the RPC.
- [ ] Run V10 (MRR formula) in SQL editor

#### Phase 8 — Performance Tuning
- [ ] Create a **second** free Supabase project for perf testing only
- [ ] Run `0005_perf_seed.sql` on the perf project
- [ ] Run `EXPLAIN (ANALYZE, BUFFERS)` on the exact queries for each page listed in `07` section 7
- [ ] If any query does a sequential scan on a large table, create `0006_indexes.sql`
- [ ] Check if `pg_trgm` extension is needed for customer name search (it probably is at 10k rows)
- [ ] Record all measured query times in `BUILD_LOG.md`
- [ ] Verify `keepalive.yml` workflow works (triggers a request to keep Supabase project alive)

---

## Teammate 3 — Malavika

**Role:** UX Flow, Story Verification, Testing Lead & Portal Quality. Most available besides Sinan — serves as a "second pair of eyes" on everything.

### Your Tasks

#### Pre-Build
- [ ] Read `01_PRD.md` fully — especially personas (section 3) and scope scenes (section 4)
- [ ] Read `05_DESIGN_SYSTEM.md` fully — you are the design system enforcer
- [ ] Read `06_SCREENS_AND_COMPONENTS.md` fully — you own the UX story
- [ ] Read `07_TEST_AND_ACCEPTANCE.md` section 1 (acceptance criteria) and section 8 (E2E journeys J1-J9)
- [ ] Create a simple checklist document in the repo: `docs/UX_CHECKLIST.md` with every screen listed and columns: Roles correct, Empty state, Error state, Loading state, Keyboard usable, check:bans passes, Design matches spec

#### Phase 0 — Design Review
- [ ] When Sinan has the shell running, open it in a browser
- [ ] Check every token/color against `05_DESIGN_SYSTEM.md` tokens section
- [ ] Verify: no rounded corners above 2px, no shadows, no icons, IBM Plex fonts loading
- [ ] Contrast check: use WebAIM Contrast Checker for `--accent (#1E4D5C) on --paper (#EFEBE2)` — report the ratio. If below 4.52:1, flag to Sinan immediately
- [ ] Write result to `BUILD_LOG.md`

#### Phase 2 — Catalog Flow Checking
- [ ] When Sinan has Products, Plans, Templates running:
- [ ] Walk the "Launching a new plan" story from `01_PRD` section 4.2 manually
- [ ] Verify every field listed in the PRD is present in the form
- [ ] Try to create a product with a variant, set a price, create a plan with all 4 switches
- [ ] Create a quotation template with lines
- [ ] Check: are all empty states correct? ("No products yet. Add a product.")
- [ ] Run AC-CAT-1 manually in the browser (variant price calculation)
- [ ] File any issues as GitHub Issues or notes in `BUILD_LOG.md`

#### Phase 3 — Subscription Lifecycle Story
- [ ] Walk the complete "subscription lifecycle" story:
  1. Create a customer
  2. Create subscription from template
  3. Move Draft → Quotation → Confirmed → Active (check history shows 4 rows)
  4. Try an illegal transition (e.g., Active → Draft) — confirm it's blocked
  5. Pause the subscription (on a pausable plan) — confirm next_invoice_date clears
  6. Resume — confirm billing anchor resets
- [ ] Verify `StateStepper` updates correctly at each step
- [ ] Verify `HistoryList` shows all transitions with timestamps
- [ ] Run AC-SUB-1 through AC-SUB-5

#### Phase 6 & 7 — Portal Story (Your Core Ownership)
- [ ] You own the full customer portal review
- [ ] Log in as a test customer
- [ ] Verify you can ONLY see your own subscriptions and invoices
- [ ] Verify the portal layout uses top bar (not rail)
- [ ] Test pause, resume, close, renew with Dialog confirmations
- [ ] Try to access `/dashboard` as a customer — confirm redirect to `/portal`
- [ ] Try to access another customer's invoice by ID — confirm "you do not have access"
- [ ] Verify print invoice works from the portal
- [ ] Verify account page: edit name, phone, address saves correctly
- [ ] Run AC-POR-1

#### Phase 8 — E2E Journey Testing
- [ ] Run Playwright E2E journeys J1 through J9 in order (Sinan will set up Playwright)
- [ ] For each journey, record: Pass/Fail, any UI text that violates the copy rules (no em dashes, no exclamation marks, no emoji)
- [ ] Run the full design check against `docs/UX_CHECKLIST.md` you created earlier
- [ ] Final review: does the app tell a coherent story from signup → subscription → invoice → payment? Write a 1-paragraph summary in `BUILD_LOG.md`.

---

## Teammate 4 — Lakshmi

**Role:** Guided Tester & Prompt Verifier. Available half-day. Focuses on structured, step-by-step testing tasks that can be completed in focused short sessions.

> [!NOTE]
> Lakshmi's tasks are designed to be self-contained with clear "do this, expect this" instructions. No background knowledge is needed beyond following the steps.

### Your Tasks

#### Pre-Build (15 min read)
- [ ] Read `07_TEST_AND_ACCEPTANCE.md` section 3 (Password Rule Table) only
- [ ] Read `01_PRD.md` section 3 (Personas table) only
- [ ] You don't need to read the architecture or SQL docs

#### Phase 1 — Password Rule Testing (When Sinan says Phase 1 is done)

**How to do this:** Open the signup page in your browser. Try each password below. Write Pass or Fail next to each.

| Password | You type | Expected | Actual |
|----------|----------|----------|--------|
| `Abcdefg1!` | Type in password field | Should PASS (form shows all rules met) | |
| `Abcdefg!` | Type in password field | Should FAIL (not enough characters) | |
| `abcdefgh1!` | Type in password field | Should FAIL (no uppercase) | |
| `ABCDEFGH1!` | Type in password field | Should FAIL (no lowercase) | |
| `Abcdefgh12` | Type in password field | Should FAIL (no special character) | |

Write your results in a message to Sinan.

#### Phase 4 — Manual Invoice Testing (When Sinan says Phase 4 is done)

**Step by step:**
1. Log in as an Admin user (Sinan gives you credentials)
2. Go to Subscriptions → click any "Active" subscription
3. Click "Bill now" in the action bar
4. Go to Invoices — a new invoice should appear with status "Draft"
5. Click on the invoice — check it has the customer name, line items, and amounts
6. Click "Confirm invoice" — status should change to "Confirmed"
7. Try to edit any amount on the invoice — it should NOT let you
8. Click "Cancel" — confirm it asks you "are you sure?" before cancelling
9. Write Pass or Fail for each step in a message to Sinan

#### Phase 6 — Payment Recording Testing (When Sinan says Phase 6 is done)

**Step by step:**
1. Log in as Admin
2. Go to Payments → click "Record payment"
3. A drawer should open. Search for a confirmed invoice by typing customer name
4. The "Amount" field should default to the full amount due
5. Change method to "UPI"
6. Click Save — you should see a success message
7. Go back to the invoice — its status should now be "Paid" (if full amount)
8. Try to record another payment on a Paid invoice — it should be rejected
9. Write Pass or Fail for each step

#### Phase 7 — Customer Portal Testing (When Malavika says Phase 7 is done)

**Step by step:**
1. Sign up as a new customer using the public signup page
2. Log in — you should land on `/portal`, NOT `/dashboard`
3. You should see your subscriptions and invoices listed
4. Click any subscription — you should only see your own details
5. Try to go to `/dashboard` by typing it in the address bar — you should be sent back to `/portal`
6. Go to Account page — edit your name, save it — check the name changed
7. Write Pass or Fail for each step in a message to Sinan

#### Phase 8 — Copy & Content Audit

**What to look for:** Read every button label and error message on these pages and flag anything that:
- Has an exclamation mark (!)
- Has an emoji 😊
- Uses a dash like this — (em dash, two dashes) instead of a comma or hyphen
- Says "it is not X, it is Y" type phrasing
- Has "Error" without saying what to do

**Pages to check:** Login, Signup, Dashboard, Subscriptions list, Invoice detail, Portal home, Portal account

Write a list of all text that seems odd or wrong to you. Even if you're not sure — report it to Malavika or Sinan.

---

## Coordination Notes

### Communication Protocol
- **Sinan** is the merge authority. All code goes through Sinan before commit.
- **Roshan** works async on SQL tasks. Share results via `BUILD_LOG.md` or DM.
- **Malavika** works in parallel on testing/review while Sinan codes.
- **Lakshmi** is given a specific task when a phase is "done" — Sinan or Malavika assigns her.

### Unblocking
- If Roshan is stuck on SQL: Sinan handles it.
- If Malavika finds a design bug: open a GitHub Issue and tag Sinan.
- If Lakshmi is confused about a step: Malavika explains it to her.
- If any phase is taking too long: Sinan re-assesses what's in scope for the hackathon.

### Environment Setup (Sinan does this first, shares with team)
1. Sinan creates the GitHub repo and pushes the initial structure
2. Roshan creates the Supabase project and shares URL/keys via private channel
3. Sinan adds keys to `.env.local` and adds them to Vercel project settings
4. Malavika and Lakshmi only need a browser — they test the deployed preview URL

### Hackathon Scope Priority (If Short on Time)
If time is short, ship in this order:
1. ✅ Phase 0, 1, 2 (foundation, auth, catalog) — minimum viable
2. ✅ Phase 3 (subscriptions) — core product
3. ✅ Phase 4 (billing + invoices) — key differentiator
4. ⚠️ Phase 6 (dashboard) — impressive demo piece
5. ⚠️ Phase 7 (portal) — nice to have for demo
6. 🔶 Phase 5, 8 — defer if time-pressed
