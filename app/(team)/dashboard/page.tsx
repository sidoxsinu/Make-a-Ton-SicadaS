'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { KpiLedger } from '@/components/dashboard/KpiLedger';
import { BarSeries } from '@/components/dashboard/BarSeries';
import { fetchDashboard } from '@/lib/data/dashboard';
import type { KpiLedgerData } from '@/components/dashboard/KpiLedger';

export default function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(`${today.slice(0, 7)}-01`);
  const [toDate, setToDate] = useState(today);
  const [appliedFromDate, setAppliedFromDate] = useState(`${today.slice(0, 7)}-01`);
  const [appliedToDate, setAppliedToDate] = useState(today);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof fetchDashboard>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchDashboard(appliedFromDate, appliedToDate)
      .then(setDashboard)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Dashboard data could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, [appliedFromDate, appliedToDate]);

  const handleApplyFilter = () => {
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#d1c9b8] pb-4">
        <h1 className="text-2xl font-bold text-[#2b2b2b]">Dashboard</h1>
        <p className="text-sm font-sans text-[#6e6a5f] mt-1">Ledger summary and revenue metrics.</p>
      </div>

      {/* 1. Filter Bar */}
      <div className="bg-[#f9f7f2] border border-[#d1c9b8] p-3 rounded-[2px] flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#2b2b2b] uppercase">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] text-xs font-mono rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#2b2b2b] uppercase">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] text-xs font-mono rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
          />
        </div>
        <Button variant="primary" onClick={handleApplyFilter}>
          Apply
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[#8c2a2a]">{error}</p>
      ) : isLoading || !dashboard ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">
          Loading dashboard metrics...
        </div>
      ) : (
        <>
          {/* 2. KpiLedger */}
          <KpiLedger data={dashboard.summary as KpiLedgerData} />

          {/* 3. Split Pane 60 to 40 */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Left 60% */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-2">
                <h3 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider">
                  Overdue invoices
                </h3>
                <Link
                  href="/invoices?overdue=1"
                  className="text-xs text-[#1e4d58] underline underline-offset-2 hover:text-[#163a43]"
                >
                  View all overdue
                </Link>
              </div>

              <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
                {dashboard.overdue.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#6e6a5f] font-mono">
                    No overdue invoices.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                      <tr>
                        <th className="p-2.5">Invoice</th>
                        <th className="p-2.5">Customer</th>
                        <th className="p-2.5">Due date</th>
                        <th className="p-2.5 text-right">Days overdue</th>
                        <th className="p-2.5 text-right">Amount due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d1c9b8] font-mono">
                      {dashboard.overdue.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#f4f1ea]">
                          <td className="p-2.5">
                            <Link href={`/invoices`} className="text-[#1e4d58] font-bold underline">
                              {inv.id}
                            </Link>
                          </td>
                          <td className="p-2.5 font-sans text-[#2b2b2b]">{inv.customerName}</td>
                          <td className="p-2.5 text-[#6e6a5f]">{inv.dueDate}</td>
                          <td className="p-2.5 text-right text-[#8c2a2a] font-bold">{inv.daysOverdue}</td>
                          <td className="p-2.5 text-right font-bold">
                            <Money value={inv.amountDue} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right 40% */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider mb-2 border-b border-[#d1c9b8] pb-2">
                  Overdue aging
                </h3>
                <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y divide-[#d1c9b8]">
                      {dashboard.aging.map((bucket) => (
                        <tr key={bucket.range} className="hover:bg-[#f4f1ea]">
                          <td className="p-2.5 font-sans text-[#2b2b2b]">{bucket.range}</td>
                          <td className="p-2.5 text-right">
                            <Money value={bucket.amount} className="font-bold text-[#2b2b2b]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <BarSeries data={dashboard.monthly} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
