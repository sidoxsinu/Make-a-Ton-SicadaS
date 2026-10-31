import React from 'react';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Inputs';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Customers</h1>
          <p className="text-sm font-mono text-[#6e6a5f]">Registered clients and billing contacts.</p>
        </div>
        <Button variant="primary">+ Add Customer</Button>
      </div>
      <div className="w-72">
        <TextInput placeholder="Search customers..." />
      </div>
    </div>
  );
}
