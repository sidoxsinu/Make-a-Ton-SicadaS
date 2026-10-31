import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { taxesResource } from "@/lib/resources/taxes";
import { fetchResourceRows } from "@/lib/resources/fetcher";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function TaxesPage({ searchParams }: PageProps) {
  const result = await fetchResourceRows(taxesResource, searchParams);

  return (
    <TeamShell title="Taxes & Rates">
      <ResourceList
        resource={taxesResource}
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/taxes"
        searchParams={searchParams}
      />
    </TeamShell>
  );
}

