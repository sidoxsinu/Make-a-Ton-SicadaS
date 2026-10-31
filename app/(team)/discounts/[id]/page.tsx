import React from "react";
import { notFound } from "next/navigation";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/roles";
import { DiscountDetailClient } from "./DiscountDetailClient";

interface PageProps {
  params: { id: string };
}

export default async function DiscountDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const role = await getCurrentUserRole(supabase);
  const canEdit = role === "admin";

  const { data: discount } = await supabase
    .from("discounts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!discount) {
    notFound();
  }

  // Fetch targets and options
  let targetProductIds: string[] = [];
  let allProducts: Array<{ id: string; name: string; sales_price: number }> = [];
  let targetSubscriptionIds: string[] = [];
  let allSubscriptions: Array<{
    id: string;
    customer_name?: string;
    plan_name?: string;
    status: string;
    next_invoice_date?: string | null;
  }> = [];

  if (discount.scope === "product") {
    const { data: dProds } = await supabase
      .from("discount_products")
      .select("product_id")
      .eq("discount_id", discount.id);
    targetProductIds = (dProds || []).map((p) => p.product_id);

    const { data: prods } = await supabase
      .from("products")
      .select("id, name, sales_price")
      .eq("active", true)
      .order("name");
    allProducts = prods || [];
  } else {
    const { data: dSubs } = await supabase
      .from("discount_subscriptions")
      .select("subscription_id")
      .eq("discount_id", discount.id);
    targetSubscriptionIds = (dSubs || []).map((s) => s.subscription_id);

    const { data: subs } = await supabase
      .from("subscriptions")
      .select("id, status, next_invoice_date, customer:customers(name), plan:plans(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    allSubscriptions = (subs || []).map((s: any) => ({
      id: s.id,
      customer_name: s.customer?.name,
      plan_name: s.plan?.name,
      status: s.status,
      next_invoice_date: s.next_invoice_date,
    }));
  }

  // Fetch recent invoices that used this discount
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, invoice_date, total, status")
    .eq("discount_id", discount.id)
    .order("invoice_date", { ascending: false })
    .limit(10);

  return (
    <TeamShell title={`Discount: ${discount.name}`}>
      <DiscountDetailClient
        discount={discount}
        targetProductIds={targetProductIds}
        targetSubscriptionIds={targetSubscriptionIds}
        allProducts={allProducts}
        allSubscriptions={allSubscriptions}
        recentInvoices={invoices || []}
        canEdit={canEdit}
      />
    </TeamShell>
  );
}
