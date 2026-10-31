'use client';

import React from 'react';
import { CountUp } from '@/components/ui/CountUp';

export interface KpiLedgerData {
  active_subscriptions: number;
  mrr: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  overdue_amount: number;
  overdue_count: number;
}

export const KpiLedger: React.FC<{ data: KpiLedgerData }> = ({ data }) => {
  return (
    <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-[#d1c9b8]">
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Active subscriptions</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={data.active_subscriptions} />
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Monthly recurring revenue</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={data.mrr} isCurrency />
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Invoiced in period</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={data.invoiced} isCurrency />
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Collected in period</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={data.collected} isCurrency />
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Outstanding</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={data.outstanding} isCurrency />
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Overdue</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#8c2a2a]">
                <CountUp value={data.overdue_amount} isCurrency />
              </div>
              <div className="text-xs text-[#6e6a5f] mt-1">{data.overdue_count} invoices</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
