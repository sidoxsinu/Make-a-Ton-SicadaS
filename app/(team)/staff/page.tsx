'use client';

import React, { useState, useEffect } from 'react';
import { fetchStaff } from '@/lib/data/queries';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Awaited<ReturnType<typeof fetchStaff>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff()
      .then(setStaffList)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Staff could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Staff Management</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Internal operator roles and administrative access control.</p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[#8c2a2a]">{error}</p>
      ) : isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading staff registry...</div>
      ) : (
        <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
              <tr>
                <th className="p-2.5 font-sans">Name</th>
                <th className="p-2.5 font-sans">Role</th>
                <th className="p-2.5 font-mono">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1c9b8] font-mono">
              {staffList.map((usr) => (
                <tr key={usr.id} className="hover:bg-[#f4f1ea]">
                  <td className="p-2.5 font-sans text-[#2b2b2b] font-medium">{usr.name}</td>
                  <td className="p-2.5 font-sans text-[#2b2b2b]">{usr.role}</td>
                  <td className="p-2.5 text-[#6e6a5f]">{usr.addedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
