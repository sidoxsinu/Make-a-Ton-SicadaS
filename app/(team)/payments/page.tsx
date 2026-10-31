'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { useToast } from '@/components/ui/Toast';
import { RecordPaymentDrawer } from '@/components/payment/RecordPaymentDrawer';
import { createPayment, fetchPayments } from '@/lib/data/queries';
import type { PaymentItem, UnpaidInvoice, PaymentMethod } from '@/types/payment';

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const searchParamsKey = searchParams?.toString() ?? '';
  const params = useMemo(() => new URLSearchParams(searchParamsKey), [searchParamsKey]);

  const initialMethod = params.get('method') || '';
  const initialCustomer = params.get('customer') || '';
  const initialFromDate = params.get('fromDate') || '';
  const initialToDate = params.get('toDate') || '';
  const parsedPage = Number.parseInt(params.get('page') || '1', 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [methodFilter, setMethodFilter] = useState(initialMethod);
  const [customerQuery, setCustomerQuery] = useState(initialCustomer);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchPayments()
      .then((result) => {
        setPayments(result.payments);
        setUnpaidInvoices(result.unpaidInvoices);
      })
      .catch((cause: unknown) => setLoadError(cause instanceof Error ? cause.message : 'Payments could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setMethodFilter(params.get('method') || '');
    setCustomerQuery(params.get('customer') || '');
    setFromDate(params.get('fromDate') || '');
    setToDate(params.get('toDate') || '');
    const page = Number.parseInt(params.get('page') || '1', 10);
    setCurrentPage(Number.isFinite(page) && page > 0 ? page : 1);
  }, [params]);

  const updateUrlParams = (newParams: Record<string, string | number>) => {
    const nextParams = new URLSearchParams(params.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== '' && !(key === 'page' && value === 1)) {
        nextParams.set(key, String(value));
      } else {
        nextParams.delete(key);
      }
    });
    const query = nextParams.toString();
    router.push(query ? `/payments?${query}` : '/payments');
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setMethodFilter(val);
    setCurrentPage(1);
    updateUrlParams({ method: val, page: 1 });
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerQuery(val);
    setCurrentPage(1);
    updateUrlParams({ customer: val, page: 1 });
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromDate(val);
    setCurrentPage(1);
    updateUrlParams({ fromDate: val, page: 1 });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setToDate(val);
    setCurrentPage(1);
    updateUrlParams({ toDate: val, page: 1 });
  };

  const clearFilters = () => {
    setMethodFilter('');
    setCustomerQuery('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    router.push('/payments');
  };

  const filteredPayments = useMemo(() => {
    const toIsoDate = (value: string) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return '';
      return [
        parsed.getFullYear(),
        String(parsed.getMonth() + 1).padStart(2, '0'),
        String(parsed.getDate()).padStart(2, '0'),
      ].join('-');
    };

    return payments.filter((item) => {
      if (methodFilter && item.method !== methodFilter) return false;
      if (customerQuery && !item.customerName.toLowerCase().includes(customerQuery.toLowerCase())) return false;
      const paymentDate = toIsoDate(item.date);
      if (fromDate && (!paymentDate || paymentDate < fromDate)) return false;
      if (toDate && (!paymentDate || paymentDate > toDate)) return false;
      return true;
    });
  }, [payments, methodFilter, customerQuery, fromDate, toDate]);

  const pageSize = 25;
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const currentRows = filteredPayments.slice(pageStart, pageEnd);

  const handleSavePayment = async (newPay: {
    invoiceId: string;
    invoiceNumber: string;
    customerName: string;
    method: PaymentMethod;
    amount: number;
    date: string;
    note: string;
  }) => {
    const invoice = unpaidInvoices.find((item) => item.id === newPay.invoiceId);
    if (!invoice || !Number.isFinite(newPay.amount) || newPay.amount <= 0 || newPay.amount > invoice.amountDue) {
      toast.error('Payment could not be recorded. Check that the invoice still has a balance and the amount is valid.');
      return;
    }

    try {
      await createPayment(newPay);
      const refreshed = await fetchPayments();
      setPayments(refreshed.payments);
      setUnpaidInvoices(refreshed.unpaidInvoices);
      toast.success('Payment recorded.');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Payment could not be recorded.');
    }
  };

  const hasActiveFilters = Boolean(methodFilter || customerQuery || fromDate || toDate);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Payments</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Collection history and ledger transactions.</p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            Record payment
          </Button>
        </div>
      </div>

      {/* Single Row Filters */}
      <div className="bg-[#f9f7f2] border border-[#d1c9b8] p-3 rounded-[2px] flex flex-wrap items-center gap-4 text-xs font-sans">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#2b2b2b] uppercase">Method</label>
          <select
            value={methodFilter}
            onChange={handleMethodChange}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
          >
            <option value="">All methods</option>
            <option value="Bank transfer">Bank transfer</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#2b2b2b] uppercase">Customer</label>
          <input
            type="text"
            placeholder="Search customer..."
            value={customerQuery}
            onChange={handleCustomerChange}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#2b2b2b] uppercase">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] font-mono rounded-[2px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#2b2b2b] uppercase">To</label>
          <input
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] font-mono rounded-[2px]"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#2b2b2b] underline underline-offset-2 hover:bg-[#e8e2d4] px-2 py-1 rounded-[2px]"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table / States */}
      {loadError ? (
        <p role="alert" className="text-sm text-[#8c2a2a]">{loadError}</p>
      ) : isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading payments...</div>
      ) : totalItems === 0 ? (
        <div className="p-12 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] text-center space-y-4">
          <p className="text-sm font-sans text-[#6e6a5f]">
            {hasActiveFilters ? 'No payments match these filters.' : 'No payments recorded yet.'}
          </p>
          {hasActiveFilters && (
            <div>
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-[#2b2b2b] underline underline-offset-4 hover:bg-[#e8e2d4] px-3 py-1.5 rounded-[2px]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Invoice</th>
                  <th className="p-2.5 font-sans">Customer</th>
                  <th className="p-2.5 font-sans">Method</th>
                  <th className="p-2.5 text-right">Amount</th>
                  <th className="p-2.5 font-sans">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1c9b8] font-mono">
                {currentRows.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#f4f1ea]">
                    <td className="p-2.5 text-[#6e6a5f]">{pay.date}</td>
                    <td className="p-2.5">
                      <Link href={`/invoices/${pay.invoiceId}`} className="text-[#1e4d58] font-bold underline">
                        {pay.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-2.5 font-sans text-[#2b2b2b]">{pay.customerName}</td>
                    <td className="p-2.5 font-sans text-[#2b2b2b]">{pay.method}</td>
                    <td className="p-2.5 text-right font-bold text-[#1e5931]">
                      <Money value={pay.amount} />
                    </td>
                    <td className="p-2.5 font-sans text-[#6e6a5f]">{pay.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pager */}
          <div className="flex justify-between items-center text-xs font-mono text-[#6e6a5f] pt-2">
            <div>
              Showing {pageStart + 1} to {pageEnd} of {totalItems}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={visiblePage === 1}
                onClick={() => {
                  const page = Math.max(visiblePage - 1, 1);
                  setCurrentPage(page);
                  updateUrlParams({ page });
                }}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={visiblePage === totalPages}
                onClick={() => {
                  const page = Math.min(visiblePage + 1, totalPages);
                  setCurrentPage(page);
                  updateUrlParams({ page });
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Drawer */}
      <RecordPaymentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        unpaidInvoices={unpaidInvoices}
        onSave={handleSavePayment}
      />

    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading payments page...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
