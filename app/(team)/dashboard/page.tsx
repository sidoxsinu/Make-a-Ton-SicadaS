import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#d1c9b8] pb-4">
        <h1 className="text-2xl font-bold text-[#2b2b2b]">Dashboard</h1>
        <p className="text-sm font-mono text-[#6e6a5f]">Overview of revenue, active subscriptions, and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px]">
          <p className="text-xs font-mono text-[#6e6a5f]">MONTHLY RECURRING REVENUE</p>
          <p className="text-2xl font-bold text-[#1e4d58] font-mono mt-1">₹2,237.50</p>
        </div>
        <div className="p-4 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px]">
          <p className="text-xs font-mono text-[#6e6a5f]">ACTIVE SUBSCRIPTIONS</p>
          <p className="text-2xl font-bold text-[#1e4d58] font-mono mt-1">10,000</p>
        </div>
        <div className="p-4 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px]">
          <p className="text-xs font-mono text-[#6e6a5f]">OVERDUE INVOICES</p>
          <p className="text-2xl font-bold text-[#8c2a2a] font-mono mt-1">14</p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="primary">New Subscription</Button>
        <Button variant="secondary">Export Ledger</Button>
      </div>
    </div>
  );
}
