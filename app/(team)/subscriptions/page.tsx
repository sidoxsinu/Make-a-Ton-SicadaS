import React from "react";
import Link from "next/link";
import { TeamShell } from "@/components/shell/TeamShell";
import { Table, Column } from "@/components/ui/Table";
import { Pager } from "@/components/ui/Pager";
import { FilterBar } from "@/components/data/FilterBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DateText } from "@/components/ui/DateText";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";

interface SubscriptionRow {
  id: string;
  number: string;
  status: string;
  start_date: string;
  expiry_date: string;
  next_invoice_date: string | null;
  customer?: { id: string; name: string } | null;
  plan?: { id: string; name: string; billing_period: string } | null;
}

interface PageProps {
  searchParams?: Record<string, string | undefined>;
}

export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const sp = searchParams ? { ...searchParams } : {};
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("subscriptions")
    .select("*, customer:customers(id, name), plan:plans(id, name, billing_period)", {
      count: "exact",
    });

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
  const total = count || 0;

  const columns: Column<SubscriptionRow>[] = [
    { key: "number", label: "Number", sortable: true },
    {
      key: "customer",
      label: "Customer",
      render: (r) => r.customer?.name || "-",
    },
    {
      key: "plan",
      label: "Plan",
      render: (r) => (
        <span>
          {r.plan?.name || "-"}
          <span className="ml-1 text-[11px] font-mono text-ink-2 lowercase">
            ({r.plan?.billing_period})
          </span>
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge status={r.status} />,
    },
    {
      key: "start_date",
      label: "Start Date",
      render: (r) => <DateText value={r.start_date} />,
    },
    {
      key: "expiry_date",
      label: "Expiry Date",
      render: (r) => <DateText value={r.expiry_date} />,
    },
    {
      key: "next_invoice_date",
      label: "Next Invoice",
      render: (r) => (
        <DateText value={r.next_invoice_date} fallback="Nothing due" />
      ),
    },
  ];

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v) params.set(k, v);
    }
    params.set("page", String(p));
    return `/subscriptions?${params.toString()}`;
  }

  return (
    <TeamShell title="Subscriptions">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-3">
          <div>
            <h2 className="text-[18px] font-sans font-semibold text-ink">
              Subscriptions
            </h2>
            <p className="text-[12px] font-sans text-ink-2">
              Total {total.toLocaleString()} {total === 1 ? "subscription" : "subscriptions"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" href="/subscriptions/new">
              New Subscription
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              options: [
                { value: "draft", label: "Draft" },
                { value: "quotation", label: "Quotation" },
                { value: "confirmed", label: "Confirmed" },
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
                { value: "closed", label: "Closed" },
              ],
            },
          ]}
          searchPlaceholder="Search by SUB- number..."
        />

        {/* Table */}
        <Table
          columns={columns}
          rows={(rows as SubscriptionRow[]) || []}
          sort={
            sp.sort
              ? {
                  key: sp.sort,
                  dir: (sp.dir as "asc" | "desc") || "asc",
                }
              : { key: "created_at", dir: "desc" }
          }
          rowHref={(r) => `/subscriptions/${r.id}`}
          empty={
            <EmptyState
              message="No subscriptions match the criteria."
              actionLabel="Create Subscription"
              actionHref="/subscriptions/new"
            />
          }
        />

        {/* Pager */}
        {total > 0 && (
          <Pager
            page={page}
            pageSize={pageSize}
            total={total}
            hrefFor={hrefForPage}
          />
        )}
      </div>
    </TeamShell>
  );
}

