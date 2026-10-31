import React from "react";

export interface DateTextProps {
  value: string | Date | null | undefined;
  className?: string;
  fallback?: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";

  // If already YYYY-MM-DD
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const monthName = MONTHS[month - 1] || "";
    return `${day} ${monthName} ${year}`;
  }

  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "-";

  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

export function DateText({
  value,
  className = "",
  fallback = "-",
}: DateTextProps) {
  const formatted = formatDate(value);

  return (
    <span
      className={`font-mono text-[13px] tabular-nums text-ink ${className}`}
    >
      {formatted === "-" ? fallback : formatted}
    </span>
  );
}
