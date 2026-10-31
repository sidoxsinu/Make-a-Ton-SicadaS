"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, TextArea } from "@/components/ui/Inputs";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  updateCustomerDetailsAction,
  requestPortalResetPasswordAction,
} from "@/app/(portal)/portal/actions";

export interface PortalAccountData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  tax_number: string | null;
}

export interface PortalAccountClientProps {
  customer: PortalAccountData;
  userEmail: string;
}

export function PortalAccountClient({
  customer,
  userEmail,
}: PortalAccountClientProps) {
  const router = useRouter();
  const { success, error } = useToast();

  const [name, setName] = useState(customer.name || "");
  const [phone, setPhone] = useState(customer.phone || "");
  const [address, setAddress] = useState(customer.address || "");

  const [saving, setSaving] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      error("Your full name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateCustomerDetailsAction(name, phone, address);
      if (res.success) {
        success("Your contact details have been updated.");
        router.refresh();
      } else {
        error(res.error || "Could not update account details.");
      }
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    setRequestingReset(true);
    setResetMessage(null);
    try {
      const res = await requestPortalResetPasswordAction();
      if (res.success) {
        setResetMessage(
          res.message || "A secure password reset link has been dispatched to your email."
        );
        success("Check your email inbox for the reset link.");
      } else {
        error(res.error || "Unable to request password reset.");
      }
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setRequestingReset(false);
    }
  }

  return (
    <div className="max-w-[760px] mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="border-b border-rule pb-4">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-2">
          Customer Portal
        </span>
        <h1 className="text-[22px] font-sans font-semibold text-ink mt-1">
          Account Settings
        </h1>
        <p className="text-[13px] font-sans text-ink-2 mt-1">
          Maintain your contact details, billing address, and account credentials.
        </p>
      </div>

      {/* Edit Details Form */}
      <form onSubmit={handleSave} className="border border-rule bg-sheet p-6 space-y-5">
        <h2 className="text-[15px] font-sans font-semibold uppercase tracking-wide text-ink border-b border-rule pb-2">
          Contact Details
        </h2>

        {/* Read-only account email */}
        <Field
          label="Account Email Address"
          help="The primary email associated with your portal login. Contact support to modify."
        >
          <TextInput
            value={userEmail}
            disabled
            className="bg-paper font-mono text-ink-2 cursor-not-allowed"
          />
        </Field>

        {/* Full Name */}
        <Field label="Full Name" required>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            required
          />
        </Field>

        {/* Phone */}
        <Field label="Phone Number" help="For invoice notifications and account alerts.">
          <TextInput
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
          />
        </Field>

        {/* Company (if exists) */}
        {customer.company && (
          <Field label="Company / Entity">
            <TextInput
              value={customer.company}
              disabled
              className="bg-paper text-ink-2 cursor-not-allowed"
            />
          </Field>
        )}

        {/* Billing Address */}
        <Field
          label="Billing Address"
          help="Appears on official tax invoices and receipts issued to your account."
        >
          <TextArea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
            placeholder="Street address, City, State, Postal Code"
          />
        </Field>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Security & Password Card */}
      <div className="border border-rule bg-sheet p-6 space-y-4">
        <h2 className="text-[15px] font-sans font-semibold uppercase tracking-wide text-ink border-b border-rule pb-2">
          Password & Security
        </h2>
        <p className="text-[13px] font-sans text-ink-2">
          Brightloop uses complex password policies (minimum 9 characters, including uppercase, lowercase, numbers, and symbols) to keep your billing information secure.
        </p>

        {resetMessage && (
          <div className="p-3 border border-ok bg-paper text-ok text-[13px] font-sans">
            {resetMessage}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            loading={requestingReset}
            onClick={handlePasswordReset}
          >
            Send Password Reset Link
          </Button>
        </div>
      </div>
    </div>
  );
}
