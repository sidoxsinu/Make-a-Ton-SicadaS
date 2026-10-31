import React from 'react';
import { Money } from '@/components/ui/Money';
import { SubscriptionLineItem } from '@/types/subscriptionDetail';

interface TotalsLedgerProps {
  lines: SubscriptionLineItem[];
}

export const TotalsLedger: React.FC<TotalsLedgerProps> = ({ lines }) => {
  const subtotal = lines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);
  const tax = lines.reduce(
    (acc, line) => acc + (line.quantity * line.unitPrice * line.taxPercent) / 100,
    0
  );
  const total = subtotal + tax;

  return (
    <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
      <div className="p-3 border-b border-[#d1c9b8]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#2b2b2b]">Totals</h3>
      </div>
      <table className="w-full text-left border-collapse text-xs">
        <tbody className="divide-y divide-[#d1c9b8]">
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-2.5 font-sans text-[#6e6a5f]">Subtotal</td>
            <td className="p-2.5 text-right font-mono text-[#2b2b2b]">
              <Money value={subtotal} />
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-2.5 font-sans text-[#6e6a5f]">Tax</td>
            <td className="p-2.5 text-right font-mono text-[#2b2b2b]">
              <Money value={tax} />
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea] font-bold">
            <td className="p-2.5 font-sans text-[#2b2b2b]">Total</td>
            <td className="p-2.5 text-right font-mono text-[#1e4d58]">
              <Money value={total} />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="p-2.5 bg-[#eee9df] border-t border-[#d1c9b8] text-[11px] font-sans text-[#6e6a5f]">
        Before discounts
      </div>
    </div>
  );
};
