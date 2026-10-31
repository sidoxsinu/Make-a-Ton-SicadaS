"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SubscriptionLineInput {
  id?: string;
  subscription_id?: string;
  product_id?: string | null;
  variant_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax_id?: string | null;
  position?: number;
}

export async function createFromTemplateAction(data: {
  templateId: string;
  customerId: string;
  startDate: string;
  expiryDate: string;
  paymentTermId: string;
}) {
  const supabase = createClient();

  const { data: subId, error } = await supabase.rpc(
    "create_subscription_from_template",
    {
      p_template: data.templateId,
      p_customer: data.customerId,
      p_start: data.startDate,
      p_expiry: data.expiryDate,
      p_term: data.paymentTermId,
    }
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/subscriptions");
  return { ok: true, id: subId };
}

export async function createBlankSubscriptionAction(data: {
  customerId: string;
  planId: string;
  startDate: string;
  expiryDate: string;
  paymentTermId: string;
  notes?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "staff") {
    return { ok: false, message: "Forbidden: Only staff and admin can create subscriptions." };
  }

  const adminClient = createAdminClient();
  const { data: sub, error } = await adminClient
    .from("subscriptions")
    .insert({
      customer_id: data.customerId,
      plan_id: data.planId,
      start_date: data.startDate,
      expiry_date: data.expiryDate,
      payment_term_id: data.paymentTermId,
      notes: data.notes || null,
      status: "draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/subscriptions");
  return { ok: true, id: sub.id };
}

export async function transitionSubscriptionAction(
  subscriptionId: string,
  toStatus: string
) {
  const supabase = createClient();

  const { error } = await supabase.rpc("sub_transition", {
    p_id: subscriptionId,
    p_to: toStatus,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/subscriptions/${subscriptionId}`);
  revalidatePath("/subscriptions");
  return { ok: true, message: `Transitioned to ${toStatus}` };
}

export async function renewSubscriptionAction(subscriptionId: string) {
  const supabase = createClient();

  const { error } = await supabase.rpc("sub_renew", {
    p_id: subscriptionId,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/subscriptions/${subscriptionId}`);
  revalidatePath("/subscriptions");
  return { ok: true, message: "Subscription renewed successfully" };
}

export async function billNowAction(subscriptionId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("run_billing", {
    p_sub: subscriptionId,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/subscriptions/${subscriptionId}`);
  revalidatePath("/invoices");
  return { ok: true, message: "Billing run generated", data };
}

export async function saveSubscriptionLinesAction(
  subscriptionId: string,
  lines: SubscriptionLineInput[]
) {
  const supabase = createClient();

  // Delete existing lines
  const { error: delError } = await supabase
    .from("subscription_lines")
    .delete()
    .eq("subscription_id", subscriptionId);

  if (delError) {
    return { ok: false, message: delError.message };
  }

  if (lines.length > 0) {
    const payload = lines.map((l, idx) => ({
      subscription_id: subscriptionId,
      product_id: l.product_id || null,
      variant_id: l.variant_id || null,
      description: l.description.trim(),
      quantity: Math.max(1, Number(l.quantity || 1)),
      unit_price: Number(l.unit_price || 0),
      tax_id: l.tax_id || null,
      position: idx,
    }));

    const { error: insError } = await supabase
      .from("subscription_lines")
      .insert(payload);

    if (insError) {
      return { ok: false, message: insError.message };
    }
  }

  revalidatePath(`/subscriptions/${subscriptionId}`);
  return { ok: true, message: "Lines saved successfully" };
}

