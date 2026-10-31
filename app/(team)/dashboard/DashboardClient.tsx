"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KpiLedger, KpiRow } from "@/components/ui/KpiLedger";
import { BarSeries, BarDatum } from "@/components/ui/BarSeries";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/Inputs";

export interface DashboardData {
  active_subscriptions: number;
  by_status: Record<string, number>;
  mrr: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  overdue_count: number;
  overdue_amount: number;
  aging: {
    d0_30: number;
    d31_60: number;
    d61_up: number;
  };
  monthly: Array<{
    month: string;
    collected: number;
  }>;
}

export interface OverdueInvoiceItem {
  id: string;
  number: string;
  customer_name?: string;
  due_date: string;
  days_overdue: number;
  amount_due: number;
}

interface DashboardClientProps {
  data: DashboardData;
  overdueInvoices: OverdueInvoiceItem[];
  fromDate: string;
  toDate: string;
}

export function DashboardClient({
  data,
  overdueInvoices,
  fromDate,
  toDate,
}: DashboardClientProps) {
  const router = useRouter();

  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard?from=${from}&to=${to}`);
  }

  function setPreset(daysBack: number) {
    const today = new Date();
    const end = today.toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysBack);
    const start = startDate.toISOString().split("T")[0];

    setFrom(start);
    setTo(end);
    router.push(`/dashboard?from=${start}&to=${end}`);
  }

  // Top KPIs
  const topKpis: KpiRow[] = [
    {
      label: "Monthly Recurring Revenue (MRR)",
      value: Number(data.mrr || 0),
      format: "money",
      context: "Normalized to monthly cadence across active contracts",
    },
    {
      label: "Active Subscriptions",
      value: Number(data.active_subscriptions || 0),
      format: "number",
      context: `Status breakdown: ${data.by_status?.active || 0} active, ${data.by_status?.paused || 0
        } paused`,
    },
    {
      label: "Collected This Period",
      value: Number(data.collected || 0),
      format: "money",
      context: `Total payments received between ${fromDate} and ${toDate}`,
    },
    {
      label: "Total Receivables (Outstanding)",
      value: Number(data.outstanding || 0),
      format: "money",
      context: "Unpaid balance across all confirmed invoices",
    },
  ];

  // Overdue KPIs
  const overdueKpis: KpiRow[] = [
    {
      label: "Overdue Receivables",
      value: Number(data.overdue_amount || 0),
      format: "money",
      context: `${data.overdue_count} invoice(s) past payment due date`,
    },
    {
      label: "1 - 30 Days Overdue",
      value: Number(data.aging?.d0_30 || 0),
      format: "money",
    },
    {
      label: "31 - 60 Days Overdue",
      value: Number(data.aging?.d31_60 || 0),
      format: "money",
    },
    {
      label: "61+ Days Overdue",
      value: Number(data.aging?.d61_up || 0),
      format: "money",
    },
  ];

  const chartData: BarDatum[] = (data.monthly || []).map((m) => ({
    label: m.month,
    value: Number(m.collected || 0),
  }));

  return (
    <div className="space-y-6">
      {/* Date Range Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-2 font-mono uppercase">From</span>
            <DateInput
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[156px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-ink-2 font-mono uppercase">To</span>
            <DateInput
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[156px]"
            />
          </div>

          <Button type="submit" variant="secondary">
            Apply Period
          </Button>

          <div className="flex items-center gap-2 ml-2 text-[12px] text-ink-2">
            <button
              type="button"
              onClick={() => setPreset(30)}
              className="underline hover:text-ink"
            >
              30 Days
            </button>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setPreset(90)}
              className="underline hover:text-ink"
            >
              90 Days
            </button>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setPreset(365)}
              className="underline hover:text-ink"
            >
              Year to Date
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3">
          <Link
            href="/billing-runs"
            className="h-[36px] px-3.5 border border-rule text-ink text-[13px] font-sans font-medium rounded-sm inline-flex items-center hover:bg-canvas-subtle"
          >
            Billing Runs
          </Link>
          <Link
            href="/subscriptions/new"
            className="h-[36px] px-3.5 bg-accent text-accent-ink text-[13px] font-sans font-semibold rounded-sm inline-flex items-center hover:opacity-90"
          >
            New Subscription
          </Link>
        </div>
      </div>

      {/* Top Level Financial KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-rule bg-canvas p-4 space-y-3">
          <h2 className="font-sans text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-rule pb-2">
            Revenue & Subscription Health
          </h2>
          <KpiLedger rows={topKpis} />
        </div>

        <div className="border border-rule bg-canvas p-4 space-y-3">
          <h2 className="font-sans text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-rule pb-2">
            Aging & Overdue Receivables
          </h2>
          <KpiLedger rows={overdueKpis} />
        </div>
      </div>

      {/* Collections Over Time Chart */}
      <div className="border border-rule bg-canvas p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <h2 className="font-sans text-[14px] font-semibold text-ink uppercase tracking-wide">
            12-Month Revenue Collection History
          </h2>
          <span className="font-mono text-[12px] text-ink-2">
            Monthly cash collections (INR)
          </span>
        </div>

        <BarSeries
          data={chartData}
          format="money"
          title="Monthly Collections"
          className="pt-2"
        />
      </div>

      {/* Overdue Invoices Alert Section */}
      <div className="border border-rule bg-canvas p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <div>
            <h2 className="font-sans text-[14px] font-semibold text-ink uppercase tracking-wide">
              Overdue Invoices Action List
            </h2>
            <p className="font-sans text-[12px] text-ink-2">
              Confirmed invoices that have passed their payment term due date.
            </p>
          </div>
          <Link
            href="/invoices?status=confirmed"
            className="font-mono text-[12px] text-accent hover:underline"
          >
            View all confirmed invoices &rarr;
          </Link>
        </div>

        {overdueInvoices.length === 0 ? (
          <p className="font-mono text-[12px] text-ok py-4">
            Zero overdue invoices. All accounts are currently in good standing.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-[13px]">
              <thead>
                <tr className="border-b border-rule text-ink-2 text-[12px]">
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Days Overdue</th>
                  <th className="py-2 text-right">Amount Due</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule font-mono text-[12px]">
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-canvas-subtle">
                    <td className="py-2.5 font-medium">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-ink hover:text-accent underline underline-offset-2"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td className="py-2.5 font-sans">{inv.customer_name || "-"}</td>
                    <td className="py-2.5">
                      <DateText value={inv.due_date} />
                    </td>
                    <td className="py-2.5">
                      <Badge
                        status="overdue"
                        label={`${inv.days_overdue} days`}
                      />
                    </td>
                    <td className="py-2.5 text-right font-medium text-bad">
                      <Money value={inv.amount_due} />
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-accent underline hover:opacity-80 text-[12px]"
                      >
                        Inspect & Pay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
