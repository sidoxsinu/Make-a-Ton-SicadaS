import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { createClient } from "@/lib/supabase/server";
import { InvoiceListClient, InvoiceRow } from "./InvoiceListClient";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const sp = searchParams ? { ...searchParams } : {};
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("invoices")
    .select(
      "*, customer:customers(id, name), subscription:subscriptions(id, number)",
      { count: "exact" }
    );

  // Filters
  if (sp.status) {
    query = query.eq("status", sp.status);
  }
  if (sp.q?.trim()) {
    query = query.ilike("number", `%${sp.q.trim()}%`);
  }

  // Sorting
  const sortCol = sp.sort || "created_at";
  const sortDir = (sp.dir || "desc") === "asc";
  query = query.order(sortCol, { ascending: sortDir }).range(from, to);

  const { data: rows, count } = await query;

  return (
    <TeamShell title="Invoices">
      <InvoiceListClient
        rows={(rows as InvoiceRow[]) || []}
        total={count || 0}
        page={page}
        pageSize={pageSize}
        searchParams={sp}
      />
    </TeamShell>
  );
}

