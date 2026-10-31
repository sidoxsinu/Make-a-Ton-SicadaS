'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { mockStaffData } from '@/lib/data/mockData';
import { StaffUser } from '@/lib/data/types';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStaffList(mockStaffData);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#d1c9b8] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2b2b2b]">Staff Management</h1>
          <p className="text-sm font-sans text-[#6e6a5f]">Internal operator roles and administrative access control.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm font-mono text-[#6e6a5f]">Loading staff registry...</div>
      ) : (
        <div className="bg-[#f9f7f2] border border-[#d1c9b8] rounded-[2px] overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eee9df] border-b border-[#d1c9b8] text-[#6e6a5f] font-mono uppercase">
              <tr>
                <th className="p-2.5 font-sans">Name</th>
                <th className="p-2.5 font-mono">Email</th>
                <th className="p-2.5 font-sans">Role</th>
                <th className="p-2.5 font-sans">Status</th>
                <th className="p-2.5 font-mono">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d1c9b8] font-mono">
              {staffList.map((usr) => (
                <tr key={usr.id} className="hover:bg-[#f4f1ea]">
                  <td className="p-2.5 font-sans text-[#2b2b2b] font-medium">{usr.name}</td>
                  <td className="p-2.5 text-[#6e6a5f]">{usr.email}</td>
                  <td className="p-2.5 font-sans text-[#2b2b2b]">{usr.role}</td>
                  <td className="p-2.5 font-sans">
                    <span className="px-2 py-0.5 border text-[10px] rounded-[2px] bg-[#d4f0dc] text-[#1e5931] border-[#3d7a5a]">
                      {usr.status}
                    </span>
                  </td>
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
