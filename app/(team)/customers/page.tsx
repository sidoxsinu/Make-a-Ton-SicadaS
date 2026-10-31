'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { useToast } from '@/components/ui/Toast';
import { AddCustomerDrawer } from '@/components/customer/AddCustomerDrawer';
import { createCustomer, fetchCustomers } from '@/lib/data/queries';

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const searchParamsKey = searchParams?.toString() ?? '';
  const params = useMemo(() => new URLSearchParams(searchParamsKey), [searchParamsKey]);

  const initialSearch = params.get('search') || '';
  const parsedPage = Number.parseInt(params.get('page') || '1', 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [customers, setCustomers] = useState<Awaited<ReturnType<typeof fetchCustomers>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers()
      .then(setCustomers)
      .catch((cause: unknown) => setLoadError(cause instanceof Error ? cause.message : 'Customers could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setSearchQuery(params.get('search') || '');
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
    router.push(query ? `/customers?${query}` : '/customers');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCurrentPage(1);
    updateUrlParams({ search: val, page: 1 });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/customers');
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((item) => {
      if (searchQuery === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      );
    });
  }, [customers, searchQuery]);

  const pageSize = 25;
  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const visiblePage = Math.min(currentPage, totalPages);
  const pageStart = (visiblePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const currentRows = filteredCustomers.slice(pageStart, pageEnd);

  const handleSaveCustomer = async (newCust: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      await createCustomer(newCust);
      setCustomers(await fetchCustomers());
      toast.success('Customer added.');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Customer could not be added.');
    }
  };

  const hasActiveFilters = Boolean(searchQuery);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Customers</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Client directory and account ledger overview.</p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            Add customer
          </Button>
        </div>
      </div>

      {/* Single Row Search Filter */}
      <div className="bg-[#f9f7f2] border border-[#d1c9b8] p-3 rounded-[2px] flex items-center gap-4 text-xs font-sans">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <label className="font-semibold text-[#2b2b2b] uppercase">Search</label>
          <input
            type="text"
            placeholder="Search name, company, email..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-2 py-1 bg-[#f4f1ea] border border-[#a8a090] rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#2b2b2b] underline underline-offset-2 hover:bg-[#e8e2d4] px-2 py-1 rounded-[2px]"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Ruled Table / States */}
      {loadError ? (
        <p role="alert" className="text-sm text-[#8c2a2a]">{loadError}</p>
      ) : isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading customers...</div>
      ) : totalItems === 0 ? (
        <div className="p-12 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] text-center space-y-4">
          <p className="text-sm font-sans text-[#6e6a5f]">
            {hasActiveFilters ? 'No customers match search.' : 'No customers yet. Add a customer.'}
          </p>
          <div>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-[#2b2b2b] underline underline-offset-4 hover:bg-[#e8e2d4] px-3 py-1.5 rounded-[2px]"
              >
                Clear search
              </button>
            ) : (
              <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
                Add customer
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
                  <th className="p-2.5 font-sans">Name</th>
                  <th className="p-2.5 font-sans">Company</th>
                  <th className="p-2.5 font-mono">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1c9b8] font-mono">
                {currentRows.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#f4f1ea]">
                    <td className="p-2.5 font-sans">
                      <Link href={`/customers/${cust.id}`} className="text-[#1e4d58] font-bold underline">
                        {cust.name}
                      </Link>
                    </td>
                    <td className="p-2.5 font-sans text-[#2b2b2b]">{cust.company}</td>
                    <td className="p-2.5 text-[#6e6a5f]">{cust.email}</td>
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

      {/* Add Customer Drawer */}
      <AddCustomerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading customers page...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
