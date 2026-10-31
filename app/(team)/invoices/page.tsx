import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Invoices</h1>
          <p className="text-sm font-mono text-[#6e6a5f]">Issued statements, payment statuses, and history.</p>
        </div>
        <Button variant="primary">Generate Invoice</Button>
      </div>
      <div className="bg-[#f9f7f2] border border-[#d1c9b8] p-4 rounded-[2px]">
        <div className="flex gap-2 mb-4">
          <Badge status="PAID" />
          <Badge status="OVERDUE" />
          <Badge status="PARTIAL" />
        </div>
        <p className="text-xs font-mono text-[#6e6a5f]">14 overdue invoices pending collection.</p>
      </div>
    </div>
  );
}
