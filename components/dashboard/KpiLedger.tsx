'use client';

import React from 'react';
import { CountUp } from '@/components/ui/CountUp';
import { mockKpiData } from '@/lib/data/dashboard';

export const KpiLedger: React.FC = () => {
  return (
    <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-[#d1c9b8]">
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Active subscriptions</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={mockKpiData.activeSubscriptionsCount} />
              </div>
              <div className="text-xs text-[#6e6a5f] mt-1">{mockKpiData.activeSubscriptionsContext}</div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Monthly recurring revenue</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={mockKpiData.mrr} isCurrency />
              </div>
              <div className="text-xs text-[#6e6a5f] mt-1">{mockKpiData.mrrContext}</div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Invoiced in period</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={mockKpiData.invoicedInPeriod} isCurrency />
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Collected in period</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={mockKpiData.collectedInPeriod} isCurrency />
              </div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Outstanding</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#2b2b2b]">
                <CountUp value={mockKpiData.outstanding} isCurrency />
              </div>
              <div className="text-xs text-[#6e6a5f] mt-1">{mockKpiData.outstandingContext}</div>
            </td>
          </tr>
          <tr className="hover:bg-[#f4f1ea]">
            <td className="p-3 text-sm font-medium text-[#2b2b2b] align-top">Overdue</td>
            <td className="p-3 text-right align-top">
              <div className="text-[24px] font-mono leading-none text-[#8c2a2a]">
                <CountUp value={mockKpiData.overdueAmount} isCurrency />
              </div>
              <div className="text-xs text-[#6e6a5f] mt-1">{mockKpiData.overdueContext}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
