import React from "react";
import { Money } from "./Money";

type Amount = number | string;

export interface TotalsLedgerProps {
  subtotal: Amount;
  discount: Amount;
  tax: Amount;
  total: Amount;
  paid?: Amount;
  due?: Amount;
  currency?: string;
  className?: string;
}

function asNumber(value: Amount): number {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}

function Row({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-6 py-2 border-b border-rule ${
        strong ? "border-t border-t-ink" : ""
      }`}
    >
      <dt
        className={`text-[13px] font-sans ${
          strong ? "font-semibold text-ink" : "text-ink-2"
        }`}
      >
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

export function TotalsLedger({
  subtotal,
  discount,
  tax,
  total,
  paid,
  due,
  currency,
  className = "",
}: TotalsLedgerProps) {
  const discountValue = asNumber(discount);
  const shownDiscount = discountValue === 0 ? 0 : -Math.abs(discountValue);

  return (
    <dl className={`border-t border-ink ${className}`}>
      <Row label="Subtotal">
        <Money value={subtotal} currency={currency} />
      </Row>
      <Row label="Discount">
        <Money value={shownDiscount} currency={currency} />
      </Row>
      <Row label="Tax">
        <Money value={tax} currency={currency} />
      </Row>
      <Row label="Total" strong>
        <Money value={total} currency={currency} className="font-medium" />
      </Row>
      {paid !== undefined && (
        <Row label="Paid">
          <Money value={paid} currency={currency} />
        </Row>
      )}
      {due !== undefined && (
        <Row label="Due" strong>
          <Money value={due} currency={currency} className="font-medium" />
        </Row>
      )}
    </dl>
  );
}
