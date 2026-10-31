"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NavList } from "./NavList";

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
          <span className="font-mono text-ink-2">{userEmail}</span>
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
    </div>
  );
}
