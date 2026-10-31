"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole, isTeam } from "@/lib/roles";

export async function recordPaymentAction(data: {
  invoiceId: string;
  amount: number;
  method: string;
  paidOn: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const role = await getCurrentUserRole(supabase);

    if (!isTeam(role)) {
      return { ok: false, error: "Only team members can record payments." };
    }

    if (data.amount <= 0) {
      return { ok: false, error: "Payment amount must be greater than zero." };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("payments").insert({
      invoice_id: data.invoiceId,
      amount: data.amount,
      method: data.method,
      paid_on: data.paidOn,
      note: data.note || null,
      recorded_by: user?.id || null,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/payments");
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${data.invoiceId}`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record payment";
    return { ok: false, error: msg };
  }
}

export async function deletePaymentAction(
  paymentId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const role = await getCurrentUserRole(supabase);

    if (role !== "admin") {
      return { ok: false, error: "Only administrators can delete payments." };
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/payments");
    revalidatePath("/invoices");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete payment";
    return { ok: false, error: msg };
  }
}

