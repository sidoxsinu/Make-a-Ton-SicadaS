import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface AddCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
  }) => void;
}

export const AddCustomerDrawer: React.FC<AddCustomerDrawerProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation">
      <button
        type="button"
        aria-label="Close add customer drawer"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-customer-title"
        className="relative w-full max-w-[480px] bg-[#f9f7f2] border-l border-[#d1c9b8] h-full p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-[#d1c9b8]">
            <h3 id="add-customer-title" className="font-semibold text-lg text-[#2b2b2b]">Add Customer</h3>
            <button
              onClick={onClose}
              type="button"
              className="text-xs font-mono border border-[#a8a090] px-2 py-0.5 rounded-[2px]"
            >
              Close
            </button>
          </div>

          <form id="add-customer-form" onSubmit={handleSubmit} className="py-4 space-y-4 text-xs font-sans">
            <div>
              <label htmlFor="new-customer-name" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Full name</label>
              <input
                id="new-customer-name"
                type="text"
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>

            <div>
              <label htmlFor="new-customer-company" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Company</label>
              <input
                id="new-customer-company"
                type="text"
                required
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>

            <div>
              <label htmlFor="new-customer-email" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Email</label>
              <input
                id="new-customer-email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>

            <div>
              <label htmlFor="new-customer-phone" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Phone</label>
              <input
                id="new-customer-phone"
                type="text"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>

            <div>
              <label htmlFor="new-customer-address" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Address</label>
              <textarea
                id="new-customer-address"
                rows={3}
                placeholder="Enter complete office address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none focus:border-[#1e4d58]"
              />
            </div>
          </form>
        </div>

        <div className="pt-4 border-t border-[#d1c9b8] flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-customer-form" variant="primary">
            Save customer
          </Button>
        </div>
      </section>
    </div>
  );
};
