import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { templatesResource } from "@/lib/resources/templates";
import { fetchResourceRows } from "@/lib/resources/fetcher";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const sp = searchParams ? { ...searchParams } : {};
  const result = await fetchResourceRows(templatesResource, sp);

  return (
    <TeamShell title="Quotation Templates">
      <ResourceList
        resource="quotation_templates"
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/templates"
      />
    </TeamShell>
  );
}

