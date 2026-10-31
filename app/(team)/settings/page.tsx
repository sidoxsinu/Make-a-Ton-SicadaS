import React from 'react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#d1c9b8] pb-4">
        <h1 className="text-2xl font-bold text-[#2b2b2b]">System Settings</h1>
        <p className="text-sm font-mono text-[#6e6a5f]">General organization, ledger preferences, and API keys.</p>
      </div>
      <div className="pt-4">
        <Button variant="primary">Save Configuration</Button>
      </div>
    </div>
  );
}
