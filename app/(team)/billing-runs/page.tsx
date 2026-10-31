'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { mockBillingRunsData } from '@/lib/data/mockData';
import { BillingRun } from '@/lib/data/types';

export default function BillingRunsPage() {
  const [runs, setRuns] = useState<BillingRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRuns(mockBillingRunsData);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Billing Runs</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Automated invoice generation engine and execution logs.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading billing runs...</div>
      ) : (
        <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
              <tr>
                <th className="p-2.5">Time</th>
                <th className="p-2.5 text-right font-mono">Created</th>
                <th className="p-2.5 text-right font-mono">Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1c9b8] font-mono">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-[#f4f1ea]">
                  <td className="p-2.5 text-[#2b2b2b]">{run.ranAt}</td>
                  <td className="p-2.5 text-right text-[#1e5931] font-bold">{run.createdCount}</td>
                  <td className="p-2.5 text-right text-[#8c2a2a] font-bold">{run.failedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
