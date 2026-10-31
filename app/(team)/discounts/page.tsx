import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { discountsResource } from "@/lib/resources/discounts";
import { fetchResourceRows } from "@/lib/resources/fetcher";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/roles";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function DiscountsPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const role = await getCurrentUserRole(supabase);
  const canWrite = role === "admin";

  const sp = searchParams ? { ...searchParams } : {};
  const result = await fetchResourceRows(discountsResource, sp);

  return (
    <TeamShell title="Discounts & Promotions">
      <ResourceList
        resource="discounts"
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        canWrite={canWrite}
        basePath="/discounts"
        hasRowHref={true}
      />
    </TeamShell>
  );
}
