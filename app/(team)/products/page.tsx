import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { productsResource } from "@/lib/resources/products";
import { fetchResourceRows } from "@/lib/resources/fetcher";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = searchParams ? { ...searchParams } : {};
  const result = await fetchResourceRows(productsResource, sp);

  return (
    <TeamShell title="Product & Service Catalog">
      <ResourceList
        resource="products"
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/products"
      />
    </TeamShell>
  );
}

