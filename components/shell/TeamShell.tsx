"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NavList } from "./NavList";
import { Dialog } from "@/components/ui/Dialog";
import { createClient } from "@/lib/supabase/browser";

export interface TeamShellProps {
  children: React.ReactNode;
  userEmail?: string;
  role?: "admin" | "staff" | "customer";
  title?: string;
  onSignOut?: () => void;
}

export function TeamShell({
  children,
  userEmail = "admin@brightloop.local",
  role = "admin",
  title = "Brightloop",
  onSignOut,
}: TeamShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeUser, setActiveUser] = useState({
    email: userEmail,
    role: role,
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          const appRole =
            ((data.user.app_metadata as Record<string, unknown>)?.role as
              | "admin"
              | "staff"
              | "customer") || role;
          setActiveUser({
            email: data.user.email,
            role: appRole,
          });
        }
      } catch {
        // Fallback to props
      }
    }
    loadUser();
  }, [userEmail, role]);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      {/* Top Bar 48px */}
      <header className="h-[48px] bg-sheet border-b border-ink flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[13px] font-sans font-medium text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            {mobileMenuOpen ? "Close menu" : "Menu"}
          </button>
          <Link
            href="/dashboard"
            className="text-[14px] font-sans font-semibold tracking-tight text-ink uppercase"
          >
            Brightloop SMS
          </Link>
          <span className="hidden sm:inline-block text-rule">/</span>
          <h1 className="hidden sm:inline-block text-[14px] font-sans text-ink-2 font-normal">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-4 text-[13px] font-sans">
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="px-2 py-0.5 border border-rule text-ink-2 text-[11px] font-mono uppercase rounded-sm hover:border-ink hover:text-ink"
          >
            Workflow Guide
          </button>
          <span className="font-mono text-ink-2">{activeUser.email}</span>
          <span className="text-rule">|</span>
          {onSignOut ? (
            <button
              type="button"
              onClick={onSignOut}
              className="text-ink underline decoration-1 decoration-rule hover:text-ink-2"
            >
              Sign out
            </button>
          ) : (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-ink underline decoration-1 decoration-rule hover:text-ink-2"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail 232px (Desktop) */}
        <aside className="hidden md:block w-[232px] bg-sheet border-r border-ink shrink-0 overflow-y-auto px-2">
          <NavList role={role} />
        </aside>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden flex"
            style={{ backgroundColor: "rgba(27,31,35,0.35)" }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-[232px] h-full bg-sheet border-r border-ink p-2 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-rule flex justify-between items-center">
                <span className="text-[12px] font-sans font-semibold uppercase text-ink-2">
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[12px] font-sans underline"
                >
                  Close
                </button>
              </div>
              <NavList
                role={role}
                onItemClick={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Content Area padding 24px */}
        <main className="flex-1 overflow-y-auto p-6 bg-paper">
          <div className="max-w-[1280px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Story & Workflow Guide Dialog */}
      <Dialog
        open={guideOpen}
        title="Brightloop SMS: End-to-End Story & Workflow Blueprint"
        confirmLabel="Close Guide"
        cancelLabel="Open Portal"
        variant="primary"
        onConfirm={() => setGuideOpen(false)}
        onCancel={() => {
          setGuideOpen(false);
          window.location.href = "/portal";
        }}
        body={
          <div className="flex flex-col gap-4 text-[13px] font-sans max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-ink-2">
              Follow this 5-act operational journey to demonstrate or test the
              complete subscription lifecycle:
            </p>

            <div className="flex flex-col gap-3">
              <div className="p-3 bg-paper border border-rule rounded-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Act 1: Catalog & Tax Authority
                  </span>
                  <div className="flex gap-2 text-[11px] font-mono">
                    <Link
                      href="/products"
                      className="underline text-ink hover:text-ink-2"
                    >
                      /products
                    </Link>
                    <Link
                      href="/plans"
                      className="underline text-ink hover:text-ink-2"
                    >
                      /plans
                    </Link>
                  </div>
                </div>
                <p className="text-[12px] text-ink-2 mt-1">
                  Products, variants, and recurring billing plans (daily, weekly,
                  monthly, yearly) with automated tax configuration (GST 18%).
                </p>
              </div>

              <div className="p-3 bg-paper border border-rule rounded-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Act 2: Subscriptions & Quotation State Machine
                  </span>
                  <Link
                    href="/subscriptions"
                    className="text-[11px] font-mono underline text-ink hover:text-ink-2"
                  >
                    /subscriptions
                  </Link>
                </div>
                <p className="text-[12px] text-ink-2 mt-1">
                  Create new contracts (or from templates). Strict transitions:{" "}
                  <code className="text-ink font-mono text-[11px]">Draft</code>{" "}
                  →{" "}
                  <code className="text-ink font-mono text-[11px]">
                    Quotation
                  </code>{" "}
                  →{" "}
                  <code className="text-ink font-mono text-[11px]">
                    Confirmed
                  </code>{" "}
                  (triggers line freeze lock) →{" "}
                  <code className="text-ink font-mono text-[11px]">Active</code>.
                </p>
              </div>

              <div className="p-3 bg-paper border border-rule rounded-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Act 3: Advisory-Locked Billing Automation
                  </span>
                  <Link
                    href="/billing-runs"
                    className="text-[11px] font-mono underline text-ink hover:text-ink-2"
                  >
                    /billing-runs
                  </Link>
                </div>
                <p className="text-[12px] text-ink-2 mt-1">
                  Execute the PostgreSQL billing engine. Uses{" "}
                  <code className="text-ink font-mono text-[11px]">
                    pg_advisory_xact_lock
                  </code>{" "}
                  and unique constraints to guarantee zero duplicate bills.
                </p>
              </div>

              <div className="p-3 bg-paper border border-rule rounded-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Act 4: Invoicing, Receipts & Payments
                  </span>
                  <div className="flex gap-2 text-[11px] font-mono">
                    <Link
                      href="/invoices"
                      className="underline text-ink hover:text-ink-2"
                    >
                      /invoices
                    </Link>
                    <Link
                      href="/payments"
                      className="underline text-ink hover:text-ink-2"
                    >
                      /payments
                    </Link>
                  </div>
                </div>
                <p className="text-[12px] text-ink-2 mt-1">
                  Review generated invoices, print tax-compliant receipts, and
                  record manual payments. Overpayment is rejected by database
                  constraints.
                </p>
              </div>

              <div className="p-3 bg-paper border border-rule rounded-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    Act 5: Executive Ledger Analytics & Aging
                  </span>
                  <Link
                    href="/dashboard"
                    className="text-[11px] font-mono underline text-ink hover:text-ink-2"
                  >
                    /dashboard
                  </Link>
                </div>
                <p className="text-[12px] text-ink-2 mt-1">
                  Real-time normalized MRR, active contracts, and receivables
                  aging buckets (0–30, 31–60, 61+ days).
                </p>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

