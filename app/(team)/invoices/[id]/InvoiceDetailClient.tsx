"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StateStepper } from "@/components/data/StateStepper";
import { Badge } from "@/components/ui/Badge";
import { DateText } from "@/components/ui/DateText";
import { Money } from "@/components/ui/Money";
import { Table, Column } from "@/components/ui/Table";
import { ActionBar, ActionItem } from "@/components/data/ActionBar";
import { TotalsLedger } from "@/components/data/TotalsLedger";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import {
  confirmInvoiceAction,
  cancelInvoiceAction,
  markZeroInvoicePaidAction,
} from "../actions";

interface InvoiceLineRow {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  gross: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

interface PaymentRow {
  id: string;
  method: string;
  amount: number;
  paid_on: string;
  note: string | null;
  recorded_by?: { full_name: string } | null;
}

interface InvoiceDetailData {
  id: string;
  number: string;
  status: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  amount_paid: number;
  sent_at: string | null;
  customer?: { id: string; name: string; email: string; company?: string | null } | null;
  subscription?: { id: string; number: string } | null;
}

export interface InvoiceDetailClientProps {
  invoice: InvoiceDetailData;
  lines: InvoiceLineRow[];
  payments: PaymentRow[];
}

const INVOICE_STEPS = ["Draft", "Confirmed", "Paid"];

export function InvoiceDetailClient({
  invoice,
  lines,
  payments,
}: InvoiceDetailClientProps) {
  const toast = useToast();
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const status = invoice.status;
  const today = new Date().toISOString().split("T")[0];
  const isOverdue =
    status === "confirmed" && invoice.due_date < today && invoice.amount_paid < invoice.total;
  const isCancelled = status === "cancelled";

  const lineColumns: Column<InvoiceLineRow>[] = [
    { key: "description", label: "Description" },
    { key: "quantity", label: "Qty", align: "right" },
    {
      key: "unit_price",
      label: "Unit Price",
      align: "right",
      render: (r) => <Money value={r.unit_price} />,
    },
    {
      key: "discount_amount",
      label: "Discount",
      align: "right",
      render: (r) =>
        r.discount_amount > 0 ? (
          <span className="text-warn font-mono">
            -<Money value={r.discount_amount} />
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "tax_amount",
      label: "Tax",
      align: "right",
      render: (r) => (
        <span>
          <Money value={r.tax_amount} />
          <span className="ml-1 text-[11px] font-mono text-ink-2">
            ({Number(r.tax_rate)}%)
          </span>
        </span>
      ),
    },
    {
      key: "line_total",
      label: "Total",
      align: "right",
      render: (r) => <Money value={r.line_total} className="font-semibold" />,
    },
  ];

  const paymentColumns: Column<PaymentRow>[] = [
    {
      key: "paid_on",
      label: "Date",
      render: (r) => <DateText value={r.paid_on} />,
    },
    { key: "method", label: "Method", render: (r) => <span className="font-mono uppercase">{r.method}</span> },
    {
      key: "amount",
      label: "Amount Received",
      align: "right",
      render: (r) => <Money value={r.amount} className="font-semibold text-ok" />,
    },
    { key: "note", label: "Note", render: (r) => r.note || "-" },
  ];

  async function handleConfirm() {
    setActionLoading(true);
    const res = await confirmInvoiceAction(invoice.id);
    setActionLoading(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    const res = await cancelInvoiceAction(invoice.id);
    setActionLoading(false);
    setCancelDialogOpen(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleSendEmail() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: status === "draft" }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to send invoice email");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkZeroPaid() {
    setActionLoading(true);
    const res = await markZeroInvoicePaidAction(invoice.id);
    setActionLoading(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  // Construct Action Bar items by state
  const actions: ActionItem[] = [];

  if (status === "draft") {
    actions.push(
      {
        label: "Confirm Invoice",
        variant: "primary",
        onClick: handleConfirm,
        disabled: actionLoading,
      },
      {
        label: "Send via Email",
        variant: "secondary",
        onClick: handleSendEmail,
        disabled: actionLoading,
      },
      {
        label: "Cancel Invoice",
        variant: "danger",
        onClick: () => setCancelDialogOpen(true),
        disabled: actionLoading,
      }
    );
  } else if (status === "confirmed") {
    actions.push({
      label: "Send via Email",
      variant: "secondary",
      onClick: handleSendEmail,
      disabled: actionLoading,
    });
    if (invoice.total === 0) {
      actions.push({
        label: "Mark Zero-Total Paid",
        variant: "primary",
        onClick: handleMarkZeroPaid,
        disabled: actionLoading,
      });
    }
    if (invoice.amount_paid === 0) {
      actions.push({
        label: "Cancel Invoice",
        variant: "danger",
        onClick: () => setCancelDialogOpen(true),
        disabled: actionLoading,
      });
    }
  } else if (status === "paid") {
    actions.push({
      label: "Send Receipt Email",
      variant: "secondary",
      onClick: handleSendEmail,
      disabled: actionLoading,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="text-[13px] font-sans text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Invoices
          </Link>
          <span className="text-rule">/</span>
          <h2 className="text-[18px] font-mono font-semibold text-ink">
            {invoice.number}
          </h2>
          <Badge status={status} />
          {isOverdue && <Badge status="overdue" label="Overdue" />}
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            href={`/invoices/${invoice.id}/print`}
          >
            Print Invoice
          </Button>
          {!isCancelled && (
            <StateStepper steps={INVOICE_STEPS} current={status} />
          )}
        </div>
      </div>

      {/* Action Bar */}
      {actions.length > 0 && <ActionBar actions={actions} />}

      {/* 2-Column Split: Left (2 cols) Lines & Details, Right (1 col) Totals & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Metadata Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-sheet border border-rule rounded-sm text-[13px] font-sans">
            <div>
              <span className="text-ink-2 text-[12px] block">Customer:</span>
              <span className="font-semibold text-ink">
                {invoice.customer?.name}
              </span>
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Subscription:</span>
              <Link
                href={`/subscriptions/${invoice.subscription?.id}`}
                className="font-mono text-ink underline hover:text-accent"
              >
                {invoice.subscription?.number}
              </Link>
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Invoice Date:</span>
              <DateText value={invoice.invoice_date} />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Due Date:</span>
              <DateText value={invoice.due_date} />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Period Start:</span>
              <DateText value={invoice.period_start} />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Period End:</span>
              <DateText value={invoice.period_end} />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Email Sent At:</span>
              <DateText value={invoice.sent_at} fallback="Not sent yet" />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Status:</span>
              <span className="font-mono uppercase font-semibold text-ink">
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Lines Table */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[14px] font-sans font-semibold text-ink">
              Invoice Line Items
            </h3>
            <Table columns={lineColumns} rows={lines} />
          </div>

          {/* Payments Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[14px] font-sans font-semibold text-ink">
              Recorded Payments ({payments.length})
            </h3>
            <Table
              columns={paymentColumns}
              rows={payments}
              empty={<div className="p-3 text-[13px] text-ink-2">No payments recorded against this invoice yet.</div>}
            />
          </div>
        </div>

        {/* Right Column: Financial Totals Ledger */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-[14px] font-sans font-semibold text-ink pb-2">
              Payment Summary
            </h3>
            <TotalsLedger
              subtotal={invoice.subtotal}
              discountTotal={invoice.discount_total}
              taxTotal={invoice.tax_total}
              total={invoice.total}
              amountPaid={invoice.amount_paid}
              amountDue={invoice.total - invoice.amount_paid}
            />
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        title="Cancel Invoice"
        body={`Are you sure you want to cancel invoice ${invoice.number}? This will invalidate this billing period bill.`}
        confirmLabel="Cancel Invoice"
        cancelLabel="Keep Invoice"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </div>
  );
}
