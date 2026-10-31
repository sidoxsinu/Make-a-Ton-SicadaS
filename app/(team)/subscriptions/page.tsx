'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { createSubscription, fetchSubscriptionOptions, fetchSubscriptions } from '@/lib/data/queries';
import {
  NewSubscriptionDrawer,
  type NewSubscriptionInput,
} from '@/components/subscription/NewSubscriptionDrawer';

function SubscriptionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams?.toString() ?? '';
  const params = useMemo(() => new URLSearchParams(searchParamsKey), [searchParamsKey]);

  // Read initial states from URL parameters
  const initialStatus = params.get('status') || '';
  const initialPlan = params.get('plan') || '';
  const initialCustomer = params.get('customer') || '';
  const initialExpiringDays = params.get('expiringDays') || '';
  const parsedPage = Number.parseInt(params.get('page') || '1', 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [planFilter, setPlanFilter] = useState(initialPlan);
  const [customerQuery, setCustomerQuery] = useState(initialCustomer);
  const [expiringDays, setExpiringDays] = useState(initialExpiringDays);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [data, setData] = useState<Awaited<ReturnType<typeof fetchSubscriptions>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [options, setOptions] = useState<Awaited<ReturnType<typeof fetchSubscriptionOptions>>>({
    customers: [],
    plans: [],
    terms: [],
  });

  useEffect(() => {
    Promise.all([fetchSubscriptions(), fetchSubscriptionOptions()])
      .then(([subscriptions, subscriptionOptions]) => {
        setData(subscriptions);
        setOptions(subscriptionOptions);
      })
      .catch((cause: unknown) => setLoadError(cause instanceof Error ? cause.message : 'Subscriptions could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setStatusFilter(params.get('status') || '');
    setPlanFilter(params.get('plan') || '');
    setCustomerQuery(params.get('customer') || '');
    setExpiringDays(params.get('expiringDays') || '');
    const page = Number.parseInt(params.get('page') || '1', 10);
    setCurrentPage(Number.isFinite(page) && page > 0 ? page : 1);
  }, [params]);

  // Sync state changes to URL
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
    router.push(query ? `/subscriptions?${query}` : '/subscriptions');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatusFilter(val);
    setCurrentPage(1);
    updateUrlParams({ status: val, page: 1 });
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPlanFilter(val);
    setCurrentPage(1);
    updateUrlParams({ plan: val, page: 1 });
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerQuery(val);
    setCurrentPage(1);
    updateUrlParams({ customer: val, page: 1 });
  };

  const handleExpiringDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setExpiringDays(val);
    setCurrentPage(1);
    updateUrlParams({ expiringDays: val, page: 1 });
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPlanFilter('');
    setCustomerQuery('');
    setExpiringDays('');
    setCurrentPage(1);
    router.push('/subscriptions');
  };

  // Filter computation
  const filteredData = useMemo(() => {
    const referenceDate = new Date();
    referenceDate.setHours(0, 0, 0, 0);

    return data.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false;
      if (planFilter && item.planName !== planFilter) return false;
      if (
        customerQuery &&
        !item.customerName.toLowerCase().includes(customerQuery.toLowerCase())
      ) return false;
      if (expiringDays) {
        const days = parseInt(expiringDays, 10);
        if (Number.isFinite(days) && days >= 0) {
          const expDate = new Date(item.expiryDate);
          expDate.setHours(0, 0, 0, 0);
          const diffTime = expDate.getTime() - referenceDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays < 0 || diffDays > days) return false;
        }
      }
      return true;
    });
  }, [data, statusFilter, planFilter, customerQuery, expiringDays]);

  // Pagination logic (pageSize = 25)
  const pageSize = 25;
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const currentRows = filteredData.slice(pageStart, pageEnd);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      updateUrlParams({ page: newPage });
    }
  };

  const handleExportCsv = () => {
    const headers = ['Number', 'Customer', 'Plan', 'Status', 'Start', 'Expiry', 'Next invoice'];
    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;
    const rows = filteredData.map((s) => [
      s.number,
      escapeCsv(s.customerName),
      escapeCsv(s.planName),
      s.status,
      s.startDate,
      s.expiryDate,
      s.nextInvoiceDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'subscriptions_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateSubscription = async (newSub: NewSubscriptionInput) => {
    try {
      await createSubscription(newSub);
      setData(await fetchSubscriptions());
      setIsDrawerOpen(false);
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'Subscription could not be created.');
    }
  };

  const hasActiveFilters = Boolean(statusFilter || planFilter || customerQuery || expiringDays);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Subscriptions</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Manage customer recurring plans and draft billing.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            New subscription
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
            <option value="QUOTATION">QUOTATION</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-[#2b2b2b] uppercase">Plan</label>
          <select
            value={planFilter}
            onChange={handlePlanChange}
            className="px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
          >
            <option value="">All plans</option>
            {options.plans.map((plan) => <option key={plan.id} value={plan.name}>{plan.name}</option>)}
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
          <label className="font-semibold text-[#2b2b2b] uppercase">Expiring within (days)</label>
          <input
            type="number"
            placeholder="Days"
            value={expiringDays}
            onChange={handleExpiringDaysChange}
            className="w-20 px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] font-mono rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
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

      {/* Main Table / States */}
      {loadError ? (
        <p role="alert" className="text-sm text-[#8c2a2a]">{loadError}</p>
      ) : isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading subscriptions...</div>
      ) : totalItems === 0 ? (
        <div className="p-12 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] text-center space-y-4">
          <p className="text-sm font-sans text-[#6e6a5f]">
            {hasActiveFilters ? 'No subscriptions match these filters.' : 'No subscriptions yet. Create a subscription.'}
          </p>
          <div>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-[#2b2b2b] underline underline-offset-4 hover:bg-[#e8e2d4] px-3 py-1.5 rounded-[2px]"
              >
                Clear filters
              </button>
            ) : (
              <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
                New subscription
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                <tr>
                  <th className="p-2.5">Number</th>
                  <th className="p-2.5 font-sans">Customer</th>
                  <th className="p-2.5 font-sans">Plan</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Start</th>
                  <th className="p-2.5">Expiry</th>
                  <th className="p-2.5">Next invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1c9b8] font-mono">
                {currentRows.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#f4f1ea]">
                    <td className="p-2.5">
                      <Link href={`/subscriptions/${sub.id}`} className="text-[#1e4d58] font-bold underline">
                        {sub.number}
                      </Link>
                    </td>
                    <td className="p-2.5 font-sans text-[#2b2b2b]">{sub.customerName}</td>
                    <td className="p-2.5 font-sans text-[#6e6a5f]">{sub.planName}</td>
                    <td className="p-2.5">
                      <Badge status={sub.status} />
                    </td>
                    <td className="p-2.5 text-[#6e6a5f]">{sub.startDate}</td>
                    <td className="p-2.5 text-[#6e6a5f]">{sub.expiryDate}</td>
                    <td className="p-2.5 text-[#6e6a5f]">{sub.nextInvoiceDate}</td>
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
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <NewSubscriptionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        customers={options.customers}
        plans={options.plans}
        terms={options.terms}
        onCreate={handleCreateSubscription}
      />
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading subscriptions page...</div>}>
      <SubscriptionsContent />
    </Suspense>
  );
}
