import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole, isTeam } from "@/lib/roles";
import { PaymentsClient, PaymentRow } from "./PaymentsClient";
import { InvoiceOption } from "./PaymentRecordDrawer";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const role = await getCurrentUserRole(supabase);
  const canDelete = role === "admin";
  const canRecord = isTeam(role);

  const sp = searchParams ? { ...searchParams } : {};
  const page = parseInt(sp.page || "1", 10);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Build query for payments
  let query = supabase
    .from("payments")
    .select(
      "id, amount, method, paid_on, note, created_at, invoice_id, invoice:invoices(number, customer:customers(name))",
      { count: "exact" }
    )
    .order("paid_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (sp.method) {
    query = query.eq("method", sp.method);
  }
  if (sp.q) {
    query = query.ilike("note", `%${sp.q}%`);
  }

  const { data: rawPayments, count } = await query.range(from, to);

  const payments: PaymentRow[] = (rawPayments || []).map((p: any) => ({
    id: p.id,
    amount: Number(p.amount),
    method: p.method,
    paid_on: p.paid_on,
    note: p.note,
    created_at: p.created_at,
    invoice_id: p.invoice_id,
    invoice_number: p.invoice?.number,
    customer_name: p.invoice?.customer?.name,
  }));

  // Fetch confirmed unpaid invoices for payment drawer
  const { data: rawInvoices } = await supabase
    .from("invoices")
    .select("id, number, total, amount_paid, customer:customers(name)")
    .eq("status", "confirmed")
    .order("invoice_date", { ascending: false })
    .limit(100);

  const unpaidInvoices: InvoiceOption[] = (rawInvoices || [])
    .filter((inv: any) => Number(inv.total) > Number(inv.amount_paid))
    .map((inv: any) => ({
      id: inv.id,
      number: inv.number,
      customer_name: inv.customer?.name,
      total: Number(inv.total),
      amount_paid: Number(inv.amount_paid),
    }));

  return (
    <TeamShell title="Payments Ledger">
      <PaymentsClient
        payments={payments}
        total={count || 0}
        page={page}
        pageSize={pageSize}
        canDelete={canDelete}
        canRecord={canRecord}
        unpaidInvoices={unpaidInvoices}
        searchParams={sp}
      />
    </TeamShell>
  );
}

