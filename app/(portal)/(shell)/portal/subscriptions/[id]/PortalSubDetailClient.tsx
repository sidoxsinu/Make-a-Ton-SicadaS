"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StateStepper } from "@/components/ui/StateStepper";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { customerSubAction } from "@/app/(portal)/portal/actions";

export interface PortalSubscription {
  id: string;
  number: string;
  status: string;
  start_date: string;
  expiry_date: string;
  anchor_date: string;
  next_invoice_date: string | null;
  quote_valid_until: string | null;
  notes: string | null;
  created_at: string;
  plan: {
    id: string;
    name: string;
    billing_period: string;
    pausable: boolean;
    closable: boolean;
    renewable: boolean;
  };
  payment_term?: {
    name: string;
    days: number;
  };
}

export interface PortalSubscriptionLine {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax?: {
    name: string;
    rate: number;
  } | null;
}

export interface PortalStatusHistory {
  id: string;
  from_status: string | null;
  to_status: string;
  created_at: string;
}

export interface PortalInvoice {
  id: string;
  number: string;
  invoice_date: string;
  due_date: string;
  total: number;
  amount_paid: number;
  status: string;
}

export interface PortalSubDetailClientProps {
  subscription: PortalSubscription;
  lines: PortalSubscriptionLine[];
  history: PortalStatusHistory[];
  invoices: PortalInvoice[];
}

export function PortalSubDetailClient({
  subscription,
  lines,
  history,
  invoices,
}: PortalSubDetailClientProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [activeDialog, setActiveDialog] = useState<
    "pause" | "resume" | "close" | "renew" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const plan = subscription.plan;
  const status = subscription.status;

  // Determine allowed actions
  const canPause = status === "active" && plan.pausable;
  const canResume = status === "paused" && plan.pausable;
  const canClose = (status === "active" || status === "paused") && plan.closable;
  const canRenew = (status === "active" || status === "paused") && plan.renewable;

  const steps = ["Draft", "Quotation", "Confirmed", "Active"];
  if (status === "paused") {
    steps.push("Paused");
  } else if (status === "closed") {
    steps.push("Closed");
  }

  async function handleConfirmAction() {
    if (!activeDialog) return;
    setSubmitting(true);
    try {
      const res = await customerSubAction(subscription.id, activeDialog);
      if (res.success) {
        success(`Subscription ${activeDialog} succeeded.`);
        setActiveDialog(null);
        router.refresh();
      } else {
        error(res.error || "Unable to complete action.");
      }
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/portal"
          className="text-[13px] font-sans text-ink underline decoration-1 decoration-rule hover:text-accent inline-block mb-3"
        >
          {"< Back to My Subscriptions"}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-mono font-semibold text-ink">
                {subscription.number}
              </h1>
              <Badge status={subscription.status} />
            </div>
            <p className="text-[13px] font-sans text-ink-2 mt-1">
              Plan: <span className="font-semibold text-ink">{plan.name}</span> ({plan.billing_period})
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3">
            {canPause && (
              <button
                type="button"
                onClick={() => setActiveDialog("pause")}
                className="px-3 py-1.5 text-[13px] font-sans border border-warn text-warn rounded-sm hover:bg-hover"
              >
                Pause Subscription
              </button>
            )}

            {canResume && (
              <button
                type="button"
                onClick={() => setActiveDialog("resume")}
                className="px-3 py-1.5 text-[13px] font-sans bg-accent text-accent-ink rounded-sm hover:opacity-90 font-semibold"
              >
                Resume Subscription
              </button>
            )}

            {canRenew && (
              <button
                type="button"
                onClick={() => setActiveDialog("renew")}
                className="px-3 py-1.5 text-[13px] font-sans border border-ink text-ink rounded-sm hover:bg-hover font-semibold"
              >
                Renew Term
              </button>
            )}

            {canClose && (
              <button
                type="button"
                onClick={() => setActiveDialog("close")}
                className="px-3 py-1.5 text-[13px] font-sans border border-bad text-bad rounded-sm hover:bg-hover"
              >
                Close Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-sheet border border-rule p-4">
        <StateStepper steps={steps} current={status} />
      </div>

      {/* Grid: Details & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Term & Billing Details */}
        <div className="border border-rule bg-sheet p-5 space-y-4">
          <h2 className="text-[14px] font-sans font-semibold uppercase tracking-wide text-ink border-b border-rule pb-2">
            Subscription Schedule
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-[13px] font-sans">
            <div>
              <dt className="text-ink-2 text-[11px] font-mono uppercase">Start Date</dt>
              <dd className="font-semibold text-ink mt-0.5">
                <DateText value={subscription.start_date} />
              </dd>
            </div>
            <div>
              <dt className="text-ink-2 text-[11px] font-mono uppercase">Expiry Date</dt>
              <dd className="font-semibold text-ink mt-0.5">
                <DateText value={subscription.expiry_date} />
              </dd>
            </div>
            <div>
              <dt className="text-ink-2 text-[11px] font-mono uppercase">Next Invoice</dt>
              <dd className="font-semibold text-ink mt-0.5">
                {subscription.next_invoice_date ? (
                  <DateText value={subscription.next_invoice_date} />
                ) : (
                  <span className="font-mono text-ink-2 text-[12px]">None scheduled</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-ink-2 text-[11px] font-mono uppercase">Payment Terms</dt>
              <dd className="font-semibold text-ink mt-0.5">
                {subscription.payment_term?.name || "Due on receipt"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Right: Plan Capabilities */}
        <div className="border border-rule bg-sheet p-5 space-y-4">
          <h2 className="text-[14px] font-sans font-semibold uppercase tracking-wide text-ink border-b border-rule pb-2">
            Plan Entitlements
          </h2>
          <div className="space-y-2 text-[13px] font-sans">
            <div className="flex items-center justify-between py-1 border-b border-rule">
              <span className="text-ink-2">Pausable</span>
              <span className={`font-mono text-[12px] font-semibold ${plan.pausable ? "text-ok" : "text-ink-2"}`}>
                {plan.pausable ? "Allowed" : "Not permitted"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-rule">
              <span className="text-ink-2">Closable Early</span>
              <span className={`font-mono text-[12px] font-semibold ${plan.closable ? "text-ok" : "text-ink-2"}`}>
                {plan.closable ? "Allowed" : "Locked"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-ink-2">Self-Service Renewal</span>
              <span className={`font-mono text-[12px] font-semibold ${plan.renewable ? "text-ok" : "text-ink-2"}`}>
                {plan.renewable ? "Allowed" : "Not permitted"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Line Items */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-sans font-semibold text-ink uppercase tracking-wide">
          Included Products & Services
        </h2>
        <div className="border border-rule bg-sheet overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px] font-sans">
            <thead>
              <tr className="border-b border-rule bg-paper text-[11px] font-mono uppercase tracking-wider text-ink-2">
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-4 font-semibold text-right">Quantity</th>
                <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                <th className="py-2.5 px-4 font-semibold">Tax</th>
                <th className="py-2.5 px-4 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {lines.map((line) => {
                const subtotal = line.quantity * Number(line.unit_price);
                return (
                  <tr key={line.id} className="hover:bg-hover">
                    <td className="py-3 px-4 font-medium text-ink">
                      {line.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-ink">
                      {line.quantity}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-ink">
                      <Money value={line.unit_price} />
                    </td>
                    <td className="py-3 px-4 text-ink-2 text-[12px]">
                      {line.tax?.name ? `${line.tax.name} (${line.tax.rate}%)` : "0%"}
                    </td>
                    <td className="py-3 px-4 font-mono text-right font-semibold text-ink">
                      <Money value={subtotal} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invoices for this subscription */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-sans font-semibold text-ink uppercase tracking-wide">
          Billing Invoices
        </h2>
        {invoices.length === 0 ? (
          <div className="border border-rule bg-sheet p-6 text-center text-ink-2 text-[13px] font-sans">
            No invoices have been billed for this subscription yet.
          </div>
        ) : (
          <div className="border border-rule bg-sheet overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] font-sans">
              <thead>
                <tr className="border-b border-rule bg-paper text-[11px] font-mono uppercase tracking-wider text-ink-2">
                  <th className="py-2.5 px-4 font-semibold">Invoice Number</th>
                  <th className="py-2.5 px-4 font-semibold">Invoice Date</th>
                  <th className="py-2.5 px-4 font-semibold">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount Due</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {invoices.map((inv) => {
                  const due = Math.max(0, Number(inv.total) - Number(inv.amount_paid));
                  return (
                    <tr key={inv.id} className="hover:bg-hover">
                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        <Link
                          href={`/portal/invoices/${inv.id}`}
                          className="underline decoration-1 decoration-rule hover:text-accent"
                        >
                          {inv.number}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <DateText value={inv.invoice_date} />
                      </td>
                      <td className="py-3 px-4">
                        <DateText value={inv.due_date} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Money value={inv.total} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Money value={due} className={due > 0 ? "text-bad font-semibold" : "text-ok"} />
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/portal/invoices/${inv.id}`}
                          className="inline-block px-2.5 py-1 text-[12px] font-sans border border-ink text-ink rounded-sm hover:bg-hover"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Status History */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-sans font-semibold text-ink uppercase tracking-wide">
          Status History
        </h2>
        <div className="border border-rule bg-sheet">
          <ul className="divide-y divide-rule">
            {history.map((h) => (
              <li
                key={h.id}
                className="py-2.5 px-4 flex items-center justify-between text-[13px] font-sans"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-ink-2">
                    {h.from_status ? `${h.from_status} -> ` : "Created: "}
                  </span>
                  <Badge status={h.to_status} />
                </div>
                <DateText value={h.created_at} className="text-ink-2 text-[12px]" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Confirmation Dialogs */}
      <Dialog
        open={activeDialog === "pause"}
        title="Pause Subscription"
        body={
          <p className="text-[13px] font-sans text-ink">
            Are you sure you want to pause subscription{" "}
            <span className="font-mono font-semibold">{subscription.number}</span>?
            Recurring billing and invoice generation will be halted until resumed.
          </p>
        }
        confirmLabel="Pause Subscription"
        cancelLabel="Keep Active"
        variant="danger"
        loading={submitting}
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveDialog(null)}
      />

      <Dialog
        open={activeDialog === "resume"}
        title="Resume Subscription"
        body={
          <p className="text-[13px] font-sans text-ink">
            Are you sure you want to resume subscription{" "}
            <span className="font-mono font-semibold">{subscription.number}</span>?
            Billing cycles will be restarted from today.
          </p>
        }
        confirmLabel="Resume Subscription"
        cancelLabel="Cancel"
        variant="primary"
        loading={submitting}
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveDialog(null)}
      />

      <Dialog
        open={activeDialog === "renew"}
        title="Renew Subscription"
        body={
          <p className="text-[13px] font-sans text-ink">
            Are you sure you want to renew subscription{" "}
            <span className="font-mono font-semibold">{subscription.number}</span>?
            The expiry date will be extended by another term.
          </p>
        }
        confirmLabel="Renew Term"
        cancelLabel="Cancel"
        variant="primary"
        loading={submitting}
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveDialog(null)}
      />

      <Dialog
        open={activeDialog === "close"}
        title="Close Subscription"
        body={
          <p className="text-[13px] font-sans text-ink">
            Are you sure you want to close subscription{" "}
            <span className="font-mono font-semibold">{subscription.number}</span>?
            This will mark the subscription closed and stop all future invoicing.
          </p>
        }
        confirmLabel="Close Subscription"
        cancelLabel="Keep Open"
        variant="danger"
        loading={submitting}
        onConfirm={handleConfirmAction}
        onCancel={() => setActiveDialog(null)}
      />
    </div>
  );
}
