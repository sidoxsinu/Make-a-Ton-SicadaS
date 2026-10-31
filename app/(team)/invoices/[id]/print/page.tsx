 "use client";

import React, { useEffect, useState } from 'react';
import { fetchInvoice, fetchOrganizationSettings } from '@/lib/data/queries';

export default function InvoicePrintPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchInvoice>> | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchInvoice(params.id), fetchOrganizationSettings()])
      .then(([invoice, settings]) => {
        setDetail(invoice);
        setCompanyName(settings.companyName);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Invoice could not be loaded.'));
  }, [params.id]);

  if (error) return <p role="alert" className="p-8 text-sm text-red-700">{error}</p>;
  if (!detail) return <p className="p-8 text-sm text-gray-700">Loading invoice...</p>;

  return (
    <div className="min-h-screen bg-transparent text-black p-8 font-['IBM_Plex_Sans',sans-serif] text-[11pt] leading-normal">
      {/* Print Top Bar */}
      <div className="flex justify-between items-start border-b border-black pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider font-mono">{companyName}</h1>
          <p className="text-xs">Subscription Billing Ledger Statement</p>
        </div>
        <div className="text-right font-mono">
          <h2 className="text-lg font-bold">{detail.number}</h2>
          <p className="text-xs">Date: {detail.invoiceDate}</p>
        </div>
      </div>

      {/* Customer & Billing Metadata */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
        <div>
          <p className="font-bold uppercase text-black">Billed to:</p>
          <p className="font-semibold text-sm">{detail.customerName}</p>
          <p className="font-mono">Subscription: {detail.subscriptionNumber}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold uppercase">Billing Period:</span> <span className="font-mono">{detail.billingPeriod}</span></p>
          <p><span className="font-bold uppercase">Payment Terms:</span> {detail.paymentTerms}</p>
          <p><span className="font-bold uppercase">Due Date:</span> <span className="font-mono">{detail.dueDate}</span></p>
        </div>
      </div>

      {/* Lines Table */}
      <div className="mb-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-black font-mono uppercase">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Discount</th>
              <th className="py-2 text-right">Tax</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 font-mono">
            {detail.lines.map((line) => (
              <tr key={line.id}>
                <td className="py-2 font-sans">{line.description}</td>
                <td className="py-2 text-right">{line.quantity}</td>
                <td className="py-2 text-right">₹{line.unitPrice.toFixed(2)}</td>
                <td className="py-2 text-right">₹{line.discount.toFixed(2)}</td>
                <td className="py-2 text-right">₹{line.tax.toFixed(2)}</td>
                <td className="py-2 text-right font-bold">₹{line.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Ledger */}
      <div className="flex justify-end mb-8">
        <div className="w-64 border border-black p-3 text-xs">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span className="font-mono">₹{detail.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Discount:</span>
            <span className="font-mono">-₹{detail.discountTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Tax:</span>
            <span className="font-mono">₹{detail.taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 font-bold border-t border-black pt-1">
            <span>Total:</span>
            <span className="font-mono">₹{detail.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Paid:</span>
            <span className="font-mono">₹{detail.paidTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 font-bold border-t border-black pt-1">
            <span>Amount due:</span>
            <span className="font-mono">₹{detail.amountDue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-black pt-4 text-center text-xs">
        <p>Thank you for your business. Payment terms: {detail.paymentTerms}. Due by {detail.dueDate}.</p>
      </div>
    </div>
  );
}
