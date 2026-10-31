import React from "react";
import { notFound } from "next/navigation";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDetailClient } from "./InvoiceDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customer:customers(*), subscription:subscriptions(id, number)")
    .eq("id", params.id)
    .single();

  if (!invoice) {
    notFound();
  }

  const [
    { data: lines },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from("invoice_lines")
      .select("*")
      .eq("invoice_id", params.id)
      .order("position", { ascending: true }),
    supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", params.id)
      .order("paid_on", { ascending: false }),
  ]);

  return (
    <TeamShell title={`Invoice: ${invoice.number}`}>
      <InvoiceDetailClient
        invoice={invoice}
        lines={lines || []}
        payments={payments || []}
      />
    </TeamShell>
  );
}
