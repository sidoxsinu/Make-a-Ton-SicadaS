import React from "react";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/shell/PortalShell";
import { createClient } from "@/lib/supabase/server";

export default async function PortalGroupShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/portal");
  }

  // Also query customer name if available for nice shell identity
  const { data: customer } = await supabase
    .from("customers")
    .select("name")
    .eq("user_id", user.id)
    .maybeSingle();

  const userDisplayName = customer?.name
    ? `${customer.name} (${user.email})`
    : user.email || "customer@brightloop.local";

  return (
    <PortalShell userEmail={userDisplayName}>
      {children}
    </PortalShell>
  );
}

