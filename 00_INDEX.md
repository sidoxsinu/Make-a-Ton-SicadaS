# 00. Package Index

Brightloop Subscription Management System, specification package v1.0.

## Contents

| File | What it is |
|---|---|
| MASTER_PROMPT.md | The prompt to paste into your coding agent |
| docs/01_PRD.md | Requirements, personas, decisions on ambiguities |
| docs/02_ARCHITECTURE.md | Platform choice, zero cost stack, layout, reuse, operations |
| docs/03_DATA_AND_RULES.md | Data model, state machines, billing algorithm, edge cases |
| docs/04_API_CONTRACT.md | Server actions, RPC functions, route handlers |
| docs/05_DESIGN_SYSTEM.md | Tokens, banned list, components, GSAP motion |
| docs/06_SCREENS_AND_COMPONENTS.md | Route map, component catalog, every screen |
| docs/07_TEST_AND_ACCEPTANCE.md | Acceptance rows, golden vectors, security and performance tests |
| docs/08_BUILD_PLAN.md | Nine phases with definitions of done |
| sql/0001_schema.sql | Tables, triggers, indexes |
| sql/0002_rls.sql | Row level security and column grants |
| sql/0003_billing.sql | Billing engine, transitions, customer actions, dashboard RPC |
| sql/0004_seed.sql | Payment terms, taxes, first admin note |
| sql/0005_perf_seed.sql | 10,000 subscription load test data |
| scripts/check-bans.mjs | Fails the build on banned design patterns |

## Where to put it in the repository

```
docs/prd/            this whole package (keep the sql, scripts and docs folders)
```
The agent copies `sql/*.sql` into `supabase/migrations` and `scripts/check-bans.mjs` into `scripts/` during Phases 0 and 1.

## Free accounts you need (no card)

1. GitHub. 2. Supabase. 3. Vercel (Hobby) or another free host. 4. Brevo (free SMTP). All other tools run locally.

## Honest status of this package

- The SQL was written with care and reviewed line by line but has not been executed against PostgreSQL in this environment. Phase 1 runs it first. Expect at most small syntax fixes.
- `check-bans.mjs` was executed and verified to pass on clean files and fail on banned patterns.
- Free tier limits (email per day, database size, project pausing, Vercel Hobby terms, GSAP licence) change over time. Check the provider pages when you start.
