import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { customersResource } from "@/lib/resources/customers";
import { fetchResourceRows } from "@/lib/resources/fetcher";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const sp = searchParams ? { ...searchParams } : {};
  const result = await fetchResourceRows(customersResource, sp);

  return (
    <TeamShell title="Customer Directory">
      <ResourceList
        resource="customers"
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/customers"
      />
    </TeamShell>
  );
}

