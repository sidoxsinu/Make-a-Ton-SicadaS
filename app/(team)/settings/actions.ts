"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveSettingsAction(settings: {
  auto_confirm_invoices: boolean;
  currency: string;
  company_name: string;
}) {
  const supabase = createClient();

  const updates = [
    { key: "auto_confirm_invoices", value: JSON.stringify(settings.auto_confirm_invoices) },
    { key: "currency", value: JSON.stringify(settings.currency) },
    { key: "company_name", value: JSON.stringify(settings.company_name) },
  ];

  for (const u of updates) {
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: u.key, value: JSON.parse(u.value) });

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  revalidatePath("/settings");
  return { ok: true, message: "Settings saved successfully" };
}
