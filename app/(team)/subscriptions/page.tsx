import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Subscriptions</h1>
          <p className="text-sm font-mono text-[#6e6a5f]">Manage customer recurring plans and draft billing.</p>
        </div>
        <Button variant="primary">+ Create Subscription</Button>
      </div>

      <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-xs font-mono text-[#6e6a5f]">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">CUSTOMER</th>
              <th className="p-3">STATUS</th>
              <th className="p-3 text-right">AMOUNT</th>
              <th className="p-3 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2dbce] font-mono text-xs">
            <tr>
              <td className="p-3 text-[#1e4d58] font-bold">SUB-000123</td>
              <td className="p-3 font-sans">Acme Corp</td>
              <td className="p-3"><Badge status="ACTIVE" /></td>
              <td className="p-3 text-right">₹15,977.20</td>
              <td className="p-3 text-center"><Button variant="quiet">View</Button></td>
            </tr>
            <tr>
              <td className="p-3 text-[#1e4d58] font-bold">SUB-000124</td>
              <td className="p-3 font-sans">Stark Industries</td>
              <td className="p-3"><Badge status="PAUSED" /></td>
              <td className="p-3 text-right">₹8,450.00</td>
              <td className="p-3 text-center"><Button variant="quiet">View</Button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
