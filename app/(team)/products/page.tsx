import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { productsResource } from "@/lib/resources/products";
import { fetchResourceRows } from "@/lib/resources/fetcher";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const result = await fetchResourceRows(productsResource, searchParams);

  return (
    <TeamShell title="Product & Service Catalog">
      <ResourceList
        resource={productsResource}
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/products"
        searchParams={searchParams}
      />
    </TeamShell>
  );
}

