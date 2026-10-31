import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { BillingRunsClient } from "./BillingRunsClient";

export default async function BillingRunsPage() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: runs },
    { count: dueCount },
  ] = await Promise.all([
    supabase
      .from("billing_runs")
      .select("*")
      .order("ran_at", { ascending: false })
      .limit(50),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .lte("next_invoice_date", today),
  ]);

  return (
    <TeamShell title="Billing Runs">
      <BillingRunsClient
        runs={runs || []}
        dueCount={dueCount || 0}
      />
    </TeamShell>
  );
}
