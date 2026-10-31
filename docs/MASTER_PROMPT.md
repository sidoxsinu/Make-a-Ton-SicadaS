# MASTER PROMPT: Build the Brightloop Subscription Management System
# Team: SicadaS | Make-a-Ton Hackathon

Paste everything below the line into your coding agent (Antigravity, Claude Code or similar) with this repository open.

---

You are building the **Brightloop Subscription Management System** for team SicadaS in a hackathon setting. A complete specification exists in the `docs/` folder. Your job is to implement it exactly, phase by phase, with the smallest possible amount of code, and to prove each phase works before starting the next.

## 0. Team Context (Read Before Anything)

| Person | Role | Focus |
|--------|------|-------|
| **Sinan** | Lead (you, running this prompt) | Full-stack owner, makes all architectural decisions, owns all code commits |
| **Roshan** | Backend / DB | Owns Supabase project creation, SQL migration execution, billing SQL validation, perf tuning |
| **Malavika** | UX / Flow / QA | Owns UX story verification, portal quality, E2E journey execution |
| **Lakshmi** | Guided Tester | Runs structured test scripts given by Sinan or Malavika |

When the prompt says "you" it means Sinan. Coordinate with teammates by sharing the `docs/TEAM_TASK_SPLIT.md` file.

## 1. Read First, In This Order

1. `docs/01_PRD.md` — requirements, personas, decisions D-01 to D-16, scope
2. `docs/02_ARCHITECTURE.md` — stack, layout, reuse strategy, free tier operations
3. `docs/03_DATA_AND_RULES.md` — data model, state machines, billing algorithm
4. `docs/0001_schema.sql`, `0002_rls.sql`, `0003_billing.sql`, `0004_seed.sql`, `0005_perf_seed.sql` — the database source of truth
5. `docs/04_API_CONTRACT.md` — actions, RPC and routes
6. `docs/05_DESIGN_SYSTEM.md` — tokens, banned list, motion rules
7. `docs/06_SCREENS_AND_COMPONENTS.md` — screens and component contracts
8. `docs/07_TEST_AND_ACCEPTANCE.md` — acceptance criteria, golden vectors, security and performance tests
9. `docs/08_BUILD_PLAN.md` — phases and definitions of done
10. `docs/PRD_ANALYSIS.md` — PRD review: real issues found, verified fixes, known trade-offs

Do not start coding until you have written a half-page summary of the system, phases, open risks, and the three real issues from the PRD analysis into `docs/BUILD_LOG.md`.

## 2. Real Issues to Address (from PRD Review)

These were found during pre-build analysis. Address them as noted:

### Issue 1 — Vercel Hobby Region (High)
Vercel Hobby does **not** allow selecting the serverless function region (locked to `iad1`, US East). This adds ~150-200ms latency from India on every server request, threatening the 2-second page budget.

**Your decision:** Use Vercel Hobby for the hackathon demo (it's fast enough for demo conditions). Document the latency in `BUILD_LOG.md` as a known trade-off. Note that for production, Railway.app (free, region-selectable) is a drop-in replacement with the same Next.js runtime.

### Issue 2 — CSV Export Timeout (High)
The CSV export route at `api/export/[resource]` will use a Vercel serverless function. Vercel Hobby has a 10-second execution limit. For 30,000 invoices this may not be enough.

**Your fix:** Add `export const runtime = 'edge'` to `app/api/export/[resource]/route.ts`. Edge runtime has no timeout on Hobby. The only constraint: do not use `nodemailer` in this file (edge-incompatible). The mail route is a separate file, so this is safe.

### Issue 3 — Auth Password Regex vs. Supabase Dashboard (Medium)
The Supabase Auth dashboard password settings only support: minimum length, lowercase required, uppercase required, symbol required. It does NOT support a custom regex. The `passwordSchema` in `lib/schema/password.ts` is more specific (custom special-character class). The dashboard setting is a backup layer only — the zod schema in the server action is the real enforcer.

**Your fix:** Set the Supabase dashboard to: min length 9, lowercase on, uppercase on, symbols on. Document in `BUILD_LOG.md` that the regex difference is intentional and the server action is the authority.

### Issue 4 — StateStepper "Paused" Overlay (Medium)
The subscription detail StateStepper shows `[Draft] [Quotation] [Confirmed] [Active] [Closed]` but when a subscription is Paused, the spec says to show a badge on Active, not a separate step. The `StateStepper` component contract (steps[], current) doesn't natively support this.

**Your fix:** In the subscription detail page (not in the StateStepper component), render `<StateStepper steps={...} current={isPaused ? 'active' : status} />` and add a `<Badge status="paused" />` next to it when `status === 'paused'`. The StateStepper component stays generic.

### Issue 5 — "Expiring Within N Days" Filter (Medium)
The subscription list filter "expiring within N days" is a date arithmetic filter that ResourceList's standard equality-check pattern can't handle with a simple URL param.

**Your fix:** In `lib/resources/subscriptions.ts`, add a `customFilter` handler that reads `?expiring=N` and generates a `lt` query on `expiry_date` relative to `current_date + N days`. This is a one-line Supabase query extension — not a new pattern.

## 3. Non-Negotiable Rules

**Cost.** Everything must be free with no credit card: Next.js, Supabase free tier, Brevo free SMTP, GSAP, Vercel Hobby (or Railway.app), GitHub Actions. Do not add a paid service, payment gateway, paid font, paid icon pack, or any package requiring a licence key. If you believe something needs money, stop and say so.

**Source of truth.** Business rules live in SQL (`0001` to `0003`). Pricing, discounts, tax, state transitions and billing are NOT reimplemented in TypeScript. The only TypeScript pricing code is `lib/pricing.ts` for editor previews, pinned by a parity test to V1 and V4. The SQL files have not been run against a live database. Run them in Phase 1 (Roshan's task), fix any error in the file itself, and log the fix.

**Minimal code change.**
- Reuse the components in `06_SCREENS_AND_COMPONENTS`. Build `defineResource`, `ResourceList`, `ResourceForm`, `LineItemsEditor`, `StateStepper`, `FilterBar` once and use them everywhere.
- Master data screens (taxes, payment terms, products, plans, templates, customers, discounts, staff) are configuration files, not hand-written pages.
- Only the dependencies listed in `08_BUILD_PLAN.md` may be installed. Anything else needs a written reason in the build log.
- Each phase touches only the files it lists. Do not rewrite or reformat code from earlier phases without a failing test as the reason.
- No dead code, no commented-out code, no speculative options.

**Design.** The banned list in `05_DESIGN_SYSTEM` is binding: no gradients, glows, glass, blur, shadows, emojis, icon sets, sparkles, motion arrows, Inter, Geist, Space Grotesk, dot or bento grids, rows of three equal cards, colored left stripe cards, purple, rainbow, neon, pastels, pure white, radius above 2px, terminal windows, checkmark bullets, confetti, plane illustrations, em dashes, "it is not X, it is Y" phrasing, fake testimonials or stats, filler text, decorative shapes. Use the tokens and components from `05` and `06`. Every element must carry information. Run `npm run check:bans` before every commit.

**Server-only guard.** Add `import 'server-only'` at the top of `lib/supabase/server.ts`, `lib/supabase/admin.ts`, and `lib/mail.ts`. This prevents accidental client bundle inclusion and causes a build error if import chains are wrong.

**Motion.** Use GSAP only through `lib/motion.ts` and only for the six hooks defined in `05_DESIGN_SYSTEM` section 6. Respect reduced motion. Never delay content for animation.

**Security.** Row Level Security is the authority. No service role key in client code. Validate every server action input with the same zod schema the form uses. Password rule: at least 9 characters with uppercase, lowercase and a special character, enforced in the form, the server action, and the Supabase Auth settings (see Issue 3 above). Only an admin can create staff. Only an admin can create discounts.

**Performance.** Every page under 2 seconds at 10,000 subscriptions and 30,000 invoices. Server-rendered lists, 25 rows per page, selected columns only, indexed filters, one RPC for the dashboard. Phase 8 measures this with `0005_perf_seed.sql` on a throwaway Supabase project and records numbers. (Note: Vercel Hobby region adds ~150ms — see Issue 1. The 2-second target is still achievable with fast DB queries.)

## 4. Working Method

Repeat for Phases 0 to 8 from `08_BUILD_PLAN.md`:

1. State the phase goal and the files you will create or change.
2. Implement it using existing components first.
3. Write the tests named for that phase in `07_TEST_AND_ACCEPTANCE`, including the golden vectors that belong to it.
4. Run `npm run check:bans`, `npm run typecheck`, `npm run lint`, `npm test`, and the Playwright journeys that exist so far. Fix failures at the cause.
5. Verify the acceptance criteria rows of the phase by actually exercising them, using real roles for security checks. Do not mark a row passed from reading the code.
6. Append to `docs/BUILD_LOG.md`: what changed, decisions taken, test results, measured numbers, open issues.
7. Commit with the message given in the phase.
8. Report in this format, then continue to the next phase without waiting unless blocked:

```
PHASE n done
Files: <count created, count changed>
Acceptance rows passed: <ids>
Not yet passing: <ids or none>
Decisions: <one line each>
Next: <phase n+1 goal>
```

## 5. Coordination Checkpoints

After Phase 0 completes: share the running dev URL with Malavika for design review.
After Phase 1 completes: Roshan shares the Supabase URL and anon key. You add them to `.env.local` and Vercel project settings.
After Phase 2 completes: Malavika runs the catalog flow check from `TEAM_TASK_SPLIT.md`.
After Phase 4 completes: Lakshmi runs the invoice test script from `TEAM_TASK_SPLIT.md`.
After Phase 7 completes: Malavika runs the full portal review. Lakshmi runs the customer portal test script.
Before Phase 8: Roshan creates the second Supabase project for perf testing.

## 6. When to Stop and Ask

Stop only when you need something that cannot be generated: Supabase project URL and keys, SMTP credentials, or a decision that changes a requirement. Ask one precise question, state the default you will use if the team does not answer, and continue with other work meanwhile. For ambiguity inside the spec, apply the decisions table in `01_PRD.md` section 5. If something is missing there, choose the simplest option that keeps the data model intact and record it as D-17 and onward in the build log.

## 7. Quality Bar

- TypeScript strict mode. No `any` without a comment explaining why.
- One file per component, named exports, props typed.
- Dates and money are formatted only through `DateText` and `Money`. Money values are never floats in arithmetic: use the database result, or integer minor units in `lib/money.ts`.
- Every list has loading, empty and error states. Every action shows a toast with the SQL message on failure.
- Accessibility rules in `05_DESIGN_SYSTEM` section 8 apply to every screen.
- Strings are plain, specific and free of em dashes.
- Seed and test data is labelled as test data and never ships in a production build.

## 8. Hackathon Scope Priority

If time runs short, ship in this order. Stop when you run out of time.

| Priority | Phases | Delivers |
|----------|--------|----------|
| Must ship | 0, 1, 2, 3 | Auth + full subscription lifecycle |
| Ship next | 4 | Billing + invoices (key differentiator) |
| Ship next | 6 | Dashboard (impressive demo) |
| Ship if time | 7 | Customer portal |
| Defer | 5, 8 | Discounts, performance hardening |

## 9. Definition of Done for the Project

All acceptance rows in `07_TEST_AND_ACCEPTANCE` pass, all scripts pass, migrations apply on an empty free Supabase project, the README gets a new developer running with free accounts in under 15 steps, no secret is committed, and the performance table is met with numbers recorded.

## 10. Start Now

Begin with the reading step and the `BUILD_LOG.md` summary. Then execute Phase 0. Coordinate with Roshan to start Phase 1 SQL work in parallel — he can create the Supabase project and run migrations while you build the Phase 0 scaffold.
