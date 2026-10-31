import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
  {
    title: "SELL",
    items: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Subscriptions", href: "/subscriptions" },
      { name: "Templates", href: "/templates" },
      { name: "Customers", href: "/customers" },
    ],
  },
  {
    title: "BILLING",
    items: [
      { name: "Invoices", href: "/invoices" },
      { name: "Payments", href: "/payments" },
      { name: "Billing Runs", href: "/billing-runs" },
    ],
  },
  {
    title: "CATALOG",
    items: [
      { name: "Products", href: "/products" },
      { name: "Plans", href: "/plans" },
      { name: "Discounts", href: "/discounts" },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { name: "Taxes", href: "/taxes" },
      { name: "Payment Terms", href: "/payment-terms" },
      { name: "Staff", href: "/staff" },
      { name: "Settings", href: "/settings" },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname() ?? "";

  return (
    <aside className="w-56 bg-sheet border-r border-rule min-h-screen p-5 flex flex-col justify-between select-none">
      <nav className="space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-[11px] font-bold text-ink-2 tracking-wider mb-2 font-mono">
              {section.title}
            </h4>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`block text-sm px-2 py-1 rounded-sm transition ${
                        isActive
                          ? "font-semibold text-accent-ink bg-accent"
                          : "text-ink hover:bg-hover"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
