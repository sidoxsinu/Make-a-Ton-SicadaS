"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

