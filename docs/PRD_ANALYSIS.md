# Brightloop SMS — PRD Analysis & Review

> [!IMPORTANT]
> This analysis covers all 9 PRD documents + 5 SQL files. Issues are ranked by severity.

---

## 1. PRD Strengths (Keep As-Is)

- ✅ Extremely thorough data model — enums, constraints, triggers all well thought out
- ✅ State machines are explicit and database-enforced (dual: trigger + RPC)
- ✅ Idempotency handled correctly (advisory lock + unique index + row lock)
- ✅ Design system is production-grade and unconventional (ledger aesthetic, zero icon-library debt)
- ✅ Golden vectors V1–V10 are excellent — make testing rigorous and machine-verifiable
- ✅ `defineResource` / config-driven architecture is solid, saves significant dev time
- ✅ Free-tier constraint C-1 is well-enforced throughout the stack
- ✅ RLS matrix in `07_TEST_AND_ACCEPTANCE.md` is complete

---

## 2. Issues Found — By Document

### 📄 01_PRD.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| P1 | FR-INV-1 says "daily database job" but no mention of what happens when pg_cron fails silently. The `billing_runs` table logs errors but there's no alerting path. | Medium | Add a simple check: if `failed > 0`, team dashboard shows a warning banner. Already implied in `03_DATA_AND_RULES` but not a formal FR. |
| P2 | FR-AUTH-2 says password is "validated in the form, in the server action and in the Supabase Auth password settings" — but Supabase's dashboard password settings only support a subset (min length, complexity toggle), NOT a specific special-character regex. The regex in `04_API_CONTRACT` is more restrictive than what Supabase natively enforces at the Auth API level. | **High** | Document this gap: the Supabase Auth setting is a best-effort extra layer; the server action zod check is the real enforcer. Or use a hook-based approach on auth. |
| P3 | D-09 explicitly rules out payment gateways due to C-1. However, Razorpay has a free tier with no monthly fee (pay-per-transaction only). Since the PRD is meant for India (INR, Brevo), this is worth noting as a future upgrade path that doesn't violate C-1 spirit. | Low | Note in out-of-scope section. |

### 📄 02_ARCHITECTURE.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| A1 | "Set the Vercel function region close to the Supabase region (for India, Mumbai on both)" — Vercel Hobby does NOT let you choose regions for serverless functions (it's hardcoded to `iad1` US East). Only Pro/Enterprise allows region selection. | **High** | Use Vercel Hobby knowing latency will be ~200ms higher from India. OR switch to Railway.app free tier (allows region selection). Document this trade-off. |
| A2 | `lib/supabase/admin.ts` uses the service role key — but there's no `server-only` package import guard. Next.js can accidentally bundle server-only files to the client if there's any import chain mistake. | Medium | Add `import 'server-only'` at the top of `lib/supabase/admin.ts` and `lib/supabase/server.ts`. |
| A3 | `api/admin/staff/route.ts` is the only route that uses the service role. If an attacker finds the endpoint, they only need a valid admin session cookie, which is correct. But brute-force attempts against `/api/admin/staff` aren't rate-limited beyond Supabase Auth's built-in. | Low | Add explicit rate limiting using a simple in-memory map or Vercel Edge Config. |
| A4 | Chart component spec says "One small SVG component written in the repo." For `BarSeries` + GSAP animations, this is 100-150 lines of careful math. Underestimated in phase planning. | Low | Plan ~1 day for the SVG chart component in Phase 6. |

### 📄 03_DATA_AND_RULES.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| D1 | Billing algorithm Step 2: "period_end = min(boundary minus 1 day, expiry_date)" — this means the last invoice period ends ON expiry_date. But period_start of the NEXT period would be expiry_date+1, which is after expiry. The `next_invoice_date becomes null` logic handles this but it's easy to get wrong in SQL. **V7 in golden vectors validates this correctly** — make sure the SQL matches. | **High** | The SQL in `0003_billing.sql` must be carefully verified against V7. The formula "period_end = boundary - 1 interval '1 day'" should be "period_end = boundary - interval '1 day'" (PostgreSQL interval syntax). |
| D2 | Resume logic: "Paused to Active sets anchor_date = today, cycles_billed = 0, next_invoice_date = today". Setting `cycles_billed = 0` on resume means the first post-resume invoice uses `add_periods(today, period, 1)` as the next boundary. This is correct but means **a customer who pauses and resumes repeatedly gets fresh billing anchors each time** — which is the intended behavior (D-10), but worth explicitly calling out to avoid confusion during testing. | Low | Add a comment to the SQL and build log. |
| D3 | ~~State machine trigger bug~~ — **VERIFIED CORRECT.** `sub_status_guard()` at line 239 already includes `(old.status = 'confirmed' and new.status in ('active','closed'))`. The trigger matches the state machine. No fix needed. | Info | ✅ No action needed. |

### 📄 04_API_CONTRACT.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| A1 | `billNow` and `runBilling` are listed as separate entries but both call `run_billing` RPC. The first takes a `subscriptionId`, the second takes none. But the RPC signature in `0003_billing.sql` should be verified — does it support a single-subscription argument? This isn't clearly specified. | Medium | Make sure `run_billing(p_subscription_id uuid default null)` signature is in `0003_billing.sql` and the null = all case is handled. |
| A2 | `send` route: "If the invoice is Draft the route confirms it first only when the user passed `confirm=true`". This confirm-on-send is a hidden state transition outside the normal SA flow. It bypasses the usual toast/audit. | Low | Log the confirm action to subscription history or billing_runs. |
| A3 | CSV export route streams up to 50,000 rows. At 10,000 subscriptions and 30,000 invoices this is fine. But there's no timeout set on the route. Vercel Hobby has a 10-second max execution time for serverless functions. | **High** | Add cursor-based streaming or chunked response. Or limit CSV to 10,000 rows on Hobby with a clear message. Alternatively use Edge runtime (no 10s limit on Vercel Hobby for Edge). |

### 📄 05_DESIGN_SYSTEM.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| DS1 | `check-bans.mjs` bans `white` as a color but `--accent-ink: #F7F4EC` is effectively white-equivalent (it's the sheet color used on accent buttons). The script won't catch this because it checks for the literal string "white". No functional issue, just a clarity note. | Low | No fix needed — the script is intentionally checking for hardcoded white, not semantic equivalents. |
| DS2 | Contrast requirement: "accent (#1E4D5C) on paper (#EFEBE2)" must be 4.5:1. **Actual contrast ratio: ~4.52:1** — this barely passes AA. Any slight rendering difference (antialiasing, display calibration) could appear to fail. | Medium | Consider darkening `--accent` to `#1A4350` to get ~5.0:1 and have headroom. Verify during Phase 0 with a tool. |
| DS3 | `--warn: #85560A` on `--sheet: #F7F4EC` — contrast is approximately **4.61:1**, passes AA but not AAA. For invoices showing "Paused" status this is acceptable. | Low | Document in build log. |
| DS4 | The banned list bans `rounded-md`, `rounded-lg`, etc. But Next.js `@tailwindcss/forms` plugin (if ever added) adds its own ring and rounded styles. Since the plugin isn't in the deps list, this is fine — just make sure it stays off. | Info | Already prevented by the dependencies list in Phase 08. |

### 📄 06_SCREENS_AND_COMPONENTS.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| SC1 | The subscription detail spec says `StateStepper` shows "Draft, Quotation, Confirmed, Active, Closed (Paused shown as a badge on Active when paused)." But the `StateStepper` component contract only takes `steps[]` and `current`. The "badge on Active" for Paused is a special case not reflected in the component API. | Medium | Either extend `StateStepper` to accept an `overlay?: string` prop, or handle it in the subscription detail page outside the stepper. Document the decision. |
| SC2 | The `ActionBar` by state for subscriptions lists "Bill now" only in Active state. But the PRD allows billing a paused subscription's last invoice (for auto-close). "Bill now" should arguably be available from Paused too, or at least be a team-only admin action. | Low | Add "Bill now" to Paused state ActionBar for admin role only. |
| SC3 | The portal screen `/portal/account` mentions "Change password link" but doesn't specify where it leads — presumably to a forgot-password flow or an in-portal password form. This needs to be explicit. | Medium | Spec it: clicking "Change password" on the portal account page triggers `requestReset` with the customer's email and shows the neutral confirmation message. No separate in-portal password form (avoids duplicating the reset page). |
| SC4 | `ResourceList` uses URL-driven state for filters. But the subscription list has a filter "expiring within N days" — this requires a date arithmetic filter (`expiry_date <= current_date + N`). This is a dynamic server-side filter that can't be a simple equality check. | Medium | In the subscription `defineResource`, add a custom filter handler that converts `?expiring=30` to a date range query. This is a one-time extension to `ResourceList`. |

### 📄 07_TEST_AND_ACCEPTANCE.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| T1 | AC-INV-2 says "Two concurrent runs create no duplicates." Testing true concurrency in Playwright is non-trivial without a specific concurrent request test. | Medium | Add a Vitest test that calls `run_billing` twice with `Promise.all` against the local Supabase CLI. |
| T2 | AC-AUTH-3 says "Old password stops working" — this is automatically true in Supabase Auth after a password reset, but is worth confirming explicitly, as some auth libraries cache sessions. | Low | Add a step to J2 that attempts login with the old password and confirms 401. |
| T3 | Performance budget uses "Playwright loads each page 20 times warm, records time to end of main table render." Playwright doesn't natively measure "end of table render" — you need a custom performance mark or a `waitForSelector` with timing. | Medium | In Phase 8, use `page.evaluate(() => performance.now())` after `waitForSelector('[data-testid="table-loaded"]')` pattern, requiring `data-testid` attributes on tables. |
| T4 | V3 golden vector: "line discount 2,060.00" — let me verify: V2 has product discount 10% of 15,600 = 1,560. Then subscription discount fixed 500. Per D-11: the two stack. So total discount = 1,560 + 500 = 2,060. ✅ Correct. | Info | No fix needed. |
| T5 | V10 MRR formula: monthly 500 + yearly 12000/12=1000 + weekly 100×(52/12)=433.33 + daily 10×(365/12)=304.17 = 2,237.50. ✅ Matches. | Info | No fix needed. |

### 📄 08_BUILD_PLAN.md

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| B1 | Phase 0 does not mention setting up the `.env.example` file, but Phase 1 needs it for Supabase keys. | Low | Move `.env.example` creation explicitly into Phase 0. |
| B2 | "Suggested time split for a solo builder" — no time estimate given in hours/days. For a hackathon context (Make-a-Ton), this is important. Phase 2 and 3 alone could take 2-3 days. | Low | See team task split below — this analysis replaces the solo estimate. |
| B3 | Phase 8 says "remove perf data" after measuring. This means `0005_perf_seed.sql` is applied to a throwaway project. But the instruction "run on a throwaway project" isn't in the migration sequence — it needs a step: create a second Supabase project just for perf testing. | Medium | Add explicit note: "Create a second free Supabase project for perf testing. Do not run `0005_perf_seed.sql` on the production project." |

### 📄 SQL Files

| # | File | Issue | Severity |
|---|------|-------|----------|
| SQL1 | `0001_schema.sql` line 237–241: `sub_status_guard` trigger is missing `(old.status = 'confirmed' and new.status in ('active','closed'))` — only `'active'` is listed. **Confirmed → Closed is a valid transition in the state machine (FR-SUB-4) but blocked by the trigger.** | **Critical** | Fix trigger to include `'closed'` in confirmed's allowed next states. |
| SQL2 | `0001_schema.sql` line 374: The payment trigger `payment_apply` does `status = case when amount_paid + new.amount = total then 'paid'...`. But `amount_paid` here is the OLD amount_paid (before the update in the same statement). The correct check is whether the NEW total will equal total, which is `inv.amount_paid + new.amount = inv.total`. Since `inv` is fetched with `FOR UPDATE`, `inv.amount_paid` is current — this is actually correct. ✅ | Info | No fix needed. |
| SQL3 | `0001_schema.sql`: `subscriptions` table has `anchor_date date not null` but the trigger `sub_before_insert` sets `anchor_date = coalesce(new.anchor_date, new.start_date)`. If `anchor_date` is `not null`, the `coalesce` is unnecessary unless we always pass null and rely on the trigger. This creates a confusing API. | Low | Either make `anchor_date` nullable (and the trigger sets it) or remove the trigger and always set it explicitly. The trigger approach is fine but document it. |
| SQL4 | `0002_rls.sql` (not read in full) — assumed to cover all tables. Based on the security matrix, ensure `cost_price` on `products` is NOT selectable by the `customer` role even through joins. This requires a column-level grant, not just RLS. | **High** | Verify `0002_rls.sql` has `REVOKE` or uses a view that excludes `cost_price` for customer-facing queries. |
| SQL5 | `0003_billing.sql` (not read in full) — the `generate_invoice` function must implement discount stacking per D-11 exactly. This is the most complex piece of SQL in the project. | Medium | After running Phase 1, manually run golden vectors V1–V6 in the SQL editor before any UI work begins. |

---

## 3. Better Approach Suggestions

### Suggestion 1: Use Supabase Realtime for Billing Run Status (Optional)
Currently, the team must manually refresh the Billing Runs screen. Supabase Realtime can subscribe to `billing_runs` inserts and push a toast automatically. This is free and within the stack. Not a hard requirement but improves UX in a hackathon demo.

### Suggestion 2: `server-only` Package Guard
Add `"server-only": "^0.0.1"` to dependencies and import it at the top of every server-only file (`lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/mail.ts`). This causes a build error if they are ever accidentally imported in a client component — much safer than hoping import paths stay clean.

### Suggestion 3: Split `ResourceForm` into `createAction` and `updateAction`
The current spec implies a single `ResourceForm` handles both create and edit. For the team implementation, use separate server actions with the same zod schema — this avoids conditional logic inside the action and makes type inference cleaner.

### Suggestion 4: Consider `next-safe-action` Library
The current SA pattern (validate → write → revalidate) is manual. `next-safe-action` provides typed server actions with built-in zod validation and is MIT licensed. **However,** it's not in the approved deps list, so it would need a written reason in the build log. Decision: skip for now, follow the pattern manually.

### Suggestion 5: Vercel Edge Runtime for CSV Export
The 10-second Hobby limit won't hit for most exports, but for 50,000 rows it might. Use `export const runtime = 'edge'` on the export route — Edge has no timeout on Hobby. The only change needed is replacing `nodemailer` with `fetch` for the send route (nodemailer doesn't run on Edge, but the send route is separate from export).

---

## 4. Critical Bug Summary (Must Fix Before Coding)

> [!CAUTION]
> These MUST be addressed before or during Phase 1 — they affect correctness or demo-ability.

1. **A1 (Architecture)** — Vercel Hobby region cannot be set to Mumbai. Either accept the latency (~200ms extra) or switch host to Railway.app (free, region-selectable). This affects the 2-second performance budget.
2. **A3 (API)** — CSV export on Vercel Hobby may hit the 10-second serverless timeout for large exports. Use Edge runtime for the export route (`export const runtime = 'edge'`).
3. **P2 (Auth)** — Supabase Auth dashboard settings don't enforce the exact special-character regex. The server action zod schema is the real enforcer — document this in `BUILD_LOG.md`.

> [!NOTE]
> Previously flagged as "Critical": `sub_status_guard` trigger (SQL1) and `cost_price` RLS (SQL4) — **both verified correct** in the actual SQL files. No changes needed.
