import React from "react";
import { notFound } from "next/navigation";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionDetailClient } from "./SubscriptionDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(
      "*, customer:customers(id, name, email), plan:plans(*), payment_term:payment_terms(*)"
    )
    .eq("id", params.id)
    .single();

  if (!subscription) {
    notFound();
  }

  const [
    { data: lines },
    { data: history },
    { data: invoices },
    { data: products },
    { data: variants },
    { data: taxes },
  ] = await Promise.all([
    supabase
      .from("subscription_lines")
      .select("*")
      .eq("subscription_id", params.id)
      .order("position", { ascending: true }),
    supabase
      .from("subscription_status_history")
      .select("*")
      .eq("subscription_id", params.id)
      .order("changed_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, number, status, invoice_date, due_date, total, amount_paid")
      .eq("subscription_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("id, name, sales_price, default_tax_id")
      .order("name", { ascending: true }),
    supabase
      .from("product_variants")
      .select("id, product_id, attribute, value, extra_price")
      .order("attribute", { ascending: true }),
    supabase
      .from("taxes")
      .select("id, name, rate")
      .eq("active", true),
  ]);

  return (
    <TeamShell title={`Subscription: ${subscription.number}`}>
      <SubscriptionDetailClient
        subscription={subscription}
        initialLines={lines || []}
        history={history || []}
        invoices={invoices || []}
        products={products || []}
        variants={variants || []}
        taxes={taxes || []}
      />
    </TeamShell>
  );
}

