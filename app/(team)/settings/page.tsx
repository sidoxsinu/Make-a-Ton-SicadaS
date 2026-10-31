import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = createClient();

  const { data: settings } = await supabase.from("app_settings").select("*");

  function getVal(key: string, defaultVal: any) {
    const item = settings?.find((s) => s.key === key);
    if (!item) return defaultVal;
    return typeof item.value === "string" ? item.value : item.value;
  }

  const initialSettings = {
    auto_confirm_invoices: Boolean(getVal("auto_confirm_invoices", false)),
    currency: String(getVal("currency", "INR")).replace(/"/g, ""),
    company_name: String(getVal("company_name", "Brightloop Software")).replace(/"/g, ""),
  };

  return (
    <TeamShell title="Settings">
      <SettingsClient initialSettings={initialSettings} canWrite={true} />
    </TeamShell>
  );
}
