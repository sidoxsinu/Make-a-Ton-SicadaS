import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import {
  DashboardClient,
  DashboardData,
  OverdueInvoiceItem,
} from "./DashboardClient";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = `${today.slice(0, 7)}-01`;

  const sp = searchParams ? { ...searchParams } : {};
  const fromDate = sp.from || firstOfMonth;
  const toDate = sp.to || today;

  // 1. Call dashboard_summary RPC
  const { data: rawSummary } = await supabase.rpc("dashboard_summary", {
    p_from: fromDate,
    p_to: toDate,
  });

  const summaryData: DashboardData = (rawSummary as unknown as DashboardData) || {
    active_subscriptions: 0,
    by_status: {},
    mrr: 0,
    invoiced: 0,
    collected: 0,
    outstanding: 0,
    overdue_count: 0,
    overdue_amount: 0,
    aging: { d0_30: 0, d31_60: 0, d61_up: 0 },
    monthly: [],
  };

  // 2. Query overdue invoices for the alert table
  const { data: rawOverdue } = await supabase
    .from("invoices")
    .select("id, number, due_date, total, amount_paid, customer:customers(name)")
    .eq("status", "confirmed")
    .lt("due_date", today)
    .order("due_date", { ascending: true })
    .limit(20);

  const overdueInvoices: OverdueInvoiceItem[] = (rawOverdue || []).map(
    (inv: any) => {
      const due = new Date(inv.due_date).getTime();
      const now = new Date(today).getTime();
      const days = Math.max(0, Math.round((now - due) / (1000 * 60 * 60 * 24)));
      const amountDue = Number(inv.total) - Number(inv.amount_paid);

      return {
        id: inv.id,
        number: inv.number,
        customer_name: inv.customer?.name,
        due_date: inv.due_date,
        days_overdue: days,
        amount_due: amountDue,
      };
    }
  );

  return (
    <TeamShell title="Executive Revenue & Subscriptions Dashboard">
      <DashboardClient
        data={summaryData}
        overdueInvoices={overdueInvoices}
        fromDate={fromDate}
        toDate={toDate}
      />
    </TeamShell>
  );
}

