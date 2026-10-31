'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import { getMockCustomerDetail } from '@/lib/data/customers';
import { useToast } from '@/components/ui/Toast';
import type { CustomerDetail } from '@/types/customer';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const toast = useToast();
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const customer = getMockCustomerDetail(params.id);
      setDetail(customer);
      setName(customer?.name ?? '');
      setCompany(customer?.company ?? '');
      setEmail(customer?.email ?? '');
      setPhone(customer?.phone ?? '');
      setAddress(customer?.address ?? '');
      setIsLoading(false);
    }, 300);
    setIsLoading(true);
    return () => clearTimeout(timer);
  }, [params.id]);

  if (isLoading) {
    return <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading customer detail...</div>;
  }

  if (!detail) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-bold text-[#2b2b2b]">Customer not found</h1>
        <p className="text-sm text-[#6e6a5f]">No customer exists with ID “{params.id}”.</p>
        <Link href="/customers" className="text-sm text-[#1e4d58] underline">Back to customers</Link>
      </div>
    );
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated = { ...detail, name: name.trim(), company: company.trim(), email: email.trim(), phone: phone.trim(), address: address.trim() };
    setDetail(updated);
    toast.success('Customer details updated for this session.');
  };

  const latestSubscriptions = detail.subscriptions.slice(0, 10);
  const latestInvoices = detail.invoices.slice(0, 10);
  const latestPayments = detail.payments.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="border-b border-[#d1c9b8] pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">{detail.name}</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">{detail.company}</p>
        </div>
        <Link href="/customers" className="text-xs text-[#1e4d58] underline underline-offset-2">
          Back to customers
        </Link>
      </div>

      {/* Two Columns Top Section (Form left, Ledger right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details Form */}
        <div className="lg:col-span-2 space-y-4 border-r border-[#d1c9b8] pr-0 lg:pr-6">
          <h2 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-2">
            Customer details
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label htmlFor="customer-name" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Full name</label>
              <input
                id="customer-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>
            <div>
              <label htmlFor="customer-company" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Company</label>
              <input
                id="customer-company"
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>
            <div>
              <label htmlFor="customer-email" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Email</label>
              <input
                id="customer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Phone</label>
              <input
                id="customer-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="customer-address" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Address</label>
              <textarea
                id="customer-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button type="submit" variant="primary">Save changes</Button>
            </div>
          </form>
        </div>

        {/* Right: Account Summary Ledger */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider border-b border-[#d1c9b8] pb-2">
            Account summary
          </h2>
          <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <tbody className="divide-y divide-[#d1c9b8]">
                <tr className="hover:bg-[#f4f1ea]">
                  <td className="p-3 font-sans text-[#2b2b2b] align-top font-medium">Active subscriptions</td>
                  <td className="p-3 text-right align-top font-mono text-lg text-[#2b2b2b]">
                    {detail.activeSubscriptionsCount}
                  </td>
                </tr>
                <tr className="hover:bg-[#f4f1ea]">
                  <td className="p-3 font-sans text-[#2b2b2b] align-top font-medium">Outstanding</td>
                  <td className="p-3 text-right align-top font-mono text-lg text-[#2b2b2b]">
                    <Money value={detail.outstandingAmount} />
                  </td>
                </tr>
                <tr className="hover:bg-[#f4f1ea]">
                  <td className="p-3 font-sans text-[#2b2b2b] align-top font-medium">Overdue</td>
                  <td className="p-3 text-right align-top font-mono text-lg text-[#8c2a2a]">
                    <Money value={detail.overdueAmount} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Three Ruled Sections Below */}
      <div className="space-y-8 pt-4">
        {/* 1. Subscriptions Table */}
        <section className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-2">
            <h3 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider">Subscriptions</h3>
            <span className="text-xs font-mono text-[#6e6a5f]">Latest 10 rows</span>
          </div>
          <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
            {latestSubscriptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6e6a5f] font-mono">No active subscriptions.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                  <tr>
                    <th className="p-2.5">Number</th>
                    <th className="p-2.5 font-sans">Plan</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Start date</th>
                    <th className="p-2.5 text-right">Monthly value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1c9b8] font-mono">
                  {latestSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#f4f1ea]">
                      <td className="p-2.5">
                        <Link href={`/subscriptions/${sub.id}`} className="text-[#1e4d58] font-bold underline">
                          {sub.number}
                        </Link>
                      </td>
                      <td className="p-2.5 font-sans text-[#2b2b2b]">{sub.planName}</td>
                      <td className="p-2.5">
                        <Badge status={sub.status} />
                      </td>
                      <td className="p-2.5 text-[#6e6a5f]">{sub.startDate}</td>
                      <td className="p-2.5 text-right font-bold text-[#2b2b2b]">
                        <Money value={sub.monthlyValue} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* 2. Invoices Table */}
        <section className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-2">
            <h3 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider">Invoices</h3>
            <span className="text-xs font-mono text-[#6e6a5f]">Latest 10 rows</span>
          </div>
          <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
            {latestInvoices.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6e6a5f] font-mono">No invoices recorded.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                  <tr>
                    <th className="p-2.5">Number</th>
                    <th className="p-2.5">Invoice date</th>
                    <th className="p-2.5">Due date</th>
                    <th className="p-2.5 text-right">Total</th>
                    <th className="p-2.5 text-right">Due</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1c9b8] font-mono">
                  {latestInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#f4f1ea]">
                      <td className="p-2.5">
                        <Link href={`/invoices/${inv.id}`} className="text-[#1e4d58] font-bold underline">
                          {inv.number}
                        </Link>
                      </td>
                      <td className="p-2.5 text-[#6e6a5f]">{inv.invoiceDate}</td>
                      <td className="p-2.5 text-[#6e6a5f]">{inv.dueDate}</td>
                      <td className="p-2.5 text-right font-bold text-[#2b2b2b]">
                        <Money value={inv.total} />
                      </td>
                      <td className="p-2.5 text-right font-bold text-[#8c2a2a]">
                        <Money value={inv.due} />
                      </td>
                      <td className="p-2.5">
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* 3. Payments Table */}
        <section className="space-y-3">
          <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-2">
            <h3 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider">Payments</h3>
            <span className="text-xs font-mono text-[#6e6a5f]">Latest 10 rows</span>
          </div>
          <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
            {latestPayments.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6e6a5f] font-mono">No payments recorded.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Invoice</th>
                    <th className="p-2.5 font-sans">Method</th>
                    <th className="p-2.5 font-sans">Note</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d1c9b8] font-mono">
                  {latestPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-[#f4f1ea]">
                      <td className="p-2.5 text-[#6e6a5f]">{pay.date}</td>
                      <td className="p-2.5">
                        <Link href={`/invoices/${pay.invoiceId}`} className="text-[#1e4d58] font-bold underline">
                          {pay.invoiceNumber}
                        </Link>
                      </td>
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
    </div>
  );
}
