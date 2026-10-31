import React from "react";

export interface BadgeProps {
  status: string;
  label?: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  draft: "border-ink-2 text-ink-2",
  quotation: "border-accent text-accent",
  confirmed: "border-accent text-accent",
  active: "border-ok text-ok",
  paused: "border-warn text-warn",
  closed: "border-ink-2 text-ink-2",
  cancelled: "border-ink-2 text-ink-2",
  paid: "border-ok text-ok",
  overdue: "border-bad text-bad",
  partial: "border-warn text-warn",
};

export function Badge({ status, label, className = "" }: BadgeProps) {
  const normalized = status.toLowerCase();
  const colorClass = statusColors[normalized] || "border-ink-2 text-ink-2";
  const displayLabel = label || status;

  return (
    <span
      className={`inline-block px-1.5 py-0.5 border text-[11px] font-sans font-semibold uppercase tracking-[0.04em] rounded-sm bg-transparent ${colorClass} ${className}`}
    >
      {displayLabel}
    </span>
  );
}

