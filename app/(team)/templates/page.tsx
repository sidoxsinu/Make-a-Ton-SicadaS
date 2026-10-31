import React from 'react';
import { Button } from '@/components/ui/Button';

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Subscription Templates</h1>
          <p className="text-sm font-mono text-[#6e6a5f]">Reusable contract & invoice structures.</p>
        </div>
        <Button variant="primary">New Template</Button>
      </div>
      <div className="p-8 bg-[#f9f7f2] border border-dashed border-[#b0a898] text-center rounded-[2px]">
        <p className="text-sm text-[#6e6a5f] font-mono">No custom templates created yet.</p>
      </div>
    </div>
  );
}
