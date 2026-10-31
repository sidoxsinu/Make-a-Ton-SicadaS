import React from "react";

export interface MoneyProps {
  value: number | string | null | undefined;
  currency?: string;
  className?: string;
}

export function formatMoney(
  value: number | string | null | undefined,
  currency: string = "INR"
): string {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  const safeNum = isNaN(num) ? 0 : num;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeNum);
  } catch {
    return `${currency} ${safeNum.toFixed(2)}`;
  }
}

export function Money({
  value,
  currency = "INR",
  className = "",
}: MoneyProps) {
  const formatted = formatMoney(value, currency);

  return (
    <span
      className={`font-mono text-[13px] tabular-nums text-ink ${className}`}
    >
      {formatted}
    </span>
  );
}
