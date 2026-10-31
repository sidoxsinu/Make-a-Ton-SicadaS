import React from "react";
import { TeamShell } from "@/components/shell/TeamShell";
import { ResourceList } from "@/components/data/ResourceList";
import { paymentTermsResource } from "@/lib/resources/paymentTerms";
import { fetchResourceRows } from "@/lib/resources/fetcher";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function PaymentTermsPage({ searchParams }: PageProps) {
  const sp = searchParams ? { ...searchParams } : {};
  const result = await fetchResourceRows(paymentTermsResource, sp);

  return (
    <TeamShell title="Payment Terms">
      <ResourceList
        resource="payment_terms"
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/payment-terms"
      />
    </TeamShell>
  );
}

