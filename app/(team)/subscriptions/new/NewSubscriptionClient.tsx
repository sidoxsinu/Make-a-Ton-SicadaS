"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextInput, DateInput, Select, TextArea } from "@/components/ui/Inputs";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import {
  createFromTemplateAction,
  createBlankSubscriptionAction,
} from "../actions";

interface OptionItem {
  id: string;
  name: string;
  validity_days?: number;
}

export interface NewSubscriptionClientProps {
  customers: OptionItem[];
  plans: OptionItem[];
  templates: OptionItem[];
  paymentTerms: OptionItem[];
}

export function NewSubscriptionClient({
  customers,
  plans,
  templates,
  paymentTerms,
}: NewSubscriptionClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState("template");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Template Form State
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [termId, setTermId] = useState(paymentTerms[0]?.id || "");
  const [startDate, setStartDate] = useState(today);
  const [expiryDate, setExpiryDate] = useState(nextYear);

  // Blank Form State
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [notes, setNotes] = useState("");

  async function handleCreateFromTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId || !customerId || !termId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);

    const res = await createFromTemplateAction({
      templateId,
      customerId,
      paymentTermId: termId,
      startDate,
      expiryDate,
    });
    setLoading(false);

    if (res.ok && res.id) {
      toast.success("Subscription created from template!");
      router.push(`/subscriptions/${res.id}`);
    } else {
      toast.error(res.message || "Failed to create subscription.");
    }
  }

  async function handleCreateBlank(e: React.FormEvent) {
    e.preventDefault();
    if (!planId || !customerId || !termId) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);

    const res = await createBlankSubscriptionAction({
      planId,
      customerId,
      paymentTermId: termId,
      startDate,
      expiryDate,
      notes,
    });
    setLoading(false);

    if (res.ok && res.id) {
      toast.success("Draft subscription created!");
      router.push(`/subscriptions/${res.id}`);
    } else {
      toast.error(res.message || "Failed to create subscription.");
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[560px]">
      <div className="flex items-center gap-3 border-b border-rule pb-3">
        <Link
          href="/subscriptions"
          className="text-[13px] font-sans text-ink underline decoration-1 decoration-rule hover:text-ink-2"
        >
          Subscriptions
        </Link>
        <span className="text-rule">/</span>
        <h2 className="text-[18px] font-sans font-semibold text-ink">
          New Subscription
        </h2>
      </div>

      <Tabs
        items={[
          { key: "template", label: "From Quotation Template" },
          { key: "blank", label: "Blank Draft" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "template" && (
        <form onSubmit={handleCreateFromTemplate} className="flex flex-col gap-4">
          <Field label="Quotation Template" name="template" required>
            <Select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              options={templates.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Field>

          <Field label="Customer" name="customer" required>
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" name="start_date" required>
              <DateInput
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="Expiry Date" name="expiry_date" required>
              <DateInput
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Payment Terms" name="term" required>
            <Select
              value={termId}
              onChange={(e) => setTermId(e.target.value)}
              options={paymentTerms.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Field>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-rule">
            <Button variant="secondary" href="/subscriptions">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create Subscription
            </Button>
          </div>
        </form>
      )}

      {tab === "blank" && (
        <form onSubmit={handleCreateBlank} className="flex flex-col gap-4">
          <Field label="Customer" name="customer" required>
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>

          <Field label="Subscription Plan" name="plan" required>
            <Select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              options={plans.map((p) => ({ value: p.id, label: p.name }))}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" name="start_date" required>
              <DateInput
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="Expiry Date" name="expiry_date" required>
              <DateInput
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Payment Terms" name="term" required>
            <Select
              value={termId}
              onChange={(e) => setTermId(e.target.value)}
              options={paymentTerms.map((t) => ({ value: t.id, label: t.name }))}
            />
          </Field>

          <Field label="Internal Notes" name="notes">
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contract or customer reference notes"
            />
          </Field>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-rule">
            <Button variant="secondary" href="/subscriptions">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Create Draft Subscription
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
