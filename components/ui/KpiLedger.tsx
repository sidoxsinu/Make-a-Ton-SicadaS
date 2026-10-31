"use client";

import React, { useCallback, useRef } from "react";
import { useCountUp } from "@/lib/motion";
import { formatValue, type ValueFormat } from "@/lib/format";

export interface KpiRow {
  label: string;
  value: number;
  format: ValueFormat;
  context?: string;
}

export interface KpiLedgerProps {
  rows: KpiRow[];
  currency?: string;
  className?: string;
}

function KpiValue({
  value,
  format,
  currency,
}: {
  value: number;
  format: ValueFormat;
  currency: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const formatter = useCallback(
    (n: number) => formatValue(n, format, currency),
    [format, currency]
  );
  useCountUp(ref, value, formatter);

  const text = formatValue(value, format, currency);

  return (
    <>
      <span
        ref={ref}
        aria-hidden="true"
        className="block font-mono text-[24px] font-medium tabular-nums text-ink leading-tight"
      >
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

export function KpiLedger({ rows, currency = "INR", className = "" }: KpiLedgerProps) {
  return (
    <dl className={`border-t border-ink ${className}`}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-6 py-3 border-b border-rule"
        >
          <dt className="text-[14px] font-sans font-semibold text-ink">
            {row.label}
          </dt>
          <dd className="text-right">
            <KpiValue value={row.value} format={row.format} currency={currency} />
            {row.context && (
              <span className="block mt-1 text-[12px] font-sans text-ink-2">
                {row.context}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
