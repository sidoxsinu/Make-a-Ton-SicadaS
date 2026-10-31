import React from 'react';
import { Button } from '@/components/ui/Button';

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Plans</h1>
          <p className="text-sm font-mono text-[#6e6a5f]">Tiered recurring billing plans & frequencies.</p>
        </div>
        <Button variant="primary">+ Create Plan</Button>
      </div>
    </div>
  );
}
