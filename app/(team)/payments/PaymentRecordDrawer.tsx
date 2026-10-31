"use client";

import React, { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput, Select } from "@/components/ui/Inputs";
import { useToast } from "@/components/ui/Toast";
import { recordPaymentAction } from "./actions";

export interface InvoiceOption {
  id: string;
  number: string;
  customer_name?: string;
  total: number;
  amount_paid: number;
}

interface PaymentRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  invoices?: InvoiceOption[];
  fixedInvoiceId?: string;
  fixedAmountDue?: number;
  onSuccess?: () => void;
}

export function PaymentRecordDrawer({
  open,
  onClose,
  invoices = [],
  fixedInvoiceId,
  fixedAmountDue,
  onSuccess,
}: PaymentRecordDrawerProps) {
  const toast = useToast();
  const today = new Date().toISOString().split("T")[0];

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    fixedInvoiceId || (invoices.length > 0 ? invoices[0].id : "")
  );
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("bank_transfer");
  const [paidOn, setPaidOn] = useState<string>(today);
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const selectedInv = invoices.find((i) => i.id === selectedInvoiceId);
  const amountDue =
    fixedAmountDue != null
      ? fixedAmountDue
      : selectedInv
      ? Number(selectedInv.total) - Number(selectedInv.amount_paid)
      : 0;

  useEffect(() => {
    if (fixedInvoiceId) {
      setSelectedInvoiceId(fixedInvoiceId);
    } else if (invoices.length > 0 && !selectedInvoiceId) {
      setSelectedInvoiceId(invoices[0].id);
    }
  }, [fixedInvoiceId, invoices, selectedInvoiceId]);

  useEffect(() => {
    if (open && amountDue > 0) {
      setAmount(amountDue.toFixed(2));
    }
  }, [open, amountDue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid amount greater than zero.");
      return;
    }

    if (parsedAmount > amountDue) {
      setErrorMsg(
        `Payment amount (₹${parsedAmount.toFixed(
          2
        )}) cannot exceed the amount due (₹${amountDue.toFixed(2)}).`
      );
      return;
    }

    setLoading(true);
    const res = await recordPaymentAction({
      invoiceId: selectedInvoiceId,
      amount: parsedAmount,
      method,
      paidOn,
      note,
    });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.error || "Failed to record payment");
      toast.error(res.error || "Failed to record payment");
    } else {
      toast.success("Payment recorded successfully");
      onClose();
      if (onSuccess) onSuccess();
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {errorMsg && (
          <div className="p-3 border border-bad text-bad text-[13px] bg-canvas-subtle">
            {errorMsg}
          </div>
        )}

        {/* Invoice Picker if not fixed */}
        {!fixedInvoiceId && (
          <Field label="Invoice" required>
            <Select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              required
              options={invoices.map((inv) => {
                const due = Number(inv.total) - Number(inv.amount_paid);
                return {
                  value: inv.id,
                  label: `${inv.number} - ${inv.customer_name || "Customer"} (Due: ₹${due.toFixed(2)})`,
                };
              })}
            />
          </Field>
        )}

        <Field
          label="Amount to Pay"
          required
          help={`Amount due on invoice: ₹${amountDue.toFixed(2)}`}
        >
          <TextInput
            type="number"
            step="0.01"
            min="0.01"
            max={amountDue}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="0.00"
          />
        </Field>

        <Field label="Payment Method" required>
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
            options={[
              { value: "bank_transfer", label: "Bank Transfer (NEFT/RTGS/IMPS)" },
              { value: "upi", label: "UPI" },
              { value: "cash", label: "Cash" },
              { value: "card", label: "Card (Credit/Debit)" },
              { value: "cheque", label: "Cheque" },
              { value: "other", label: "Other" },
            ]}
          />
        </Field>

        <Field label="Payment Date" required>
          <TextInput
            type="date"
            value={paidOn}
            onChange={(e) => setPaidOn(e.target.value)}
            required
          />
        </Field>

        <Field label="Reference / Note" help="Optional transaction ID, cheque number, or bank reference">
          <TextInput
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. UTR / Transaction #12345"
          />
        </Field>

        <div className="flex justify-end gap-3 pt-4 border-t border-rule">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Record Payment
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
