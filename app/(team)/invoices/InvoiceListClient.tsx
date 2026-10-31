"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Table, Column } from "@/components/ui/Table";
import { Pager } from "@/components/ui/Pager";
import { FilterBar } from "@/components/data/FilterBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DateText } from "@/components/ui/DateText";
import { Money } from "@/components/ui/Money";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { confirmDraftInvoicesAction, runBillingAction } from "./actions";

export interface InvoiceRow {
  id: string;
  number: string;
  status: string;
  invoice_date: string;
  due_date: string;
  total: number;
  amount_paid: number;
  customer?: { id: string; name: string } | null;
  subscription?: { id: string; number: string } | null;
}

export interface InvoiceListClientProps {
  rows: InvoiceRow[];
  total: number;
  page: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}

export function InvoiceListClient({
  rows,
  total,
  page,
  pageSize,
  searchParams,
}: InvoiceListClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const columns: Column<InvoiceRow>[] = [
    {
      key: "selection",
      label: "",
      width: "40px",
      render: (r) => {
        if (r.status !== "draft") return null;
        const isSelected = selectedIds.includes(r.id);
        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedIds((prev) =>
                e.target.checked
                  ? [...prev, r.id]
                  : prev.filter((id) => id !== r.id)
              );
            }}
            className="cursor-pointer"
          />
        );
      },
    },
    { key: "number", label: "Invoice Number", sortable: true },
    {
      key: "customer",
      label: "Customer",
      render: (r) => r.customer?.name || "-",
    },
    {
      key: "subscription",
      label: "Subscription",
      render: (r) => (
        <span className="font-mono text-[12px]">
          {r.subscription?.number || "-"}
        </span>
      ),
    },
    {
      key: "invoice_date",
      label: "Invoice Date",
      render: (r) => <DateText value={r.invoice_date} />,
    },
    {
      key: "due_date",
      label: "Due Date",
      render: (r) => <DateText value={r.due_date} />,
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (r) => <Money value={r.total} />,
    },
    {
      key: "amount_paid",
      label: "Paid",
      align: "right",
      render: (r) => <Money value={r.amount_paid} />,
    },
    {
      key: "amount_due",
      label: "Due",
      align: "right",
      render: (r) => {
        const due = Number(r.total || 0) - Number(r.amount_paid || 0);
        return <Money value={due} />;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        const isOverdue =
          r.status === "confirmed" && r.due_date < today && r.amount_paid < r.total;
        if (isOverdue) {
          return <Badge status="overdue" label="Overdue" />;
        }
        return <Badge status={r.status} />;
      },
    },
  ];

  async function handleConfirmSelected() {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    const res = await confirmDraftInvoicesAction(selectedIds);
    setActionLoading(false);
    setSelectedIds([]);

    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  async function handleConfirmAllDrafts() {
    setActionLoading(true);
    const res = await confirmDraftInvoicesAction(null);
    setActionLoading(false);

    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  async function handleRunBilling() {
    setActionLoading(true);
    const res = await runBillingAction();
    setActionLoading(false);

    if (res.ok) {
      toast.success(res.message);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  }

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    params.set("page", String(p));
    return `/invoices?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-3">
        <div>
          <h2 className="text-[18px] font-sans font-semibold text-ink">
            Invoices
          </h2>
          <p className="text-[12px] font-sans text-ink-2">
            Total {total.toLocaleString()} {total === 1 ? "invoice" : "invoices"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleConfirmSelected}
              loading={actionLoading}
            >
              Confirm Selected ({selectedIds.length})
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={handleConfirmAllDrafts}
            disabled={actionLoading}
          >
            Confirm All Drafts
          </Button>

          <Button
            variant="primary"
            onClick={handleRunBilling}
            loading={actionLoading}
          >
            Run Daily Billing
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
              { value: "confirmed", label: "Confirmed" },
              { value: "paid", label: "Paid" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
        ]}
        searchPlaceholder="Search by invoice number (INV-)..."
      />

      {/* Invoices Table */}
      <Table
        columns={columns}
        rows={rows}
        sort={
          searchParams.sort
            ? {
                key: searchParams.sort,
                dir: (searchParams.dir as "asc" | "desc") || "asc",
              }
            : { key: "created_at", dir: "desc" }
        }
        rowHref={(r) => `/invoices/${r.id}`}
        empty={
          <EmptyState
            message="No invoices found matching criteria."
            actionLabel="Run Billing Now"
            onAction={handleRunBilling}
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
  );
}

