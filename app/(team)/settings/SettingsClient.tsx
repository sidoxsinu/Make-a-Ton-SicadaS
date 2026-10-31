"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput, Toggle } from "@/components/ui/Inputs";
import { useToast } from "@/components/ui/Toast";
import { saveSettingsAction } from "./actions";

export interface SettingsClientProps {
  initialSettings: {
    auto_confirm_invoices: boolean;
    currency: string;
    company_name: string;
  };
  canWrite?: boolean;
}

export function SettingsClient({
  initialSettings,
  canWrite = true,
}: SettingsClientProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(
    initialSettings.auto_confirm_invoices
  );
  const [currency, setCurrency] = useState(initialSettings.currency);
  const [companyName, setCompanyName] = useState(initialSettings.company_name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite) return;
    setLoading(true);

    const res = await saveSettingsAction({
      auto_confirm_invoices: autoConfirm,
      currency: currency.trim() || "INR",
      company_name: companyName.trim() || "Brightloop Software",
    });
    setLoading(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[560px]">
      <div className="border-b border-rule pb-3">
        <h2 className="text-[18px] font-sans font-semibold text-ink">
          Application Settings
        </h2>
        <p className="text-[12px] font-sans text-ink-2">
          Global billing configuration and ledger defaults.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field
          label="Company / Trading Name"
          name="company_name"
          help="Appears on invoice printouts and client statements"
        >
          <TextInput
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={!canWrite}
            required
          />
        </Field>

        <Field
          label="Default Currency Code"
          name="currency"
          help="ISO 4217 standard currency code (default: INR)"
        >
          <TextInput
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            disabled={!canWrite}
            maxLength={3}
            className="font-mono uppercase w-[120px]"
            required
          />
        </Field>

        <div className="p-4 bg-sheet border border-rule rounded-sm flex flex-col gap-2">
          <Toggle
            checked={autoConfirm}
            onChange={setAutoConfirm}
            label="Confirm Invoices Automatically Upon Generation"
            disabled={!canWrite}
          />
          <p className="text-[12px] text-ink-2 pl-9">
            When turned OFF, newly generated invoices start in Draft status for team review.
            When turned ON, billing day generates Confirmed invoices immediately.
          </p>
        </div>

        {canWrite && (
          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" loading={loading}>
              Save Settings
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

