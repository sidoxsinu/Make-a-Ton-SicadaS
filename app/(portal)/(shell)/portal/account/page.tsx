import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PortalAccountClient,
  PortalAccountData,
} from "./PortalAccountClient";

export default async function PortalAccountPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch linked customer row for current user
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, email, phone, company, address, tax_number")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerData: PortalAccountData = customer || {
    id: "",
    name: user.user_metadata?.full_name || "",
    email: user.email || "",
    phone: "",
    company: null,
    address: "",
    tax_number: null,
  };

  return (
    <PortalAccountClient
      customer={customerData}
      userEmail={user.email || ""}
    />
  );
}
