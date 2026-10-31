"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LineItemsEditor, LineItemColumn } from "@/components/data/LineItemsEditor";
import { Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { useToast } from "@/components/ui/Toast";
import { saveProductVariantsAction, type VariantItem } from "./actions";

interface ProductRow {
  id: string;
  name: string;
  type: string;
  sales_price: number;
  cost_price: number;
  notes: string | null;
  active: boolean;
}

export interface ProductDetailClientProps {
  product: ProductRow;
  initialVariants: VariantItem[];
}

export function ProductDetailClient({
  product,
  initialVariants,
}: ProductDetailClientProps) {
  const toast = useToast();
  const [variants, setVariants] = useState<VariantItem[]>(initialVariants);
  const [saving, setSaving] = useState(false);

  const columns: LineItemColumn<VariantItem>[] = [
    {
      key: "attribute",
      label: "Attribute",
      width: "30%",
      renderCell: (item, _, update) => (
        <input
          type="text"
          value={item.attribute}
          onChange={(e) => update({ attribute: e.target.value })}
          placeholder="e.g. Brand, Tier"
          className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-sans"
        />
      ),
    },
    {
      key: "value",
      label: "Value",
      width: "30%",
      renderCell: (item, _, update) => (
        <input
          type="text"
          value={item.value}
          onChange={(e) => update({ value: e.target.value })}
          placeholder="e.g. Odoo, Enterprise"
          className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-sans"
        />
      ),
    },
    {
      key: "extra_price",
      label: "Extra Price",
      width: "20%",
      align: "right",
      renderCell: (item, _, update) => (
        <input
          type="number"
          value={item.extra_price}
          onChange={(e) => update({ extra_price: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-mono text-right"
        />
      ),
    },
    {
      key: "final_price",
      label: "Final Price (Computed)",
      width: "20%",
      align: "right",
      renderCell: (item) => {
        const finalPrice = Number(product.sales_price || 0) + Number(item.extra_price || 0);
        return <Money value={finalPrice} />;
      },
    },
  ];

  async function handleSaveVariants() {
    setSaving(true);
    const res = await saveProductVariantsAction(product.id, variants);
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
            href="/products"
            className="text-[13px] font-sans text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Products
          </Link>
          <span className="text-rule">/</span>
          <h2 className="text-[18px] font-sans font-semibold text-ink">
            {product.name}
          </h2>
        </div>
      </div>

      {/* Product Summary definition ledger */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-sheet border border-rule rounded-sm text-[13px] font-sans">
        <div>
          <span className="text-ink-2 text-[12px] block">Base Sales Price:</span>
          <Money value={product.sales_price} className="font-semibold text-[15px]" />
        </div>
        <div>
          <span className="text-ink-2 text-[12px] block">Cost Price (Team):</span>
          <Money value={product.cost_price} className="text-ink-2 text-[15px]" />
        </div>
        <div>
          <span className="text-ink-2 text-[12px] block">Type:</span>
          <span className="font-mono uppercase text-ink">{product.type}</span>
        </div>
        <div>
          <span className="text-ink-2 text-[12px] block">Status:</span>
          <span className={`font-mono uppercase font-semibold ${product.active ? "text-ok" : "text-ink-2"}`}>
            {product.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Variants Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-sans font-semibold text-ink">
              Product Variants & Price Adjustments
            </h3>
            <p className="text-[12px] font-sans text-ink-2">
              Extra prices are added on top of base sales price during line item creation.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleSaveVariants}
            loading={saving}
          >
            Save Variants
          </Button>
        </div>

        <LineItemsEditor
          columns={columns}
          items={variants}
          onChange={setVariants}
          createDefaultItem={() => ({
            attribute: "",
            value: "",
            extra_price: 0,
          })}
          addLabel="Add Variant"
        />
      </div>
    </div>
  );
}

