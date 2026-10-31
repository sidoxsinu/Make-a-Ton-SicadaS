"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/roles";

export async function saveDiscountTargetsAction(
  discountId: string,
  scope: "product" | "subscription",
  targetIds: string[]
): Promise<{ error?: string }> {
  try {
    const supabase = createClient();
    const role = await getCurrentUserRole(supabase);
    if (role !== "admin") {
      return { error: "Only administrators can configure discount targets." };
    }

    if (scope === "product") {
      // 1. Delete existing associations
      const { error: delErr } = await supabase
        .from("discount_products")
        .delete()
        .eq("discount_id", discountId);

      if (delErr) {
        return { error: delErr.message };
      }

      // 2. Insert new associations
      if (targetIds.length > 0) {
        const rows = targetIds.map((pid) => ({
          discount_id: discountId,
          product_id: pid,
        }));
        const { error: insErr } = await supabase
          .from("discount_products")
          .insert(rows);

        if (insErr) {
          return { error: insErr.message };
        }
      }
    } else {
      // scope === 'subscription'
      const { error: delErr } = await supabase
        .from("discount_subscriptions")
        .delete()
        .eq("discount_id", discountId);

      if (delErr) {
        return { error: delErr.message };
      }

      if (targetIds.length > 0) {
        const rows = targetIds.map((sid) => ({
          discount_id: discountId,
          subscription_id: sid,
        }));
        const { error: insErr } = await supabase
          .from("discount_subscriptions")
          .insert(rows);

        if (insErr) {
          return { error: insErr.message };
        }
      }
    }

    revalidatePath(`/discounts/${discountId}`);
    revalidatePath("/discounts");
    return {};
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update discount targets";
    return { error: msg };
  }
}
