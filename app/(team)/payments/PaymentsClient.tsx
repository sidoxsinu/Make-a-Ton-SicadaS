"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { Table, Column } from "@/components/ui/Table";
import { Pager } from "@/components/ui/Pager";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  PaymentRecordDrawer,
  InvoiceOption,
} from "./PaymentRecordDrawer";
import { deletePaymentAction } from "./actions";

export interface PaymentRow {
  id: string;
  amount: number;
  method: string;
  paid_on: string;
  note?: string | null;
  created_at: string;
  invoice_id: string;
  invoice_number?: string;
  customer_name?: string;
  recorded_by_name?: string;
}

interface PaymentsClientProps {
  payments: PaymentRow[];
  total: number;
  page: number;
  pageSize: number;
  canDelete: boolean;
  canRecord: boolean;
  unpaidInvoices: InvoiceOption[];
  searchParams?: Record<string, string | undefined>;
}

export function PaymentsClient({
  payments,
  total,
  page,
  pageSize,
  canDelete,
  canRecord,
  unpaidInvoices,
  searchParams = {},
}: PaymentsClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.q || "");
  const [methodFilter, setMethodFilter] = useState(searchParams.method || "");

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (methodFilter) params.set("method", methodFilter);
    params.set("page", "1");
    router.push(`/payments?${params.toString()}`);
  }

  function handleResetFilters() {
    setSearch("");
    setMethodFilter("");
    router.push("/payments");
  }

  function hrefForPage(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) params.set(k, v);
    }
    params.set("page", String(p));
    return `/payments?${params.toString()}`;
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deletePaymentAction(deleteTarget.id);
    setDeleting(false);

    if (!res.ok) {
      toast.error(res.error || "Failed to delete payment");
    } else {
      toast.success("Payment deleted. Invoice balance updated.");
      setDeleteTarget(null);
      router.refresh();
    }
  }

  const columns: Column<PaymentRow>[] = [
    {
      key: "invoice_number",
      label: "Invoice",
      render: (r) => (
        <Link
          href={`/invoices/${r.invoice_id}`}
          className="font-medium text-ink hover:text-accent underline underline-offset-2"
        >
          {r.invoice_number || "Invoice"}
        </Link>
      ),
    },
    {
      key: "customer_name",
      label: "Customer",
      render: (r) => r.customer_name || "-",
    },
    {
      key: "paid_on",
      label: "Payment Date",
      type: "date",
      render: (r) => <DateText value={r.paid_on} />,
    },
    {
      key: "method",
      label: "Method",
      render: (r) => {
        const methodLabels: Record<string, string> = {
          bank_transfer: "Bank Transfer",
          upi: "UPI",
          cash: "Cash",
          card: "Card",
          cheque: "Cheque",
          other: "Other",
        };
        return (
          <Badge
            status="active"
            label={methodLabels[r.method] || r.method.toUpperCase()}
          />
        );
      },
    },
    {
      key: "amount",
      label: "Amount",
      type: "money",
      align: "right",
      render: (r) => <Money value={r.amount} />,
    },
    {
      key: "note",
      label: "Reference / Note",
      render: (r) => r.note || "-",
    },
  ];

  if (canDelete) {
    columns.push({
      key: "actions",
      label: "Actions",
      align: "right",
      render: (r) => (
        <button
          type="button"
          onClick={() => setDeleteTarget(r)}
          className="text-bad underline underline-offset-2 hover:opacity-80 text-[13px]"
        >
          Delete
        </button>
      ),
    });
  }

  return (
    <div className="space-y-4">
      {/* Action / Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-3">
        {/* Search & Filter Form */}
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="text"
            placeholder="Search note or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[36px] px-3 border border-rule bg-canvas text-ink text-[13px] rounded-sm focus:outline-accent"
          />

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-[36px] px-3 border border-rule bg-canvas text-ink text-[13px] rounded-sm focus:outline-accent"
          >
            <option value="">All Payment Methods</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>

          <Button type="submit" variant="secondary">
            Filter
          </Button>

          {(search || methodFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[12px] text-ink-2 underline hover:text-ink"
            >
              Reset
            </button>
          )}
        </form>

        <div className="flex items-center gap-3">
          <a
            href="/api/export/payments"
            download
            className="h-[36px] px-3.5 border border-rule text-ink text-[13px] font-sans font-medium rounded-sm inline-flex items-center hover:bg-canvas-subtle"
          >
            Export CSV
          </a>

          {canRecord && (
            <Button variant="primary" onClick={() => setDrawerOpen(true)}>
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <Table
        columns={columns}
        rows={payments}
        empty={
          <EmptyState
            message="No payments recorded yet."
            actionLabel={canRecord ? "Record First Payment" : undefined}
            onAction={canRecord ? () => setDrawerOpen(true) : undefined}
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

      {/* Record Payment Drawer */}
      <PaymentRecordDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        invoices={unpaidInvoices}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment Record"
        confirmLabel="Confirm Delete"
        variant="danger"
        loading={deleting}
        body={
          <div className="space-y-3">
            <p className="text-[14px] text-ink">
              Are you sure you want to delete this payment of{" "}
              <strong>
                ₹{deleteTarget ? Number(deleteTarget.amount).toFixed(2) : ""}
              </strong>
              ?
            </p>
            <p className="text-[13px] text-bad">
              Warning: The invoice balance will be adjusted upward, and the
              invoice status will revert to Confirmed if it was fully paid.
            </p>
          </div>
        }
      />
    </div>
  );
}
