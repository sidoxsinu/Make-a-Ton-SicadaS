import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PortalSubDetailClient,
  PortalSubscription,
  PortalSubscriptionLine,
  PortalStatusHistory,
  PortalInvoice,
} from "./PortalSubDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function PortalSubscriptionDetailPage({ params }: PageProps) {
  const supabase = createClient();

  // 1. Fetch subscription.
  // Note: RLS policy `subs_select` enforces `is_team() or owns_customer(customer_id)`.
  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select(
      `
      id, number, status, start_date, expiry_date, anchor_date, next_invoice_date, quote_valid_until, notes, created_at,
      plan:plans(id, name, billing_period, pausable, closable, renewable),
      payment_term:payment_terms(name, days)
    `
    )
    .eq("id", params.id)
    .maybeSingle();

  if (subError || !sub) {
    notFound();
  }

  // 2. Fetch lines
  const { data: rawLines } = await supabase
    .from("subscription_lines")
    .select("id, description, quantity, unit_price, tax:taxes(name, rate)")
    .eq("subscription_id", params.id)
    .order("position", { ascending: true });

  // 3. Fetch history
  const { data: rawHistory } = await supabase
    .from("subscription_status_history")
    .select("id, from_status, to_status, created_at")
    .eq("subscription_id", params.id)
    .order("created_at", { ascending: true });

  // 4. Fetch invoices for this subscription
  const { data: rawInvoices } = await supabase
    .from("invoices")
    .select("id, number, invoice_date, due_date, total, amount_paid, status")
    .eq("subscription_id", params.id)
    .order("invoice_date", { ascending: false });

  // Type coercions
  const subscription = sub as unknown as PortalSubscription;
  const lines = (rawLines || []) as unknown as PortalSubscriptionLine[];
  const history = (rawHistory || []) as unknown as PortalStatusHistory[];
  const invoices = (rawInvoices || []) as unknown as PortalInvoice[];

  return (
    <PortalSubDetailClient
      subscription={subscription}
      lines={lines}
      history={history}
      invoices={invoices}
    />
  );
}
