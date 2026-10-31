"use client";

import { createClient } from "@/lib/supabase/browser";

export interface DashboardSummary {
  active_subscriptions: number;
  by_status: Record<string, number>;
  mrr: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  overdue_count: number;
  overdue_amount: number;
  aging: { d0_30: number; d31_60: number; d61_up: number };
  monthly: Array<{ month: string; collected: number }>;
}

function dateLabel(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function fetchDashboard(from: string, to: string) {
  const supabase = createClient();
  const { data: summary, error: summaryError } = await supabase.rpc("dashboard_summary", {
    p_from: from,
    p_to: to,
  });
  if (summaryError) throw new Error(summaryError.message);
  if (!summary) throw new Error("Supabase returned no dashboard summary.");

  const { data: overdueRows, error: overdueError } = await supabase
    .from("v_invoices")
    .select("id, number, customer_id, due_date, days_overdue, amount_due")
    .eq("is_overdue", true)
    .order("days_overdue", { ascending: false })
    .limit(10);
  if (overdueError) throw new Error(overdueError.message);

  const customerIds = Array.from(new Set((overdueRows ?? []).map((row) => row.customer_id)));
  const { data: customers, error: customersError } = customerIds.length
    ? await supabase.from("customers").select("id, name").in("id", customerIds)
    : { data: [], error: null };
  if (customersError) throw new Error(customersError.message);

  const names = new Map((customers ?? []).map((customer) => [customer.id, customer.name]));
  const monthly = new Map(
    (summary as DashboardSummary).monthly.map((item) => [item.month, item.collected])
  );
  const chart = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 11 + index);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { period: month, amount: Number(monthly.get(month) ?? 0) };
  });

  return {
    summary: summary as DashboardSummary,
    overdue: (overdueRows ?? []).map((row) => ({
      id: row.number,
      customerName: names.get(row.customer_id) ?? "",
      dueDate: dateLabel(row.due_date),
      daysOverdue: row.days_overdue,
      amountDue: Number(row.amount_due),
    })),
    aging: [
      { range: "1 to 30 days", amount: Number(summary.aging.d0_30) },
      { range: "31 to 60 days", amount: Number(summary.aging.d31_60) },
      { range: "over 60 days", amount: Number(summary.aging.d61_up) },
    ],
    monthly: chart,
  };
}
