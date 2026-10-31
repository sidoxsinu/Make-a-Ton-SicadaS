'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchOrganizationSettings, saveOrganizationSettings } from '@/lib/data/queries';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrganizationSettings()
      .then((settings) => {
        setCompanyName(settings.companyName);
        setCurrencyCode(settings.currencyCode);
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Settings could not be loaded.')
      )
      .finally(() => setIsLoading(false));
  }, []);

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      await saveOrganizationSettings({ companyName: companyName.trim(), currencyCode: currencyCode.trim() });
      setNotice('Settings saved.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Settings could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#d1c9b8] pb-4">
        <h1 className="text-2xl font-bold text-[#2b2b2b]">System Settings</h1>
        <p className="text-sm font-sans text-[#6e6a5f]">Organization details, billing defaults, and invoice automation.</p>
      </div>

      {error && <p role="alert" className="text-sm text-[#8c2a2a]">{error}</p>}
      {notice && <p role="status" className="text-sm text-[#1e5931]">{notice}</p>}
      <form onSubmit={saveSettings} className="bg-[#f9f7f2] border border-[#d1c9b8] p-6 rounded-[2px] space-y-6 max-w-2xl text-xs font-sans">
        <div>
          <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isLoading || isSaving}
            className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Currency Code</label>
          <input
            type="text"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            disabled={isLoading || isSaving}
            className="w-24 px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none"
          />
        </div>

        <Button type="submit" variant="primary" disabled={isLoading || isSaving}>
          {isSaving ? 'Saving...' : 'Save settings'}
        </Button>
      </form>
    </div>
  );
}
