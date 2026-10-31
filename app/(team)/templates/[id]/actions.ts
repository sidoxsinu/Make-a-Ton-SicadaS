"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface TemplateLineItem {
  id?: string;
  template_id?: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  position?: number;
}

export async function saveTemplateLinesAction(
  templateId: string,
  lines: TemplateLineItem[]
) {
  const supabase = createClient();

  // Delete existing lines
  const { error: delError } = await supabase
    .from("quotation_template_lines")
    .delete()
    .eq("template_id", templateId);

  if (delError) {
    return { ok: false, message: delError.message };
  }

  if (lines.length > 0) {
    const payload = lines.map((l, idx) => ({
      template_id: templateId,
      product_id: l.product_id,
      variant_id: l.variant_id || null,
      quantity: Math.max(1, Number(l.quantity || 1)),
      position: idx,
    }));

    const { error: insError } = await supabase
      .from("quotation_template_lines")
      .insert(payload);

    if (insError) {
      return { ok: false, message: insError.message };
    }
  }

  revalidatePath(`/templates/${templateId}`);
  revalidatePath("/templates");
  return { ok: true, message: "Template lines updated successfully" };
}
