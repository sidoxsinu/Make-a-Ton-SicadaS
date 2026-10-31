"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface PortalShellProps {
  children: React.ReactNode;
  userEmail?: string;
  onSignOut?: () => void;
}

export function PortalShell({
  children,
  userEmail = "customer@brightloop.local",
  onSignOut,
}: PortalShellProps) {
  const pathname = usePathname();

  const navLinks = [
    { label: "My Subscriptions & Invoices", href: "/portal" },
    { label: "Account Details", href: "/portal/account" },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      {/* Top Bar 48px */}
      <header className="h-[48px] bg-sheet border-b border-ink flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <Link
            href="/portal"
            className="text-[14px] font-sans font-semibold tracking-tight text-ink uppercase"
          >
            Brightloop Customer Portal
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 text-[13px] font-sans rounded-sm transition-colors ${
                    isActive
                      ? "bg-selected text-ink font-semibold"
                      : "text-ink-2 hover:bg-hover hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
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

      {/* Mobile Nav Sub-Bar */}
      <div className="sm:hidden flex items-center gap-2 px-4 py-2 bg-sheet border-b border-rule">
        {navLinks.map((item) => {
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2 py-1 text-[12px] font-sans rounded-sm ${
                isActive
                  ? "bg-selected text-ink font-semibold"
                  : "text-ink-2 hover:bg-hover"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content Area padding 24px */}
      <main className="flex-1 overflow-y-auto p-6 bg-paper">
        <div className="max-w-[1080px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

