import React from 'react';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#d1c9b8] pb-4">
        <h1 className="text-2xl font-bold text-[#2b2b2b]">Payments</h1>
        <p className="text-sm font-mono text-[#6e6a5f]">Recorded transactions and gateway logs.</p>
      </div>
      <div className="p-6 bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px]">
        <p className="text-sm text-[#423f38]">Payment ledger records are active.</p>
      </div>
    </div>
  );
}
