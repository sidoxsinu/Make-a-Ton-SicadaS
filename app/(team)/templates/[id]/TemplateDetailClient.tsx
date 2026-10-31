"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LineItemsEditor, LineItemColumn } from "@/components/data/LineItemsEditor";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { saveTemplateLinesAction, type TemplateLineItem } from "./actions";

interface ProductOption {
  id: string;
  name: string;
  sales_price: number;
}

interface VariantOption {
  id: string;
  product_id: string;
  attribute: string;
  value: string;
  extra_price: number;
}

interface TemplateRow {
  id: string;
  name: string;
  validity_days: number;
  plan_id: string;
  notes: string | null;
  active: boolean;
}

export interface TemplateDetailClientProps {
  template: TemplateRow;
  initialLines: TemplateLineItem[];
  products: ProductOption[];
  variants: VariantOption[];
}

export function TemplateDetailClient({
  template,
  initialLines,
  products,
  variants,
}: TemplateDetailClientProps) {
  const toast = useToast();
  const [lines, setLines] = useState<TemplateLineItem[]>(initialLines);
  const [saving, setSaving] = useState(false);

  const columns: LineItemColumn<TemplateLineItem>[] = [
    {
      key: "product_id",
      label: "Product",
      width: "50%",
      renderCell: (item, _, update) => (
        <select
          value={item.product_id}
          onChange={(e) =>
            update({ product_id: e.target.value, variant_id: null })
          }
          className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-sans"
        >
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "variant_id",
      label: "Variant (Optional)",
      width: "35%",
      renderCell: (item, _, update) => {
        const availableVariants = variants.filter(
          (v) => v.product_id === item.product_id
        );

        return (
          <select
            value={item.variant_id || ""}
            onChange={(e) => update({ variant_id: e.target.value || null })}
            disabled={!item.product_id || availableVariants.length === 0}
            className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-sans disabled:opacity-40"
          >
            <option value="">No variant (Base price)</option>
            {availableVariants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.attribute}: {v.value} (+{v.extra_price})
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "quantity",
      label: "Quantity",
      width: "15%",
      align: "right",
      renderCell: (item, _, update) => (
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) =>
            update({ quantity: Math.max(1, parseInt(e.target.value, 10) || 1) })
          }
          className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-mono text-right"
        />
      ),
    },
  ];

  async function handleSaveLines() {
    // Validate each line has a product selected
    for (const l of lines) {
      if (!l.product_id) {
        toast.error("Every line must have a product selected.");
        return;
      }
    }

    setSaving(true);
    const res = await saveTemplateLinesAction(template.id, lines);
    setSaving(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="text-[13px] font-sans text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Templates
          </Link>
          <span className="text-rule">/</span>
          <h2 className="text-[18px] font-sans font-semibold text-ink">
            {template.name}
          </h2>
        </div>
      </div>

      {/* Template Metadata definition ledger */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-sheet border border-rule rounded-sm text-[13px] font-sans">
        <div>
          <span className="text-ink-2 text-[12px] block">Validity:</span>
          <span className="font-mono text-ink text-[15px]">
            {template.validity_days} Days
          </span>
        </div>
        <div>
          <span className="text-ink-2 text-[12px] block">Linked Plan ID:</span>
          <span className="font-mono text-[13px] text-ink truncate block">
            {template.plan_id}
          </span>
        </div>
        <div>
          <span className="text-ink-2 text-[12px] block">Status:</span>
          <span
            className={`font-mono uppercase font-semibold ${
              template.active ? "text-ok" : "text-ink-2"
            }`}
          >
            {template.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Template Lines */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-sans font-semibold text-ink">
              Template Product Lines
            </h3>
            <p className="text-[12px] font-sans text-ink-2">
              Default lines and quantities cloned when turning a quotation into a subscription.
            </p>
          </div>
          <Button variant="primary" onClick={handleSaveLines} loading={saving}>
            Save Template Lines
          </Button>
        </div>

        <LineItemsEditor
          columns={columns}
          items={lines}
          onChange={setLines}
          createDefaultItem={() => ({
            product_id: products[0]?.id || "",
            variant_id: null,
            quantity: 1,
          })}
          addLabel="Add Line Item"
        />
      </div>
    </div>
  );
}

