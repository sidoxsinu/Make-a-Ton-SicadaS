"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function confirmInvoiceAction(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "confirmed" })
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  return { ok: true, message: "Invoice confirmed successfully" };
}

export async function confirmDraftInvoicesAction(ids?: string[] | null) {
  const supabase = createClient();

  const { data: count, error } = await supabase.rpc("confirm_draft_invoices", {
    p_ids: ids && ids.length > 0 ? ids : null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/invoices");
  return { ok: true, count, message: `Confirmed ${count} draft invoices` };
}

export async function cancelInvoiceAction(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  return { ok: true, message: "Invoice cancelled" };
}

export async function markZeroInvoicePaidAction(id: string) {
  const supabase = createClient();

  const { error } = await supabase.rpc("mark_zero_invoice_paid", {
    p_id: id,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  return { ok: true, message: "Zero-total invoice marked as paid" };
}

export async function runBillingAction(subscriptionId?: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("run_billing", {
    p_sub: subscriptionId || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/invoices");
  revalidatePath("/billing-runs");
  revalidatePath("/dashboard");
  return { ok: true, data, message: "Billing run completed" };
}
