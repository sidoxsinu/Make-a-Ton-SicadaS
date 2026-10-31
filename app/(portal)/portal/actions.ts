"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Customer Self-Service Subscription Action (pause, resume, close, renew)
 * Handled via PostgreSQL security definer RPC customer_sub_action(p_id, p_action)
 */
export async function customerSubAction(
  subscriptionId: string,
  action: "pause" | "resume" | "close" | "renew"
): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { error } = await supabase.rpc("customer_sub_action", {
    p_id: subscriptionId,
    p_action: action,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/portal");
  revalidatePath(`/portal/subscriptions/${subscriptionId}`);
  return { success: true };
}

/**
 * Customer Self-Service Account Details Update (name, phone, address)
 * Handled via PostgreSQL security definer RPC update_my_details(p_name, p_phone, p_address)
 */
export async function updateCustomerDetailsAction(
  name: string,
  phone: string,
  address: string
): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const cleanName = name.trim();
  if (!cleanName) {
    return { success: false, error: "Name is required." };
  }

  const { error } = await supabase.rpc("update_my_details", {
    p_name: cleanName,
    p_phone: phone?.trim() || null,
    p_address: address?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/portal/account");
  return { success: true, message: "Account details updated successfully." };
}

/**
 * Customer Password Reset Request from Portal Account page
 */
export async function requestPortalResetPasswordAction(): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Authentication required." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "A password reset link has been dispatched to your email address.",
  };
}

/**
 * Customer Self-Service Online Settlement for Invoices
 * Applies payment via admin client, triggering database trg_payment_apply
 */
export async function customerPayInvoiceAction(
  invoiceId: string,
  method: string = "credit_card"
): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // 1. Fetch invoice and ensure existence
  const { data: inv, error: invErr } = await supabase
    .from("invoices")
    .select("id, number, total, amount_paid, status, customer_id")
    .eq("id", invoiceId)
    .single();

  if (invErr || !inv) {
    return { success: false, error: "Invoice not found or access denied." };
  }

  // 2. Verify current user owns this customer entity
  const { data: cust, error: custErr } = await supabase
    .from("customers")
    .select("id")
    .eq("id", inv.customer_id)
    .eq("user_id", user.id)
    .single();

  if (custErr || !cust) {
    return {
      success: false,
      error: "Unauthorized: You do not own this invoice.",
    };
  }

  const amountDue = Math.max(0, Number(inv.total) - Number(inv.amount_paid));
  if (amountDue <= 0 || inv.status === "paid") {
    return { success: false, error: "This invoice is already fully settled." };
  }

  // 3. Record payment via admin client (triggers trg_payment_apply in PostgreSQL)
  const adminClient = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { error: payErr } = await adminClient.from("payments").insert({
    invoice_id: invoiceId,
    amount: amountDue,
    method: method,
    paid_on: today,
    note: `Customer self-service online settlement (${method})`,
    recorded_by: user.id,
  });

  if (payErr) {
    return { success: false, error: payErr.message };
  }

  revalidatePath("/portal");
  revalidatePath(`/portal/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);

  return {
    success: true,
    message: `Payment of ₹${amountDue.toFixed(
      2
    )} processed successfully. Invoice is now marked PAID!`,
  };
}

