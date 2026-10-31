import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { NewSubscriptionClient } from "./NewSubscriptionClient";

export default async function NewSubscriptionPage() {
  const supabase = createClient();

  const [
    { data: customers },
    { data: plans },
    { data: templates },
    { data: paymentTerms },
  ] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("plans").select("id, name").eq("active", true).order("name"),
    supabase.from("quotation_templates").select("id, name").eq("active", true).order("name"),
    supabase.from("payment_terms").select("id, name").order("days"),
  ]);

  return (
    <TeamShell title="New Subscription">
      <NewSubscriptionClient
        customers={customers || []}
        plans={plans || []}
        templates={templates || []}
        paymentTerms={paymentTerms || []}
      />
    </TeamShell>
  );
}

