"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  adminOnly?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const TEAM_NAV_GROUPS: NavGroup[] = [
  {
    title: "Sell",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Subscriptions", href: "/subscriptions" },
      { label: "Templates", href: "/templates" },
      { label: "Customers", href: "/customers" },
    ],
  },
  {
    title: "Billing",
    items: [
      { label: "Invoices", href: "/invoices" },
      { label: "Payments", href: "/payments" },
      { label: "Billing Runs", href: "/billing-runs" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: "/products" },
      { label: "Plans", href: "/plans" },
      { label: "Discounts", href: "/discounts" },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Taxes", href: "/taxes" },
      { label: "Payment Terms", href: "/payment-terms" },
      { label: "Staff", href: "/staff", adminOnly: true },
      { label: "Settings", href: "/settings" },
    ],
  },
];

export interface NavListProps {
  role?: "admin" | "staff" | "customer";
  onItemClick?: () => void;
}

export function NavList({ role = "admin", onItemClick }: NavListProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex flex-col gap-6 py-4" aria-label="Sidebar Navigation">
      {TEAM_NAV_GROUPS.map((group) => {
        const visibleItems = group.items.filter(
          (item) => !item.adminOnly || role === "admin"
        );

        if (visibleItems.length === 0) return null;

        return (
          <div key={group.title} className="flex flex-col gap-1">
            <h3 className="px-3 text-[11px] font-sans font-semibold uppercase tracking-[0.04em] text-ink-2 select-none">
              {group.title}
            </h3>
            <ul className="flex flex-col">
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onItemClick}
                      className={`block px-3 py-1.5 text-[13px] font-sans transition-colors rounded-sm ${
                        isActive
                          ? "bg-selected text-ink font-semibold"
                          : "text-ink hover:bg-hover hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
