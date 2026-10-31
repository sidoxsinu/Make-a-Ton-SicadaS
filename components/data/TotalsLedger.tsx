import React from "react";
import { Money } from "@/components/ui/Money";

export interface TotalsLedgerProps {
  subtotal: number;
  discountTotal?: number;
  taxTotal: number;
  total: number;
  amountPaid?: number;
  amountDue?: number;
  className?: string;
}

export function TotalsLedger({
  subtotal,
  discountTotal = 0,
  taxTotal,
  total,
  amountPaid,
  amountDue,
  className = "",
}: TotalsLedgerProps) {
  const computedDue = amountDue !== undefined ? amountDue : total - (amountPaid || 0);

  return (
    <div
      className={`border border-rule rounded-sm bg-sheet p-4 flex flex-col gap-2 font-sans text-[13px] ${className}`}
    >
      <div className="flex justify-between py-1 border-b border-rule text-ink-2">
        <span>Subtotal:</span>
        <Money value={subtotal} />
      </div>

      {discountTotal > 0 && (
        <div className="flex justify-between py-1 border-b border-rule text-warn font-medium">
          <span>Discounts:</span>
          <span>
            -<Money value={discountTotal} />
          </span>
        </div>
      )}

      <div className="flex justify-between py-1 border-b border-rule text-ink-2">
        <span>Taxes:</span>
        <Money value={taxTotal} />
      </div>

      <div className="flex justify-between py-2 border-b border-ink font-semibold text-[15px] text-ink">
        <span>Total:</span>
        <Money value={total} className="text-[15px] font-semibold" />
      </div>

      {amountPaid !== undefined && (
        <div className="flex justify-between py-1 border-b border-rule text-ok">
          <span>Amount Paid:</span>
          <Money value={amountPaid} />
        </div>
      )}

      {amountPaid !== undefined && (
        <div
          className={`flex justify-between pt-1 font-semibold ${
            computedDue > 0 ? "text-bad" : "text-ink-2"
          }`}
        >
          <span>Amount Due:</span>
          <Money value={computedDue} />
        </div>
      )}
    </div>
  );
}
