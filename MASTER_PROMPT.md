# MASTER PROMPT: Build the Brightloop Subscription Management System

Paste everything below the line into your coding agent (Antigravity, Claude Code or similar) with this package placed in the repository under `docs/prd/`.

---

You are the lead engineer building the Brightloop Subscription Management System. A complete specification already exists. Your job is to implement it exactly, phase by phase, with the smallest possible amount of code, and to prove each phase works before starting the next.

## 1. Read first, in this order

1. `docs/prd/docs/01_PRD.md` requirements, decisions D-01 to D-16, scope
2. `docs/prd/docs/02_ARCHITECTURE.md` stack, layout, reuse strategy, free tier operations
3. `docs/prd/docs/03_DATA_AND_RULES.md` data model, state machines, billing algorithm
4. `docs/prd/sql/0001_schema.sql`, `0002_rls.sql`, `0003_billing.sql`, `0004_seed.sql`, `0005_perf_seed.sql` the database source of truth
5. `docs/prd/docs/04_API_CONTRACT.md` actions, RPC and routes
6. `docs/prd/docs/05_DESIGN_SYSTEM.md` tokens, banned list, motion rules
7. `docs/prd/docs/06_SCREENS_AND_COMPONENTS.md` screens and component contracts
8. `docs/prd/docs/07_TEST_AND_ACCEPTANCE.md` acceptance criteria, golden vectors, security and performance tests
9. `docs/prd/docs/08_BUILD_PLAN.md` phases and definitions of done
10. `docs/prd/scripts/check-bans.mjs` copy to `scripts/`

Do not start coding until you have read all ten and written a half page summary of the system, the phases and the open risks into `docs/BUILD_LOG.md`.

## 2. Non negotiable rules

**Cost.** Everything must be free with no credit card: Next.js, Supabase free tier, Brevo free SMTP, GSAP, Vercel Hobby or another free host, GitHub Actions. Do not add a paid service, a payment gateway, a paid font, a paid icon pack or any package that requires a licence key. If you believe something needs money, stop and say so.

**Source of truth.** Business rules live in SQL (`0001` to `0003`). Pricing, discounts, tax, state transitions and billing are not reimplemented in TypeScript. The only TypeScript pricing code is `lib/pricing.ts` for editor previews, pinned by a parity test to the golden vectors. The SQL files have not been run against a live database. Run them in Phase 1, fix any error in the file itself, and log the fix.

**Minimal code change.**
- Reuse the components in `06`. Build `defineResource`, `ResourceList`, `ResourceForm`, `LineItemsEditor`, `StateStepper`, `FilterBar` once and use them everywhere.
- Master data screens (taxes, payment terms, products, plans, templates, customers, discounts, staff) are configuration files, not hand written pages.
- Only the dependencies listed in `08_BUILD_PLAN.md` may be installed. Anything else needs a written reason in the build log.
- Each phase touches only the files it lists. Do not rewrite or reformat code from earlier phases without a failing test as the reason.
- No dead code, no commented out code, no speculative options.

**Design.** The banned list in `05` is binding: no gradients, glows, glass, blur, shadows, emojis, icon sets, sparkles, motion arrows, Inter, Geist, Space Grotesk, dot or bento grids, rows of three equal cards, colored left stripe cards, purple, rainbow, neon, pastels, pure white, radius above 2px, terminal windows, checkmark bullets, confetti, plane illustrations, em dashes, "it is not X, it is Y" phrasing, fake testimonials or stats, filler text, decorative shapes. Use the tokens and components from `05` and `06`. Every element must carry information. Run `npm run check:bans` before every commit and also read your own UI strings for the phrasing rules, which the script cannot fully catch.

**Motion.** Use GSAP only through `lib/motion.ts` and only for the six hooks defined in `05` section 6. Respect reduced motion. Never delay content for animation.

**Security.** Row Level Security is the authority. No service role key in client code. Validate every server action input with the same zod schema the form uses. Password rule: at least 9 characters with uppercase, lowercase and a special character, enforced in the form, the server action and the Supabase Auth settings. Only an admin can create staff. Only an admin can create discounts.

**Performance.** Every page under 2 seconds at 10,000 subscriptions and 30,000 invoices. Server rendered lists, 25 rows per page, selected columns only, indexed filters, one RPC for the dashboard. Phase 8 measures this with `0005_perf_seed.sql` and records numbers.

## 3. Working method

Repeat for Phases 0 to 8 from `08_BUILD_PLAN.md`:

1. State the phase goal and the files you will create or change.
2. Implement it using existing components first.
3. Write the tests named for that phase in `07`, including the golden vectors that belong to it.
4. Run `npm run check:bans`, `npm run typecheck`, `npm run lint`, `npm test`, and the Playwright journeys that exist so far. Fix failures at the cause.
5. Verify the acceptance criteria rows of the phase by actually exercising them, using real roles for security checks. Do not mark a row passed from reading the code.
6. Append to `docs/BUILD_LOG.md`: what changed, decisions taken, test results, measured numbers, open issues.
7. Commit with the message given in the phase.
8. Report to me in this format, then continue to the next phase without waiting unless blocked:

```
PHASE n done
Files: <count created, count changed>
Acceptance rows passed: <ids>
Not yet passing: <ids or none>
Decisions: <one line each>
Next: <phase n+1 goal>
```

## 4. When to stop and ask

Stop only when you need something that cannot be generated: Supabase project URL and keys, SMTP credentials, or a decision that changes a requirement. Ask one precise question, state the default you will use if I do not answer, and continue with other work meanwhile. For ambiguity inside the spec, apply the decisions table in `01_PRD.md` section 5. If something is missing there, choose the simplest option that keeps the data model intact and record it as D-17 and onward in the build log.

## 5. Quality bar

- TypeScript strict mode. No `any` without a comment explaining why.
- One file per component, named exports, props typed.
- Dates and money are formatted only through `DateText` and `Money`. Money values are never floats in arithmetic: use the database result, or integer minor units in `lib/money.ts`.
- Every list has loading, empty and error states. Every action shows a toast with the SQL message on failure.
- Accessibility rules in `05` section 8 apply to every screen.
- Strings are plain, specific and free of em dashes.
- Seed and test data is labelled as test data and never ships in a production build.

## 6. Definition of done for the project

All acceptance rows in `07` pass, all scripts pass, migrations apply on an empty free Supabase project, the README gets a new developer running with free accounts in under 15 steps, no secret is committed, and the performance table is met with numbers recorded.

## 7. Start now

Begin with the reading step and the summary in `docs/BUILD_LOG.md`, then execute Phase 0.
