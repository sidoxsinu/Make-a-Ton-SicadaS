import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PortalInvoiceDetailClient,
  PortalInvoiceDetail,
  PortalInvoiceLine,
  PortalInvoicePayment,
} from "./PortalInvoiceDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function PortalInvoiceDetailPage({ params }: PageProps) {
  const supabase = createClient();

  // 1. Query invoice
  // RLS `inv_select` enforces `is_team() or owns_customer(customer_id)`.
  const { data: inv, error: invError } = await supabase
    .from("invoices")
    .select(`
      id, number, status, invoice_date, due_date, period_start, period_end,
      subtotal, discount_total, tax_total, total, amount_paid,
      subscription:subscriptions(id, number),
      customer:customers(name, email, address)
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (invError || !inv) {
    notFound();
  }

  // 2. Query lines
  const { data: rawLines } = await supabase
    .from("invoice_lines")
    .select("id, description, quantity, unit_price, gross, discount_amount, tax_rate, tax_amount, line_total")
    .eq("invoice_id", params.id)
    .order("position", { ascending: true });

  // 3. Query payments
  const { data: rawPayments } = await supabase
    .from("payments")
    .select("id, amount, payment_method, transaction_reference, payment_date")
    .eq("invoice_id", params.id)
    .order("payment_date", { ascending: false });

  const invoice = inv as unknown as PortalInvoiceDetail;
  const lines = (rawLines || []) as unknown as PortalInvoiceLine[];
  const payments = (rawPayments || []) as unknown as PortalInvoicePayment[];

  return (
    <PortalInvoiceDetailClient
      invoice={invoice}
      lines={lines}
      payments={payments}
    />
  );
}
