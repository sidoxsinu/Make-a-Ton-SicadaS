import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Money } from '@/components/ui/Money';
import type { UnpaidInvoice, PaymentMethod } from '@/types/payment';

interface RecordPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unpaidInvoices: UnpaidInvoice[];
  onSave: (payment: {
    invoiceId: string;
    invoiceNumber: string;
    customerName: string;
    method: PaymentMethod;
    amount: number;
    date: string;
    note: string;
  }) => void;
}

export const RecordPaymentDrawer: React.FC<RecordPaymentDrawerProps> = ({
  isOpen,
  onClose,
  unpaidInvoices,
  onSave,
}) => {
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<UnpaidInvoice | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('Bank transfer');
  const [amountStr, setAmountStr] = useState('');
  const [dateStr, setDateStr] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const currentSelection = unpaidInvoices.find((invoice) => invoice.id === selectedInvoice?.id);
    const nextSelection = currentSelection ?? unpaidInvoices[0] ?? null;
    setSelectedInvoice(nextSelection);
    setAmountStr(nextSelection ? String(nextSelection.amountDue) : '');
    setErrorMessage(null);
  }, [isOpen, unpaidInvoices, selectedInvoice?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredInvoices = unpaidInvoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  const handleInvoiceSelect = (inv: UnpaidInvoice) => {
    setSelectedInvoice(inv);
    setAmountStr(String(inv.amountDue));
    setErrorMessage(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmountStr(val);
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) {
      setErrorMessage('Enter a payment amount greater than zero.');
    } else if (selectedInvoice && num > selectedInvoice.amountDue) {
      setErrorMessage('Amount cannot be more than the amount due.');
    } else {
      setErrorMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) {
      setErrorMessage('Select an invoice that has an outstanding balance.');
      return;
    }

    const currentInvoice = unpaidInvoices.find((invoice) => invoice.id === selectedInvoice.id);
    const num = Number(amountStr);
    if (!currentInvoice || !Number.isFinite(num) || num <= 0 || num > currentInvoice.amountDue) {
      setErrorMessage('Enter an amount greater than zero and no more than the current amount due.');
      return;
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    if (
      !dateStr ||
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      setErrorMessage('Enter a valid payment date.');
      return;
    }
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);

    onSave({
      invoiceId: currentInvoice.id,
      invoiceNumber: currentInvoice.number,
      customerName: currentInvoice.customerName,
      method,
      amount: num,
      date: formattedDate,
      note,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation">
      <button
        type="button"
        aria-label="Close record payment drawer"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-payment-title"
        className="relative w-full max-w-[480px] bg-[#f9f7f2] border-l border-[#d1c9b8] h-full p-6 flex flex-col justify-between overflow-y-auto"
      >
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-[#d1c9b8]">
            <h3 id="record-payment-title" className="font-semibold text-lg text-[#2b2b2b]">Record Payment</h3>
            <button
              onClick={onClose}
              type="button"
              className="text-xs font-mono border border-[#a8a090] px-2 py-0.5 rounded-[2px]"
            >
              Close
            </button>
          </div>

          <form id="record-payment-form" onSubmit={handleSubmit} className="py-4 space-y-4 text-xs font-sans">
            {/* Searchable Invoice Picker */}
            <div>
              <label className="block font-semibold uppercase text-[#2b2b2b] mb-1">
                Select Invoice (Confirmed with amount due)
              </label>
              <input
                id="invoice-search"
                type="text"
                placeholder="Search invoice number or customer..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none mb-2"
              />
              <div className="max-h-36 overflow-y-auto border border-[#d1c9b8] rounded-[2px] bg-[#f4f1ea] divide-y divide-[#d1c9b8]">
                {filteredInvoices.length === 0 ? (
                  <p className="p-3 text-xs text-[#6e6a5f]">
                    {unpaidInvoices.length === 0 ? 'There are no invoices with an outstanding balance.' : 'No invoices match your search.'}
                  </p>
                ) : filteredInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    type="button"
                    aria-pressed={selectedInvoice?.id === inv.id}
                    onClick={() => handleInvoiceSelect(inv)}
                    className={`w-full p-2 text-left cursor-pointer flex justify-between items-center text-xs ${
                      selectedInvoice?.id === inv.id ? 'bg-[#e2dbce] font-semibold' : 'hover:bg-[#e8e2d4]'
                    }`}
                  >
                    <span>
                      <span className="font-mono text-[#1e4d58] font-bold mr-2">{inv.number}</span>
                      <span className="text-[#2b2b2b]">{inv.customerName}</span>
                    </span>
                    <span className="font-mono text-[#8c2a2a]">
                      <Money value={inv.amountDue} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Method Select */}
            <div>
              <label htmlFor="payment-method" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Payment Method</label>
              <select
                id="payment-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none"
              >
                <option value="Bank transfer">Bank transfer</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {/* Live Amount Due Indicator & Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="payment-amount" className="font-semibold uppercase text-[#2b2b2b]">Amount</label>
                {selectedInvoice && (
                  <span className="text-xs text-[#6e6a5f] font-sans">
                    Amount due: <Money value={selectedInvoice.amountDue} className="font-bold text-[#8c2a2a]" />
                  </span>
                )}
              </div>
              <input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={selectedInvoice?.amountDue}
                required
                disabled={!selectedInvoice}
                value={amountStr}
                onChange={handleAmountChange}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none"
              />
              {errorMessage && (
                <p role="alert" className="text-xs text-[#8c2a2a] mt-1 font-sans font-medium">{errorMessage}</p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label htmlFor="payment-date" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Payment Date</label>
              <input
                id="payment-date"
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] font-mono text-xs rounded-[2px] focus:outline-none"
              />
            </div>

            {/* Note Field */}
            <div>
              <label htmlFor="payment-note" className="block font-semibold uppercase text-[#2b2b2b] mb-1">Note</label>
              <input
                id="payment-note"
                type="text"
                placeholder="e.g. Reference transaction ID"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4f1ea] border border-[#a8a090] text-xs rounded-[2px] focus:outline-none"
              />
            </div>
          </form>
        </div>

        <div className="pt-4 border-t border-[#d1c9b8] flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="record-payment-form" variant="primary" disabled={!selectedInvoice}>
            Save payment
          </Button>
        </div>
      </section>
    </div>
  );
};
