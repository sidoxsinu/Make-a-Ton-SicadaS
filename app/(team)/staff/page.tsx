import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { StaffClient } from "./StaffClient";

export default async function StaffPage() {
  const supabase = createClient();

  // Fetch all staff and admin profiles
  const { data: staffMembers } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .in("role", ["admin", "staff"])
    .order("created_at", { ascending: true });

  return (
    <TeamShell title="Staff & Roles">
      <StaffClient initialStaff={staffMembers || []} />
    </TeamShell>
  );
}
