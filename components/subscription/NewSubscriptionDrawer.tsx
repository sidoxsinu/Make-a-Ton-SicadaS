'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface NewSubscriptionInput {
  customerName: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  paymentTerms: string;
}

interface NewSubscriptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Array<{ id: string; name: string }>;
  plans: Array<{ id: string; name: string }>;
  terms: Array<{ id: string; name: string }>;
  onCreate: (newSub: NewSubscriptionInput) => void;
}

export const NewSubscriptionDrawer: React.FC<NewSubscriptionDrawerProps> = ({ isOpen, onClose, customers, plans, terms, onCreate }) => {
  const [customer, setCustomer] = useState('');
  const [plan, setPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  if (isOpen === false) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      customerName: customer,
      planName: plan,
      startDate,
      expiryDate,
      paymentTerms,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="w-[480px] bg-[#f9f7f2] border-l border-[#d1c9b8] h-full p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-[#d1c9b8]">
            <h3 className="font-semibold text-lg text-[#2b2b2b]">Create Subscription</h3>
            <button
              onClick={onClose}
              type="button"
              className="text-xs font-mono border border-[#a8a090] px-2 py-0.5 rounded-[2px]"
            >
              Close
            </button>
          </div>

          <form id="new-sub-form" onSubmit={handleSubmit} className="py-4 space-y-4 text-xs font-sans">
            <div>
              <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Customer</label>
              <select
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              >
                <option value="">Select a customer</option>
                {customers.map((option) => <option key={option.id} value={option.name}>{option.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              >
                <option value="">Select a plan</option>
                {plans.map((option) => <option key={option.id} value={option.name}>{option.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px]"
                />
              </div>
              <div>
                <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              >
                <option value="">Select payment terms</option>
                {terms.map((option) => <option key={option.id} value={option.name}>{option.name}</option>)}
              </select>
            </div>
          </form>
        </div>

        <div className="pt-4 border-t border-[#d1c9b8] flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="new-sub-form" variant="primary">
            Save subscription
          </Button>
        </div>
      </div>
    </div>
  );
};
