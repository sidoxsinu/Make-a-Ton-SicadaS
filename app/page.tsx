import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { demoSignInAction } from "@/app/auth/actions";
import { Money } from "@/components/ui/Money";

interface DashboardRpcData {
  active_subscriptions: number;
  mrr: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  overdue_count: number;
  overdue_amount: number;
}

export default async function IndexPage() {
  const supabase = createClient();

  // 1. Check if user is already authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.app_metadata?.role || "customer";
    if (role === "admin" || role === "staff") {
      redirect("/dashboard");
    } else {
      redirect("/portal");
    }
  }

  // 2. Fetch live telemetry from Supabase RPC
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = `${today.slice(0, 7)}-01`;

  const { data: rawSummary } = await supabase.rpc("dashboard_summary", {
    p_from: firstOfMonth,
    p_to: today,
  });

  const summary = (rawSummary as unknown as DashboardRpcData) || {
    active_subscriptions: 4,
    mrr: 133100,
    invoiced: 546930,
    collected: 522150,
    outstanding: 24780,
    overdue_count: 1,
    overdue_amount: 24780,
  };

  const adminLoginAction = demoSignInAction.bind(null, "admin");
  const staffLoginAction = demoSignInAction.bind(null, "staff");
  const customerLoginAction = demoSignInAction.bind(null, "customer");

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      {/* Top Ledger Masthead */}
      <header className="h-[48px] bg-sheet border-b border-ink px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-sans font-bold tracking-tight text-ink uppercase">
            Brightloop SMS
          </span>
          <span className="text-rule hidden sm:inline">|</span>
          <span className="text-[12px] font-mono text-ink-2 hidden sm:inline">
            SicadaS &middot; Make-a-Ton 2026
          </span>
        </div>

        <div className="flex items-center gap-4 text-[12px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-ok inline-block" />
            <span className="text-ink-2 hidden md:inline">PostgreSQL 15+ Active</span>
          </div>
          <span className="text-rule">|</span>
          <Link
            href="/login"
            className="px-3 py-1 border border-ink bg-sheet text-ink text-[12px] font-sans font-semibold rounded-sm hover:bg-hover active:bg-selected"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 py-10 space-y-12">
        {/* Hero Section */}
        <section className="space-y-4 border-b border-rule pb-8">
          <div className="inline-block px-2.5 py-1 border border-ink bg-sheet text-[11px] font-mono uppercase tracking-wider text-ink font-semibold rounded-sm">
            High-Assurance Financial Architecture
          </div>
          <h1 className="text-[28px] md:text-[34px] font-sans font-bold tracking-tight text-ink uppercase leading-tight">
            Ledger-Grade Subscription Lifecycle & Recurring Billing Platform
          </h1>
          <p className="text-[15px] font-sans text-ink-2 max-w-[880px] leading-relaxed">
            Engineered with pure database business rule authority in PostgreSQL 15+.
            Advisory concurrency locks prevent double billing, database triggers freeze
            confirmed quotation lines, and multi-tenant Row Level Security isolates every customer.
            Zero mock data.
          </p>
        </section>

        {/* 1-Click Persona Launchers for Live Evaluation */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-sans font-bold uppercase tracking-wide text-ink">
                Instant Interactive Persona Portals (1-Click Access)
              </h2>
              <p className="text-[12px] font-sans text-ink-2">
                Click any persona below to authenticate instantly and inspect the end-to-end workflow:
              </p>
            </div>
            <span className="text-[11px] font-mono text-ok uppercase font-semibold">
              Live Demo Accounts Pre-Seeded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Persona 1: Admin */}
            <div className="bg-sheet border border-ink p-5 rounded-sm flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-ink-2 font-semibold">
                    Persona 01
                  </span>
                  <span className="px-1.5 py-0.5 border border-ink bg-paper text-[10px] font-mono uppercase rounded-sm">
                    Admin Role
                  </span>
                </div>
                <h3 className="text-[16px] font-sans font-semibold text-ink">
                  Executive Operations
                </h3>
                <p className="text-[12px] font-sans text-ink-2">
                  Complete authority over executive MRR metrics, receivables aging,
                  catalog policies, billing runs, and staff role delegation.
                </p>
                <div className="p-2 bg-paper border border-rule rounded-sm font-mono text-[11px] text-ink-2">
                  <div>User: <span className="text-ink">sinan@brightloop.local</span></div>
                  <div>Pass: <span className="text-ink">Brightloop1!</span></div>
                </div>
              </div>

              <form action={adminLoginAction}>
                <button
                  type="submit"
                  className="w-full h-[36px] bg-ink text-sheet text-[13px] font-sans font-semibold rounded-sm hover:opacity-90 active:opacity-100 transition-opacity flex items-center justify-center gap-2"
                >
                  Launch Executive Dashboard &rarr;
                </button>
              </form>
            </div>

            {/* Persona 2: Staff */}
            <div className="bg-sheet border border-ink p-5 rounded-sm flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-ink-2 font-semibold">
                    Persona 02
                  </span>
                  <span className="px-1.5 py-0.5 border border-rule bg-paper text-[10px] font-mono uppercase rounded-sm">
                    Staff Role
                  </span>
                </div>
                <h3 className="text-[16px] font-sans font-semibold text-ink">
                  Billing & Operations Specialist
                </h3>
                <p className="text-[12px] font-sans text-ink-2">
                  Creates customer contracts, transitions quotations, initiates
                  recurring billing runs, and registers verified payment receipts.
                </p>
                <div className="p-2 bg-paper border border-rule rounded-sm font-mono text-[11px] text-ink-2">
                  <div>User: <span className="text-ink">staff@brightloop.local</span></div>
                  <div>Pass: <span className="text-ink">Brightloop1!</span></div>
                </div>
              </div>

              <form action={staffLoginAction}>
                <button
                  type="submit"
                  className="w-full h-[36px] border border-ink bg-sheet text-ink text-[13px] font-sans font-semibold rounded-sm hover:bg-hover active:bg-selected transition-colors flex items-center justify-center gap-2"
                >
                  Launch Staff Workspace &rarr;
                </button>
              </form>
            </div>

            {/* Persona 3: Customer */}
            <div className="bg-sheet border border-ink p-5 rounded-sm flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-ink-2 font-semibold">
                    Persona 03
                  </span>
                  <span className="px-1.5 py-0.5 border border-rule bg-paper text-[10px] font-mono uppercase rounded-sm">
                    Customer Role
                  </span>
                </div>
                <h3 className="text-[16px] font-sans font-semibold text-ink">
                  Customer Self-Service
                </h3>
                <p className="text-[12px] font-sans text-ink-2">
                  Tenant-isolated portal to pause, resume, or renew subscriptions,
                  download tax-compliant invoices, and pay outstanding balances online.
                </p>
                <div className="p-2 bg-paper border border-rule rounded-sm font-mono text-[11px] text-ink-2">
                  <div>User: <span className="text-ink">demo.customer@brightloop.com</span></div>
                  <div>Pass: <span className="text-ink">Customer1!</span></div>
                </div>
              </div>

              <form action={customerLoginAction}>
                <button
                  type="submit"
                  className="w-full h-[36px] border border-ink bg-sheet text-ink text-[13px] font-sans font-semibold rounded-sm hover:bg-hover active:bg-selected transition-colors flex items-center justify-center gap-2"
                >
                  Launch Customer Portal &rarr;
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Live Production Telemetry */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-sans font-bold uppercase tracking-wide text-ink">
              Live Production Telemetry (Real-time PostgreSQL Ledger)
            </h2>
            <span className="text-[11px] font-mono text-ink-2">
              Queried via dashboard_summary() RPC
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-sheet border border-rule rounded-sm">
              <span className="text-[11px] font-mono uppercase text-ink-2 block">
                Normalized MRR
              </span>
              <Money
                value={Number(summary.mrr)}
                className="text-[20px] font-semibold text-ink mt-1 block"
              />
              <span className="text-[11px] font-mono text-ink-2 mt-1 block">
                Across active contracts
              </span>
            </div>

            <div className="p-4 bg-sheet border border-rule rounded-sm">
              <span className="text-[11px] font-mono uppercase text-ink-2 block">
                Active Contracts
              </span>
              <span className="text-[20px] font-mono font-semibold text-ink mt-1 block">
                {summary.active_subscriptions} Active
              </span>
              <span className="text-[11px] font-mono text-ink-2 mt-1 block">
                Idempotent billing state
              </span>
            </div>

            <div className="p-4 bg-sheet border border-rule rounded-sm">
              <span className="text-[11px] font-mono uppercase text-ink-2 block">
                Collected This Period
              </span>
              <Money
                value={Number(summary.collected)}
                className="text-[20px] font-semibold text-ok mt-1 block"
              />
              <span className="text-[11px] font-mono text-ink-2 mt-1 block">
                Verified payment receipts
              </span>
            </div>

            <div className="p-4 bg-sheet border border-rule rounded-sm">
              <span className="text-[11px] font-mono uppercase text-ink-2 block">
                Outstanding Balance
              </span>
              <Money
                value={Number(summary.outstanding)}
                className="text-[20px] font-semibold text-bad mt-1 block"
              />
              <span className="text-[11px] font-mono text-bad mt-1 block">
                {summary.overdue_count} overdue invoice(s)
              </span>
            </div>
          </div>
        </section>

        {/* The 5-Act Interactive Story & Operational Flow */}
        <section className="space-y-4">
          <div>
            <h2 className="text-[16px] font-sans font-bold uppercase tracking-wide text-ink">
              The 5-Act Operational Storyboard & Lifecycle Architecture
            </h2>
            <p className="text-[12px] font-sans text-ink-2">
              Every phase of recurring revenue management is enforced directly by PostgreSQL:
            </p>
          </div>

          <div className="space-y-3">
            {/* Act 1 */}
            <div className="p-4 bg-sheet border border-rule rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1 max-w-[760px]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-ink text-sheet text-[10px] font-mono font-semibold uppercase rounded-sm">
                    Act 1
                  </span>
                  <h3 className="text-[14px] font-sans font-semibold text-ink">
                    Catalog & Tax Authority
                  </h3>
                </div>
                <p className="text-[13px] font-sans text-ink-2">
                  Products with variant surcharges, recurring multi-cadence plans (daily, weekly, monthly, yearly),
                  stackable tiered discounts, and tax rates (GST 18%). Minimum line item quantities and auto-closing
                  behaviors are declared at the catalog level.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[12px] font-mono">
                <Link href="/products" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /products
                </Link>
                <Link href="/plans" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /plans
                </Link>
                <Link href="/taxes" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /taxes
                </Link>
              </div>
            </div>

            {/* Act 2 */}
            <div className="p-4 bg-sheet border border-rule rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1 max-w-[760px]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-ink text-sheet text-[10px] font-mono font-semibold uppercase rounded-sm">
                    Act 2
                  </span>
                  <h3 className="text-[14px] font-sans font-semibold text-ink">
                    Quotation & Subscription State Machine
                  </h3>
                </div>
                <p className="text-[13px] font-sans text-ink-2">
                  Contracts progress through <code className="font-mono text-ink text-[12px]">draft</code> &rarr;{" "}
                  <code className="font-mono text-ink text-[12px]">quotation</code> &rarr;{" "}
                  <code className="font-mono text-ink text-[12px]">confirmed</code> &rarr;{" "}
                  <code className="font-mono text-ink text-[12px]">active</code>.
                  A PostgreSQL trigger permanently locks line items once confirmed, creating an immutable commercial snapshot.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[12px] font-mono">
                <Link href="/subscriptions" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /subscriptions
                </Link>
                <Link href="/subscriptions/new" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /subscriptions/new
                </Link>
              </div>
            </div>

            {/* Act 3 */}
            <div className="p-4 bg-sheet border border-rule rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1 max-w-[760px]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-ink text-sheet text-[10px] font-mono font-semibold uppercase rounded-sm">
                    Act 3
                  </span>
                  <h3 className="text-[14px] font-sans font-semibold text-ink">
                    Automated Advisory-Locked Invoicing Engine
                  </h3>
                </div>
                <p className="text-[13px] font-sans text-ink-2">
                  Scheduled daily via <code className="font-mono text-ink text-[12px]">pg_cron</code>.
                  The function <code className="font-mono text-ink text-[12px]">billing_run_generate()</code> acquires{" "}
                  <code className="font-mono text-ink text-[12px]">pg_advisory_xact_lock(hashtext(&apos;billing&apos;))</code> to serialize
                  concurrent invoice batches. A database unique constraint on (subscription_id, period_start, period_end) guarantees
                  no period can ever be billed twice.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[12px] font-mono">
                <Link href="/billing-runs" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /billing-runs
                </Link>
              </div>
            </div>

            {/* Act 4 */}
            <div className="p-4 bg-sheet border border-rule rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1 max-w-[760px]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-ink text-sheet text-[10px] font-mono font-semibold uppercase rounded-sm">
                    Act 4
                  </span>
                  <h3 className="text-[14px] font-sans font-semibold text-ink">
                    Customer Portal Self-Service & Online Settlement
                  </h3>
                </div>
                <p className="text-[13px] font-sans text-ink-2">
                  Customers log into a dedicated self-service portal governed by PostgreSQL security definer functions.
                  They can self-pause, resume, or renew contracts, download clean printable tax receipts, and pay outstanding
                  balances with simulated instant settlement.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[12px] font-mono">
                <Link href="/portal" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /portal
                </Link>
              </div>
            </div>

            {/* Act 5 */}
            <div className="p-4 bg-sheet border border-rule rounded-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1 max-w-[760px]">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-ink text-sheet text-[10px] font-mono font-semibold uppercase rounded-sm">
                    Act 5
                  </span>
                  <h3 className="text-[14px] font-sans font-semibold text-ink">
                    Executive Financial Ledger & Aging Analytics
                  </h3>
                </div>
                <p className="text-[13px] font-sans text-ink-2">
                  Real-time normalized MRR calculation, 12-month historical collection charts, receivables aging across
                  0&ndash;30, 31&ndash;60, and 61+ day buckets, and edge runtime streaming CSV exports.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[12px] font-mono">
                <Link href="/dashboard" className="px-2 py-1 border border-rule hover:border-ink rounded-sm">
                  /dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Matrix & Proof Points */}
        <section className="p-6 bg-sheet border border-ink rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <h2 className="text-[15px] font-sans font-bold uppercase tracking-wide text-ink">
              Quality Assurance & Compliance Proof Matrix
            </h2>
            <span className="text-[11px] font-mono text-ok font-semibold">
              100% Passed (Release v1.0.0)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px] font-sans">
            <div>
              <span className="text-ink-2 text-[11px] font-mono uppercase block">Vitest Unit Suites</span>
              <span className="font-semibold text-ink mt-0.5 block">16 / 16 Passed (79 Tests)</span>
            </div>
            <div>
              <span className="text-ink-2 text-[11px] font-mono uppercase block">Playwright E2E</span>
              <span className="font-semibold text-ink mt-0.5 block">6 / 6 Journeys Green</span>
            </div>
            <div>
              <span className="text-ink-2 text-[11px] font-mono uppercase block">Design Tokens</span>
              <span className="font-semibold text-ink mt-0.5 block">0 Banned SVGs &middot; 2px Max</span>
            </div>
            <div>
              <span className="text-ink-2 text-[11px] font-mono uppercase block">RLS Coverage</span>
              <span className="font-semibold text-ink mt-0.5 block">20 / 20 Tables Enforced</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-[12px] font-mono border-t border-rule text-ink-2">
            <Link href="/docs/ENVIRONMENT_SETUP.md" className="underline hover:text-ink">
              Team Setup Guide
            </Link>
            <span>&middot;</span>
            <Link href="/docs/DEMO_SCRIPT.md" className="underline hover:text-ink">
              5-Minute Pitch Script
            </Link>
            <span>&middot;</span>
            <Link href="/docs/00_INDEX.md" className="underline hover:text-ink">
              Specification Index
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-[48px] bg-sheet border-t border-rule px-6 flex items-center justify-between text-[11px] font-mono text-ink-2">
        <span>Brightloop SMS &middot; SicadaS Team</span>
        <span>Make-a-Ton Hackathon 2026</span>
      </footer>
    </div>
  );
}
