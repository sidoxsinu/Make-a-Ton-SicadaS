"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { customerPayInvoiceAction } from "@/app/(portal)/portal/actions";

export interface PortalInvoiceDetail {
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
  subscription?: {
    id: string;
    number: string;
  };
  customer?: {
    name: string;
    email: string;
    address: string | null;
  };
}

export interface PortalInvoiceLine {
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

export interface PortalInvoicePayment {
  id: string;
  amount: number;
  payment_method: string;
  transaction_reference: string | null;
  payment_date: string;
}

export interface PortalInvoiceDetailClientProps {
  invoice: PortalInvoiceDetail;
  lines: PortalInvoiceLine[];
  payments: PortalInvoicePayment[];
}

export function PortalInvoiceDetailClient({
  invoice,
  lines,
  payments,
}: PortalInvoiceDetailClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("credit_card");

  const amountDue = Math.max(0, Number(invoice.total) - Number(invoice.amount_paid));
  const todayStr = new Date().toISOString().split("T")[0];
  const isOverdue = invoice.status === "confirmed" && invoice.due_date < todayStr && amountDue > 0;

  async function handleConfirmPayment() {
    setPaying(true);
    const res = await customerPayInvoiceAction(invoice.id, selectedMethod);
    setPaying(false);

    if (res.success) {
      toast.success(res.message || "Payment processed successfully!");
      setPayDialogOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Payment failed to process.");
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
          {"< Back to My Invoices"}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-mono font-semibold text-ink">
                {invoice.number}
              </h1>
              <Badge status={invoice.status} />
              {isOverdue && (
                <span className="px-1.5 py-0.5 border border-bad text-bad text-[11px] font-mono uppercase rounded-sm">
                  Overdue
                </span>
              )}
            </div>
            {invoice.subscription && (
              <p className="text-[13px] font-sans text-ink-2 mt-1">
                Generated from subscription:{" "}
                <Link
                  href={`/portal/subscriptions/${invoice.subscription.id}`}
                  className="font-mono underline text-ink hover:text-accent font-semibold"
                >
                  {invoice.subscription.number}
                </Link>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {amountDue > 0 && invoice.status !== "cancelled" && (
              <Button
                variant="primary"
                onClick={() => setPayDialogOpen(true)}
              >
                Pay Balance (<Money value={amountDue} />)
              </Button>
            )}
            <Link
              href={`/portal/invoices/${invoice.id}/print`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-sans border border-ink text-ink rounded-sm hover:bg-hover font-semibold"
            >
              Print Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Meta grid */}
      <div className="border border-rule bg-sheet p-5">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px] font-sans">
          <div>
            <dt className="text-ink-2 text-[11px] font-mono uppercase">Invoice Date</dt>
            <dd className="font-semibold text-ink mt-0.5">
              <DateText value={invoice.invoice_date} />
            </dd>
          </div>
          <div>
            <dt className="text-ink-2 text-[11px] font-mono uppercase">Due Date</dt>
            <dd className="font-semibold text-ink mt-0.5">
              <DateText value={invoice.due_date} />
            </dd>
          </div>
          <div>
            <dt className="text-ink-2 text-[11px] font-mono uppercase">Billing Period</dt>
            <dd className="font-semibold text-ink mt-0.5">
              <DateText value={invoice.period_start} /> to <DateText value={invoice.period_end} />
            </dd>
          </div>
          <div>
            <dt className="text-ink-2 text-[11px] font-mono uppercase">Amount Outstanding</dt>
            <dd className="mt-0.5">
              <Money
                value={amountDue}
                className={`text-[15px] font-semibold ${
                  amountDue > 0 ? "text-bad" : "text-ok"
                }`}
              />
            </dd>
          </div>
        </dl>
      </div>

      {/* Invoice Line Items */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-sans font-semibold text-ink uppercase tracking-wide">
          Line Items
        </h2>
        <div className="border border-rule bg-sheet overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px] font-sans">
            <thead>
              <tr className="border-b border-rule bg-paper text-[11px] font-mono uppercase tracking-wider text-ink-2">
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-4 font-semibold text-right">Qty</th>
                <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                <th className="py-2.5 px-4 font-semibold text-right">Gross</th>
                <th className="py-2.5 px-4 font-semibold text-right">Discount</th>
                <th className="py-2.5 px-4 font-semibold text-right">Tax</th>
                <th className="py-2.5 px-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {lines.map((line) => (
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
                  <td className="py-3 px-4 font-mono text-right text-ink">
                    <Money value={line.gross} />
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-ink-2">
                    {Number(line.discount_amount) > 0 ? (
                      <span className="text-ok">-<Money value={line.discount_amount} /></span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-ink-2">
                    {Number(line.tax_amount) > 0 ? (
                      <span><Money value={line.tax_amount} /> ({line.tax_rate}%)</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-right font-semibold text-ink">
                    <Money value={line.line_total} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Financial Totals Ledger */}
      <div className="flex justify-end">
        <div className="w-full md:w-[380px] border border-rule bg-sheet p-4 space-y-2 text-[13px] font-sans">
          <div className="flex justify-between py-1 border-b border-rule text-ink-2">
            <span>Subtotal</span>
            <Money value={invoice.subtotal} />
          </div>
          {Number(invoice.discount_total) > 0 && (
            <div className="flex justify-between py-1 border-b border-rule text-ok">
              <span>Discounts Applied</span>
              <span>-<Money value={invoice.discount_total} /></span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-rule text-ink-2">
            <span>Taxes</span>
            <Money value={invoice.tax_total} />
          </div>
          <div className="flex justify-between py-2 border-b border-ink font-semibold text-[15px] text-ink">
            <span>Total Amount</span>
            <Money value={invoice.total} />
          </div>
          <div className="flex justify-between py-1 text-ink-2">
            <span>Amount Paid</span>
            <Money value={invoice.amount_paid} />
          </div>
          <div className="flex justify-between py-1 font-semibold text-[14px]">
            <span>Balance Due</span>
            <Money
              value={amountDue}
              className={amountDue > 0 ? "text-bad" : "text-ok"}
            />
          </div>
        </div>
      </div>

      {/* Payment Receipts Section */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-sans font-semibold text-ink uppercase tracking-wide">
          Payment Receipts
        </h2>
        {payments.length === 0 ? (
          <div className="border border-rule bg-sheet p-6 text-center text-ink-2 text-[13px] font-sans">
            No payments have been recorded for this invoice.
          </div>
        ) : (
          <div className="border border-rule bg-sheet overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px] font-sans">
              <thead>
                <tr className="border-b border-rule bg-paper text-[11px] font-mono uppercase tracking-wider text-ink-2">
                  <th className="py-2.5 px-4 font-semibold">Receipt Date</th>
                  <th className="py-2.5 px-4 font-semibold">Payment Method</th>
                  <th className="py-2.5 px-4 font-semibold">Transaction Reference</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-hover">
                    <td className="py-3 px-4 font-mono text-ink">
                      <DateText value={p.payment_date} />
                    </td>
                    <td className="py-3 px-4 uppercase text-[12px] font-mono text-ink">
                      {p.payment_method.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-2 text-[12px]">
                      {p.transaction_reference || "-"}
                    </td>
                    <td className="py-3 px-4 font-mono text-right font-semibold text-ok">
                      <Money value={p.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Instant Settlement Dialog */}
      <Dialog
        open={payDialogOpen}
        title={`Settle Invoice ${invoice.number}`}
        confirmLabel={paying ? "Processing..." : `Pay ₹${amountDue.toFixed(2)}`}
        cancelLabel="Cancel"
        variant="primary"
        loading={paying}
        onConfirm={handleConfirmPayment}
        onCancel={() => setPayDialogOpen(false)}
        body={
          <div className="flex flex-col gap-4 text-[13px] font-sans">
            <p className="text-ink-2">
              You are authorizing an instant online payment for invoice{" "}
              <span className="font-mono font-semibold text-ink">
                {invoice.number}
              </span>
              .
            </p>
            <div className="p-3 bg-paper border border-rule rounded-sm flex items-center justify-between">
              <span className="text-ink-2 uppercase font-mono text-[11px]">
                Total Amount Due
              </span>
              <Money
                value={amountDue}
                className="font-mono text-[16px] font-semibold text-bad"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-mono uppercase text-ink-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: "credit_card",
                    label: "Credit / Debit Card (Instant Authorization)",
                  },
                  {
                    id: "upi",
                    label: "UPI Instant Transfer (Virtual Payment Address)",
                  },
                  {
                    id: "bank_transfer",
                    label: "Corporate Net Banking / Wire",
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-2.5 border rounded-sm cursor-pointer transition-colors ${
                      selectedMethod === m.id
                        ? "border-ink bg-selected text-ink font-semibold"
                        : "border-rule bg-sheet text-ink-2 hover:text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={m.id}
                      checked={selectedMethod === m.id}
                      onChange={() => setSelectedMethod(m.id)}
                      className="accent-ink"
                    />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="text-[11px] font-mono text-ink-2">
              Upon confirmation, the database trigger will immediately settle
              the invoice, update the balance to zero, and generate a receipt.
            </p>
          </div>
        }
      />
    </div>
  );
}

