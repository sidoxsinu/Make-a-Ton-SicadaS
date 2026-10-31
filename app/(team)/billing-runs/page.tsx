import React from 'react';
import { Button } from '@/components/ui/Button';

export default function BillingRunsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Billing Runs</h1>
          <p className="text-sm font-mono text-[#6e6a5f]">Automated recurring billing batch processing.</p>
        </div>
        <Button variant="primary">Execute New Run</Button>
      </div>
      <div className="p-4 bg-[#f9f7f2] border border-[#d1c9b8] text-sm font-mono">
        Last automated run completed: Oct 31, 2026 at 00:00 UTC
      </div>
    </div>
  );
}
