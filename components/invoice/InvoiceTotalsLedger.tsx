import React from 'react';
import { Money } from '@/components/ui/Money';

interface InvoiceTotalsLedgerProps {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paidTotal: number;
  amountDue: number;
}

export const InvoiceTotalsLedger: React.FC<InvoiceTotalsLedgerProps> = ({
  subtotal,
  discountTotal,
  taxTotal,
  total,
  paidTotal,
  amountDue,
}) => {
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
            <td className="p-2.5 font-sans text-[#6e6a5f]">Discount</td>
            <td className="p-2.5 text-right font-mono text-[#2b2b2b]">
              -<Money value={discountTotal} />
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-2.5 font-sans text-[#6e6a5f]">Tax</td>
            <td className="p-2.5 text-right font-mono text-[#2b2b2b]">
              <Money value={taxTotal} />
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea] font-bold">
            <td className="p-2.5 font-sans text-[#2b2b2b]">Total</td>
            <td className="p-2.5 text-right font-mono text-[#1e4d58]">
              <Money value={total} />
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-2.5 font-sans text-[#6e6a5f]">Paid</td>
            <td className="p-2.5 text-right font-mono text-[#2b2b2b]">
              <Money value={paidTotal} />
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea] font-bold bg-[#eee9df]">
            <td className="p-2.5 font-sans text-[#2b2b2b]">Amount due</td>
            <td className="p-2.5 text-right font-mono text-[#8c2a2a]">
              <Money value={amountDue} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
