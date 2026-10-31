'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { Dialog } from '@/components/ui/Dialog';
import { InvoiceStateStepper } from '@/components/invoice/InvoiceStateStepper';
import { InvoiceTotalsLedger } from '@/components/invoice/InvoiceTotalsLedger';
import { createPayment, fetchInvoice, updateInvoiceStatus } from '@/lib/data/queries';
import type { InvoiceStatus } from '@/types/invoice';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchInvoice>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentNote, setPaymentNote] = useState('');

  useEffect(() => {
    fetchInvoice(params.id)
      .then((invoice) => {
        setDetail(invoice);
        setPaymentAmount(String(invoice.amountDue));
      })
      .catch((cause: unknown) => setLoadError(cause instanceof Error ? cause.message : 'Invoice could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading invoice detail...</div>;
  }
  if (loadError) return <p role="alert" className="p-6 text-sm text-[#8c2a2a]">{loadError}</p>;

  if (detail === null) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-bold text-[#2b2b2b]">Invoice not found</h1>
        <p className="text-sm text-[#6e6a5f]">No invoice exists with ID “{params.id}”.</p>
        <Link href="/invoices" className="text-sm text-[#1e4d58] underline">Back to invoices</Link>
      </div>
    );
  }

  const isLinesReadOnly = detail.status !== 'DRAFT';

  const handleStatusChange = async (nextStatus: InvoiceStatus) => {
    try {
      await updateInvoiceStatus(params.id, nextStatus);
      setDetail(await fetchInvoice(params.id));
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Invoice status could not be changed.');
    }
  };

  const handleAddPayment = async () => {
    const amt = Number(paymentAmount);
    if (!Number.isFinite(amt) || amt <= 0 || amt > detail.amountDue) {
      setPaymentError(`Enter an amount greater than 0 and no more than ${detail.amountDue.toFixed(2)}.`);
      return;
    }

    try {
      await createPayment({
        invoiceId: params.id,
        amount: amt,
        date: new Date().toISOString().slice(0, 10),
        method: paymentMethod,
        note: paymentNote,
      });
      setDetail(await fetchInvoice(params.id));
      setPaymentError(null);
      setIsRecordPaymentOpen(false);
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : 'Payment could not be recorded.');
    }
  };

  const handleOpenPayment = () => {
    setPaymentAmount(String(detail.amountDue));
    setPaymentError(null);
    setIsRecordPaymentOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="border-b border-[#d1c9b8] pb-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-[#1e4d58]">{detail.number}</h1>
            <Badge status={detail.status} />
          </div>
          <Link href="/invoices" className="text-xs text-[#1e4d58] underline underline-offset-2">
            Back to invoices
          </Link>
        </div>

        <InvoiceStateStepper currentStatus={detail.status} />
      </div>

      {/* Two Columns: 2 to 1 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6 border-r border-[#d1c9b8] pr-0 lg:pr-6">
          {/* Header Metadata */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-2">
              Invoice details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="block font-semibold uppercase text-[#6e6a5f]">Customer</span>
                <span className="text-[#2b2b2b] font-medium">{detail.customerName}</span>
              </div>
              <div>
                <span className="block font-semibold uppercase text-[#6e6a5f]">Subscription</span>
                <Link
                  href={`/subscriptions/${detail.subscriptionId}`}
                  className="text-[#1e4d58] font-mono font-bold underline"
                >
                  {detail.subscriptionNumber}
                </Link>
              </div>
              <div>
                <span className="block font-semibold uppercase text-[#6e6a5f]">Invoice date</span>
                <span className="font-mono text-[#2b2b2b]">{detail.invoiceDate}</span>
              </div>
              <div>
                <span className="block font-semibold uppercase text-[#6e6a5f]">Due date</span>
                <span className="font-mono text-[#2b2b2b]">{detail.dueDate}</span>
              </div>
              <div>
                <span className="block font-semibold uppercase text-[#6e6a5f]">Payment terms</span>
                <span className="text-[#2b2b2b]">{detail.paymentTerms}</span>
              </div>
              <div>
                <span className="block font-semibold uppercase text-[#6e6a5f]">Billing period</span>
                <span className="font-mono text-[#2b2b2b]">{detail.billingPeriod}</span>
              </div>
            </div>
          </section>

          {/* Lines Table */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-2">
              Invoice lines
            </h2>
            <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                  <tr>
                    <th className="p-2.5 font-sans">Description</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Unit price</th>
                    <th className="p-2.5 text-right">Discount</th>
                    <th className="p-2.5 text-right">Tax</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1c9b8] font-mono">
                  {detail.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-[#f4f1ea]">
                      <td className="p-2.5 font-sans text-[#2b2b2b]">{line.description}</td>
                      <td className="p-2.5 text-right">{line.quantity}</td>
                      <td className="p-2.5 text-right">
                        <Money value={line.unitPrice} />
                      </td>
                      <td className="p-2.5 text-right text-[#6e6a5f]">
                        <Money value={line.discount} />
                      </td>
                      <td className="p-2.5 text-right text-[#6e6a5f]">
                        <Money value={line.tax} />
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#2b2b2b]">
                        <Money value={line.total} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isLinesReadOnly && (
              <p className="text-[11px] font-sans text-[#6e6a5f]">
                Line items are read-only after invoice confirmation.
              </p>
            )}
          </section>

          {/* Payments Table */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-2">
              Payments received
            </h2>
            <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
              {detail.payments.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#6e6a5f] font-mono">
                  No payments recorded yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5 font-sans">Method</th>
                      <th className="p-2.5 font-sans">Note</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d1c9b8] font-mono">
                    {detail.payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-[#f4f1ea]">
                        <td className="p-2.5 text-[#6e6a5f]">{pay.date}</td>
                        <td className="p-2.5 font-sans text-[#2b2b2b]">{pay.method}</td>
                        <td className="p-2.5 font-sans text-[#6e6a5f]">{pay.note}</td>
                        <td className="p-2.5 text-right font-bold text-[#1e5931]">
                          <Money value={pay.amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          <InvoiceTotalsLedger
            subtotal={detail.subtotal}
            discountTotal={detail.discountTotal}
            taxTotal={detail.taxTotal}
            total={detail.total}
            paidTotal={detail.paidTotal}
            amountDue={detail.amountDue}
          />
        </div>
      </div>

      {/* ActionBar */}
      <div className="p-4 bg-[#eee9df] border border-[#d1c9b8] rounded-[2px] flex justify-between items-center">
        <div className="text-xs font-sans text-[#6e6a5f]">
          Status: <span className="font-semibold text-[#2b2b2b]">{detail.status}</span>
        </div>
        <div className="flex gap-2">
          {detail.status === 'DRAFT' && (
            <>
              <Button variant="primary" onClick={() => handleStatusChange('CONFIRMED')}>
                Confirm invoice
              </Button>
              <Button variant="danger" onClick={() => setIsCancelDialogOpen(true)}>
                Cancel
              </Button>
            </>
          )}

          {detail.status !== 'DRAFT' && detail.status !== 'CANCELLED' && (
            <>
              <Button variant="secondary" onClick={() => alert('Statement sent via email.')}>
                Send
              </Button>
              <Link href={`/invoices/${detail.id}/print`} target="_blank">
                <Button variant="secondary">Print</Button>
              </Link>
              {detail.amountDue > 0 && (
                <Button variant="secondary" onClick={handleOpenPayment}>
                  Record payment
                </Button>
              )}
              {detail.amountDue === 0 && detail.status !== 'PAID' && (
                <Button variant="primary" onClick={() => handleStatusChange('PAID')}>
                  Mark paid
                </Button>
              )}
              {detail.status !== 'PAID' && detail.paidTotal === 0 && (
                <Button variant="danger" onClick={() => setIsCancelDialogOpen(true)}>
                  Cancel
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog
        open={isCancelDialogOpen}
        onCancel={() => setIsCancelDialogOpen(false)}
        onConfirm={() => {
          handleStatusChange('CANCELLED');
          setIsCancelDialogOpen(false);
        }}
        title="Cancel invoice"
        body={<p>Are you sure you want to cancel this invoice? This operation cannot be undone.</p>}
        confirmLabel="Confirm cancel"
        cancelLabel="Keep invoice"
      />

      {/* Record Payment Dialog */}
      <Dialog
        open={isRecordPaymentOpen}
        onCancel={() => setIsRecordPaymentOpen(false)}
        onConfirm={handleAddPayment}
        title="Record payment"
        confirmLabel="Save payment"
        variant="primary"
        body={
          <div className="space-y-4 text-xs font-sans">
          <div>
            <label htmlFor="payment-amount" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Amount</label>
            <input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={detail.amountDue}
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono rounded-[2px]"
            />
          </div>
          <div>
            <label htmlFor="payment-method" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Method</label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] rounded-[2px]"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI Payment</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
          <div>
            <label htmlFor="payment-note" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Note</label>
            <input
              id="payment-note"
              type="text"
              placeholder="Reference or note"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] rounded-[2px]"
            />
          </div>
          {paymentError && <p role="alert" className="text-[#a63333]">{paymentError}</p>}
          </div>
        }
      />
    </div>
  );
}
