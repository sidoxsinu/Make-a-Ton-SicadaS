'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('Brightloop SMS India Private Limited');
  const [currencyCode, setCurrencyCode] = useState('INR');

  return (
    <div className="space-y-6">
      <div className="border-b border-[#d1c9b8] pb-4">
        <h1 className="text-2xl font-bold text-[#2b2b2b]">System Settings</h1>
        <p className="text-sm font-sans text-[#6e6a5f]">Organization details, billing defaults, and invoice automation.</p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="bg-[#f9f7f2] border border-[#d1c9b8] p-6 rounded-[2px] space-y-6 max-w-2xl text-xs font-sans">
        <div>
          <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Currency Code</label>
          <input
            type="text"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            className="w-24 px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none"
          />
        </div>

        <Button type="submit" variant="primary">
          Save settings
        </Button>
      </form>
    </div>
  );
}
