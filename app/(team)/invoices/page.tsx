'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { fetchInvoices, updateInvoiceStatuses } from '@/lib/data/queries';
import type { InvoiceItem } from '@/types/invoice';

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams?.toString() ?? '';
  const params = useMemo(() => new URLSearchParams(searchParamsKey), [searchParamsKey]);

  const initialStatus = params.get('status') || '';
  const initialOverdueOnly = params.get('overdue') === '1';
  const initialCustomer = params.get('customer') || '';
  const initialFromDate = params.get('fromDate') || '';
  const initialToDate = params.get('toDate') || '';
  const parsedPage = Number.parseInt(params.get('page') || '1', 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [overdueOnly, setOverdueOnly] = useState(initialOverdueOnly);
  const [customerQuery, setCustomerQuery] = useState(initialCustomer);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [data, setData] = useState<InvoiceItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices()
      .then(setData)
      .catch((cause: unknown) => setLoadError(cause instanceof Error ? cause.message : 'Invoices could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setStatusFilter(params.get('status') || '');
    setOverdueOnly(params.get('overdue') === '1');
    setCustomerQuery(params.get('customer') || '');
    setFromDate(params.get('fromDate') || '');
    setToDate(params.get('toDate') || '');
    const page = Number.parseInt(params.get('page') || '1', 10);
    setCurrentPage(Number.isFinite(page) && page > 0 ? page : 1);
  }, [params]);

  const updateUrlParams = (newParams: Record<string, string | number | boolean>) => {
    const nextParams = new URLSearchParams(params.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === true) {
        nextParams.set(key, '1');
      } else if (value !== '' && value !== false && !(key === 'page' && value === 1)) {
        nextParams.set(key, String(value));
      } else {
        nextParams.delete(key);
      }
    });
    const query = nextParams.toString();
    router.push(query ? `/invoices?${query}` : '/invoices');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatusFilter(val);
    setCurrentPage(1);
    updateUrlParams({ status: val, page: 1 });
  };

  const handleOverdueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setOverdueOnly(checked);
    setCurrentPage(1);
    updateUrlParams({ overdue: checked, page: 1 });
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
    setStatusFilter('');
    setOverdueOnly(false);
    setCustomerQuery('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
    router.push('/invoices');
  };

  const filteredData = useMemo(() => {
    const toIsoDate = (value: string) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return '';
      return [
        parsed.getFullYear(),
        String(parsed.getMonth() + 1).padStart(2, '0'),
        String(parsed.getDate()).padStart(2, '0'),
      ].join('-');
    };

    return data.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (overdueOnly && item.status !== 'OVERDUE') return false;
      if (customerQuery && !item.customerName.toLowerCase().includes(customerQuery.toLowerCase())) return false;
      const invoiceDate = toIsoDate(item.invoiceDate);
      if (fromDate && (!invoiceDate || invoiceDate < fromDate)) return false;
      if (toDate && (!invoiceDate || invoiceDate > toDate)) return false;
      return true;
    });
  }, [data, statusFilter, overdueOnly, customerQuery, fromDate, toDate]);

  const pageSize = 25;
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const currentRows = filteredData.slice(pageStart, pageEnd);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentRows.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleConfirmSelected = async () => {
    try {
      await updateInvoiceStatuses(selectedIds, 'confirmed');
      setData(await fetchInvoices());
      setSelectedIds([]);
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Invoices could not be confirmed.');
    }
  };

  const handleConfirmAllDrafts = async () => {
    try {
      await updateInvoiceStatuses(null, 'confirmed');
      setData(await fetchInvoices());
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Draft invoices could not be confirmed.');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Number', 'Customer', 'Subscription', 'Invoice date', 'Due date', 'Total', 'Paid', 'Due', 'Status'];
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = filteredData.map((inv) => [
      inv.number,
      escapeCsv(inv.customerName),
      inv.subscriptionNumber,
      inv.invoiceDate,
      inv.dueDate,
      inv.total,
      inv.paid,
      inv.due,
      inv.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'invoices_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = Boolean(statusFilter || overdueOnly || customerQuery || fromDate || toDate);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Invoices</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Billing statements and payment collections.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            disabled={selectedIds.length === 0}
            onClick={handleConfirmSelected}
          >
            Confirm selected
          </Button>
          <Button variant="secondary" onClick={handleConfirmAllDrafts}>
            Confirm all drafts
          </Button>
          <Button variant="secondary" onClick={handleExportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Single Row Filters */}
      <div className="bg-[#f9f7f2] border border-[#d1c9b8] p-3 rounded-[2px] flex flex-wrap items-center gap-4 text-xs font-sans">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#2b2b2b] uppercase">Status</label>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="overdueOnly"
            checked={overdueOnly}
            onChange={handleOverdueChange}
            className="accent-[#1e4d58]"
          />
          <label htmlFor="overdueOnly" className="font-semibold text-[#2b2b2b] uppercase cursor-pointer">
            Overdue only
          </label>
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
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading invoices...</div>
      ) : totalItems === 0 ? (
        <div className="p-12 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] text-center space-y-4">
          <p className="text-sm font-sans text-[#6e6a5f]">
            {hasActiveFilters
              ? 'No invoices match these filters.'
              : 'No invoices yet. Invoices are created when a subscription is billed.'}
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
                  <th className="p-2.5 w-8 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === currentRows.length && currentRows.length > 0}
                      className="accent-[#1e4d58]"
                    />
                  </th>
                  <th className="p-2.5">Number</th>
                  <th className="p-2.5 font-sans">Customer</th>
                  <th className="p-2.5 font-sans">Subscription</th>
                  <th className="p-2.5">Invoice date</th>
                  <th className="p-2.5">Due date</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-right">Paid</th>
                  <th className="p-2.5 text-right">Due</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1c9b8] font-mono">
                {currentRows.map((inv) => {
                  const isSelected = selectedIds.includes(inv.id);
                  const isOverdue = inv.status === 'OVERDUE';

                  return (
                    <tr key={inv.id} className={`hover:bg-[#f4f1ea] ${isSelected ? 'bg-[#e2dbce]' : ''}`}>
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(inv.id)}
                          className="accent-[#1e4d58]"
                        />
                      </td>
                      <td className="p-2.5">
                        <Link href={`/invoices/${inv.id}`} className="text-[#1e4d58] font-bold underline">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="p-2.5 font-sans text-[#2b2b2b]">{inv.customerName}</td>
                      <td className="p-2.5 font-sans text-[#6e6a5f]">{inv.subscriptionNumber}</td>
                      <td className="p-2.5 text-[#6e6a5f]">{inv.invoiceDate}</td>
                      <td className="p-2.5 text-[#6e6a5f]">
                        {inv.dueDate}
                        {isOverdue && inv.daysOverdue && (
                          <span className="ml-1.5 text-[11px] text-[#8c2a2a] font-bold font-sans">
                            ({inv.daysOverdue} days overdue)
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#2b2b2b]">
                        <Money value={inv.total} />
                      </td>
                      <td className="p-2.5 text-right text-[#6e6a5f]">
                        <Money value={inv.paid} />
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#8c2a2a]">
                        <Money value={inv.due} />
                      </td>
                      <td className="p-2.5">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading invoices page...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}
