"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface VariantItem {
  id?: string;
  product_id?: string;
  attribute: string;
  value: string;
  extra_price: number;
}

export async function saveProductVariantsAction(
  productId: string,
  variants: VariantItem[]
) {
  const supabase = createClient();

  // Delete existing and re-insert
  const { error: delError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (delError) {
    return { ok: false, message: delError.message };
  }

  if (variants.length > 0) {
    const payload = variants.map((v) => ({
      product_id: productId,
      attribute: v.attribute.trim(),
      value: v.value.trim(),
      extra_price: Number(v.extra_price || 0),
    }));

    const { error: insError } = await supabase
      .from("product_variants")
      .insert(payload);

    if (insError) {
      return { ok: false, message: insError.message };
    }
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  return { ok: true, message: "Variants updated successfully" };
}

