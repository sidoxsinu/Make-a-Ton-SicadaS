import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { plansResource } from "@/lib/resources/plans";
import { fetchResourceRows } from "@/lib/resources/fetcher";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function PlansPage({ searchParams }: PageProps) {
  const result = await fetchResourceRows(plansResource, searchParams);

  return (
    <TeamShell title="Subscription Plans">
      <ResourceList
        resource="plans"
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/plans"
        searchParams={searchParams}
      />
    </TeamShell>
  );
}

