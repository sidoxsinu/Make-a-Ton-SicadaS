'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { Dialog } from '@/components/ui/Dialog';
import { StateStepper } from '@/components/subscription/StateStepper';
import { TotalsLedger } from '@/components/subscription/TotalsLedger';
import { mockSubscriptionDetail } from '@/lib/data/subscriptionDetail';
import type { SubscriptionStatus } from '@/types/subscription';
import type {
  SubscriptionDetail,
  SubscriptionLineItem,
} from '@/types/subscriptionDetail';

export default function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const [detail, setDetail] = useState<SubscriptionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [lines, setLines] = useState<SubscriptionLineItem[]>([]);

  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const subscription =
        params.id === mockSubscriptionDetail.id ? mockSubscriptionDetail : null;
      setDetail(subscription);
      if (subscription) {
        setCustomerName(subscription.customerName);
        setPlanName(subscription.planName);
        setStartDate('2026-01-15');
        setExpiryDate('2027-01-14');
        setPaymentTerms(subscription.paymentTerms);
        setLines(subscription.lines);
      }
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [params.id]);

  if (isLoading) {
    return <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading subscription detail...</div>;
  }

  if (detail === null) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[#6e6a5f]">Subscription not found.</p>
        <Link href="/subscriptions" className="text-xs text-[#1e4d58] underline underline-offset-2">
          Back to subscriptions
        </Link>
      </div>
    );
  }

  const isEditable = detail.status === 'DRAFT' || detail.status === 'QUOTATION';

  const updateQuantity = (id: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, quantity } : line))
    );
  };

  const addLine = () => {
    const newLine: SubscriptionLineItem = {
      id: `line-${Date.now()}`,
      productId: 'prod-new',
      productName: 'Custom Module',
      variant: 'Standard',
      description: 'Additional service subscription unit',
      quantity: 5,
      unitPrice: 1000.00,
      taxPercent: 18,
      minQuantity: 5,
    };
    setLines((prev) => [...prev, newLine]);
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleStateChange = (nextStatus: SubscriptionStatus, isPausedState = false) => {
    const timestamp = '31 Oct 2026, 12:00 PM';
    const newHistoryEvent = {
      id: `hist-${Date.now()}`,
      event: `Status changed to ${nextStatus}`,
      user: 'admin@brightloop.test',
      timestamp,
    };

    setDetail((prev) => {
      if (prev === null) return null;
      return {
        ...prev,
        status: nextStatus,
        isPaused: isPausedState,
        history: [newHistoryEvent, ...prev.history],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="border-b border-[#d1c9b8] pb-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-[#1e4d58]">{detail.number}</h1>
            <Badge status={detail.status} />
            {detail.isPaused && <Badge status="PAUSED" />}
          </div>
          <Link href="/subscriptions" className="text-xs text-[#1e4d58] underline underline-offset-2">
            Back to subscriptions
          </Link>
        </div>

        <StateStepper currentStatus={detail.status} />
      </div>

      {/* Two Columns: 2 to 1 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6 border-r border-[#d1c9b8] pr-0 lg:pr-6">
          {/* Details Form Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-2">
              Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Customer</label>
                <input
                  type="text"
                  disabled={isEditable === false}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] disabled:opacity-75 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Plan</label>
                <input
                  type="text"
                  disabled={isEditable === false}
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] disabled:opacity-75 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Start Date</label>
                <input
                  type="date"
                  disabled={isEditable === false}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] disabled:opacity-75"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Expiry Date</label>
                <input
                  type="date"
                  disabled={isEditable === false}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] disabled:opacity-75"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Payment Terms</label>
                <input
                  type="text"
                  disabled={isEditable === false}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] disabled:opacity-75 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* LineItemsEditor Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-2">
              <h2 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider">Lines</h2>
              {isEditable && (
                <Button variant="secondary" onClick={addLine}>
                  Add line
                </Button>
              )}
            </div>

            <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                  <tr>
                    <th className="p-2.5 font-sans">Product</th>
                    <th className="p-2.5 font-sans">Variant</th>
                    <th className="p-2.5 font-sans">Description</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Unit price</th>
                    <th className="p-2.5 text-right">Tax</th>
                    <th className="p-2.5 text-right">Amount</th>
                    {isEditable && <th className="p-2.5 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1c9b8] font-mono">
                  {lines.map((line) => {
                    const minQty = line.minQuantity ?? 5;
                    const isBelowMin = line.quantity < minQty;
                    const lineAmount = line.quantity * line.unitPrice;

                    return (
                      <tr key={line.id} className="hover:bg-[#f4f1ea]">
                        <td className="p-2.5 font-sans text-[#2b2b2b]">{line.productName}</td>
                        <td className="p-2.5 font-sans text-[#6e6a5f]">{line.variant}</td>
                        <td className="p-2.5 font-sans text-[#6e6a5f]">{line.description}</td>
                        <td className="p-2.5 text-right">
                          {isEditable ? (
                            <div className="flex flex-col items-end">
                              <input
                                type="number"
                                value={line.quantity}
                                onChange={(e) => updateQuantity(line.id, parseInt(e.target.value, 10) || 0)}
                                className="w-16 px-1.5 py-1 text-right bg-[#f4f1ea] border border-[#a8a090] font-mono rounded-[2px]"
                              />
                              {isBelowMin && (
                                <span className="text-[10px] text-[#8c2a2a] font-sans mt-0.5">
                                  Minimum quantity for this plan is {minQty}.
                                </span>
                              )}
                            </div>
                          ) : (
                            <span>{line.quantity}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right">
                          <Money value={line.unitPrice} />
                        </td>
                        <td className="p-2.5 text-right">{line.taxPercent}%</td>
                        <td className="p-2.5 text-right font-bold text-[#2b2b2b]">
                          <Money value={lineAmount} />
                        </td>
                        {isEditable && (
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => removeLine(line.id)}
                              className="text-xs text-[#8c2a2a] underline hover:text-[#a83a3a]"
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Totals Ledger */}
          <TotalsLedger lines={lines} />

          {/* Invoices Table */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-1">
              Invoices
            </h3>
            <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                  <tr>
                    <th className="p-2">Number</th>
                    <th className="p-2">Date</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1c9b8] font-mono">
                  {detail.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#f4f1ea]">
                      <td className="p-2">
                        <Link href="/invoices" className="text-[#1e4d58] underline font-bold">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="p-2 text-[#6e6a5f]">{inv.date}</td>
                      <td className="p-2 text-right">
                        <Money value={inv.total} />
                      </td>
                      <td className="p-2 text-center">
                        <span className="px-1.5 py-0.5 text-[10px] border border-[#3d7a5a] text-[#1e5931] bg-[#d4f0dc]">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* History List */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-1">
              History
            </h3>
            <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] p-3 space-y-3">
              {detail.history.map((hist) => (
                <div key={hist.id} className="text-xs space-y-0.5 border-b border-[#d1c9b8] last:border-b-0 pb-2 last:pb-0">
                  <div className="font-semibold text-[#2b2b2b] font-sans">{hist.event}</div>
                  <div className="text-[11px] font-mono text-[#6e6a5f]">
                    {hist.user} &bull; {hist.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* State-Driven Action Bar */}
      <div className="p-4 bg-[#eee9df] border border-[#d1c9b8] rounded-[2px] flex justify-between items-center">
        <div className="text-xs font-sans text-[#6e6a5f]">
          Current state: <span className="font-semibold text-[#2b2b2b]">{detail.status}</span>
        </div>
        <div className="flex gap-2">
          {detail.status === 'DRAFT' && (
            <>
              <Button variant="primary" onClick={() => handleStateChange('QUOTATION')}>
                Send for quotation
              </Button>
              <Button variant="danger" onClick={() => setIsCloseDialogOpen(true)}>
                Close
              </Button>
            </>
          )}

          {detail.status === 'QUOTATION' && (
            <>
              <Button variant="primary" onClick={() => handleStateChange('CONFIRMED')}>
                Confirm
              </Button>
              <Button variant="secondary" onClick={() => handleStateChange('DRAFT')}>
                Back to draft
              </Button>
              <Button variant="danger" onClick={() => setIsCloseDialogOpen(true)}>
                Close
              </Button>
            </>
          )}

          {detail.status === 'CONFIRMED' && (
            <>
              <Button variant="primary" onClick={() => handleStateChange('ACTIVE')}>
                Activate
              </Button>
              <Button variant="danger" onClick={() => setIsCloseDialogOpen(true)}>
                Close
              </Button>
            </>
          )}

          {detail.status === 'ACTIVE' && (
            <>
              {detail.allowPause && (
                <Button variant="secondary" onClick={() => handleStateChange('PAUSED', true)}>
                  Pause
                </Button>
              )}
              {detail.allowRenew && (
                <Button variant="secondary" onClick={() => handleStateChange('ACTIVE')}>
                  Renew
                </Button>
              )}
              {detail.allowBillNow && (
                <Button variant="secondary" onClick={() => alert('Billing executed.')}>
                  Bill now
                </Button>
              )}
              <Button variant="danger" onClick={() => setIsCloseDialogOpen(true)}>
                Close
              </Button>
            </>
          )}

          {detail.status === 'PAUSED' && (
            <>
              <Button variant="primary" onClick={() => handleStateChange('ACTIVE', false)}>
                Resume
              </Button>
              <Button variant="danger" onClick={() => setIsCloseDialogOpen(true)}>
                Close
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Close Action Confirmation Dialog */}
      <Dialog
        open={isCloseDialogOpen}
        title="Close Subscription"
        body="Are you sure you want to close this subscription? This action will mark it as CLOSED."
        confirmLabel="Confirm close"
        onConfirm={() => {
          handleStateChange('CLOSED');
          setIsCloseDialogOpen(false);
        }}
        onCancel={() => setIsCloseDialogOpen(false)}
      />
    </div>
  );
}
