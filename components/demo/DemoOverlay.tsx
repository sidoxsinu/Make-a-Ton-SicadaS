"use client";

import React, { useState } from "react";
import { demoSignInAction } from "@/app/auth/actions";

interface DemoOverlayProps {
  defaultOpen?: boolean;
}

export function DemoOverlay({ defaultOpen = false }: DemoOverlayProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener("open-demo-overlay", handleOpen);
    if (window.location.hash === "#demo") {
      setOpen(true);
    }
    return () => window.removeEventListener("open-demo-overlay", handleOpen);
  }, []);

  async function handleDemoSignIn(role: "admin" | "staff" | "customer") {
    setLoadingRole(role);
    setErrorMsg(null);
    try {
      await demoSignInAction(role);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in demo user";
      if (!msg.includes("NEXT_REDIRECT")) {
        setErrorMsg(msg);
        setLoadingRole(null);
      }
    }
  }

  return (
    <>
      {/* Floating Demo Trigger Button at bottom-right */}
      <div className="print:hidden fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="h-[36px] px-3.5 border border-ink bg-sheet text-ink font-mono text-[11px] uppercase tracking-wider font-semibold rounded-sm hover:bg-hover active:bg-selected cursor-pointer transition-colors flex items-center gap-2"
          aria-expanded={open}
        >
          <span className="w-2 h-2 rounded-none bg-ok inline-block" />
          <span>[Demo Personas]</span>
        </button>
      </div>

      {/* Floating Drawer / Modal Overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed bottom-16 right-4 z-50 w-[400px] max-w-[calc(100vw-32px)] bg-sheet border border-ink p-5 rounded-sm flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-rule pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ok font-semibold block">
                Evaluation Access
              </span>
              <h3 className="text-[15px] font-sans font-bold text-ink uppercase tracking-tight mt-0.5">
                1-Click Demo Personas
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-mono uppercase text-ink-2 hover:text-ink px-1.5 py-0.5 border border-rule hover:border-ink rounded-sm"
              aria-label="Close demo overlay"
            >
              [Close]
            </button>
          </div>

          <p className="text-[12px] font-sans text-ink-2 leading-relaxed">
            Instantly authenticate as pre-configured accounts to inspect pre-seeded data, or close this to test dynamic data from a blank account.
          </p>

          {errorMsg && (
            <div className="p-2.5 bg-paper border border-bad text-bad text-[12px] font-sans rounded-sm">
              {errorMsg}
            </div>
          )}

          {/* Persona Buttons */}
          <div className="space-y-2.5">
            {/* Admin */}
            <div className="p-3 bg-paper border border-rule rounded-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-sans font-semibold text-ink">
                    Admin
                  </span>
                  <span className="text-[10px] font-mono text-ink-2 uppercase">
                    Full Control
                  </span>
                </div>
                <div className="text-[11px] font-mono text-ink-2 truncate">
                  sinan@brightloop.local &middot; Brightloop1!
                </div>
              </div>
              <button
                type="button"
                disabled={Boolean(loadingRole)}
                onClick={() => handleDemoSignIn("admin")}
                className="shrink-0 px-3 py-1.5 bg-ink text-sheet text-[12px] font-sans font-semibold rounded-sm hover:opacity-90 active:opacity-100 disabled:opacity-50"
              >
                {loadingRole === "admin" ? "..." : "Launch"}
              </button>
            </div>

            {/* Staff */}
            <div className="p-3 bg-paper border border-rule rounded-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-sans font-semibold text-ink">
                    Staff
                  </span>
                  <span className="text-[10px] font-mono text-ink-2 uppercase">
                    Operations
                  </span>
                </div>
                <div className="text-[11px] font-mono text-ink-2 truncate">
                  staff@brightloop.local &middot; Brightloop1!
                </div>
              </div>
              <button
                type="button"
                disabled={Boolean(loadingRole)}
                onClick={() => handleDemoSignIn("staff")}
                className="shrink-0 px-3 py-1.5 border border-ink bg-sheet text-ink text-[12px] font-sans font-semibold rounded-sm hover:bg-hover active:bg-selected disabled:opacity-50"
              >
                {loadingRole === "staff" ? "..." : "Launch"}
              </button>
            </div>

            {/* Customer */}
            <div className="p-3 bg-paper border border-rule rounded-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-sans font-semibold text-ink">
                    Customer
                  </span>
                  <span className="text-[10px] font-mono text-ink-2 uppercase">
                    Self-Service
                  </span>
                </div>
                <div className="text-[11px] font-mono text-ink-2 truncate">
                  demo.customer@brightloop.com &middot; Customer1!
                </div>
              </div>
              <button
                type="button"
                disabled={Boolean(loadingRole)}
                onClick={() => handleDemoSignIn("customer")}
                className="shrink-0 px-3 py-1.5 border border-ink bg-sheet text-ink text-[12px] font-sans font-semibold rounded-sm hover:bg-hover active:bg-selected disabled:opacity-50"
              >
                {loadingRole === "customer" ? "..." : "Launch"}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-rule text-[11px] font-mono text-ink-2 flex items-center justify-between">
            <span>To start from scratch:</span>
            <a href="/signup" className="text-ink underline hover:text-ink-2">
              Sign up blank account &rarr;
            </a>
          </div>
        </div>
      )}
    </>
  );
}
