import React from "react";
import Link from "next/link";

export interface TabItem {
  key: string;
  label: string;
  href?: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({
  items,
  value,
  onChange,
  className = "",
}: TabsProps) {
  return (
    <nav
      className={`flex items-center border-b border-rule gap-1 ${className}`}
      aria-label="Tabs"
    >
      {items.map((tab) => {
        const isActive = tab.key === value;
        const classes = `px-3.5 py-2 text-[13px] font-sans transition-colors border-b-2 -mb-[1px] select-none ${
          isActive
            ? "border-ink font-semibold text-ink bg-selected"
            : "border-transparent text-ink-2 hover:text-ink hover:bg-hover"
        }`;

        if (tab.href) {
          return (
            <Link key={tab.key} href={tab.href} className={classes}>
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className="ml-1.5 font-mono text-[11px] text-ink-2">
                  ({tab.count})
                </span>
              )}
            </Link>
          );
        }

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            className={classes}
          >
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className="ml-1.5 font-mono text-[11px] text-ink-2">
                ({tab.count})
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

