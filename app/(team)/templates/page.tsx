'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { fetchTemplates } from '@/lib/data/queries';

function TemplatesContent() {
  const [templates, setTemplates] = useState<Awaited<ReturnType<typeof fetchTemplates>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Templates could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Subscription Templates</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Pre-configured plan structures for fast subscription rollout.</p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[#8c2a2a]">{error}</p>
      ) : isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading templates...</div>
      ) : (
        <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
              <tr>
                <th className="p-2.5 font-sans">Name</th>
                <th className="p-2.5 font-sans">Plan</th>
                <th className="p-2.5 text-right font-mono">Validity (days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1c9b8] font-mono">
              {templates.map((tmpl) => (
                <tr key={tmpl.id} className="hover:bg-[#f4f1ea]">
                  <td className="p-2.5 font-sans">
                    <Link href={`/templates/${tmpl.id}`} className="text-[#1e4d58] font-bold underline">
                      {tmpl.name}
                    </Link>
                  </td>
                  <td className="p-2.5 font-sans text-[#2b2b2b]">{tmpl.planName}</td>
                  <td className="p-2.5 text-right text-[#2b2b2b]">{tmpl.validityDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
