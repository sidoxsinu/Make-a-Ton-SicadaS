"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { DateText } from "@/components/ui/DateText";
import { useToast } from "@/components/ui/Toast";
import { getDiscountStatus } from "@/lib/resources/discounts";
import { saveDiscountTargetsAction } from "../actions";

interface ProductItem {
  id: string;
  name: string;
  sales_price: number;
}

interface SubscriptionItem {
  id: string;
  customer_name?: string;
  plan_name?: string;
  status: string;
  next_invoice_date?: string | null;
}

interface DiscountDetailClientProps {
  discount: {
    id: string;
    name: string;
    scope: "product" | "subscription";
    kind: "percent" | "fixed";
    value: number;
    min_purchase: number;
    min_quantity: number;
    starts_on?: string | null;
    ends_on?: string | null;
    usage_limit?: number | null;
    used_count: number;
    active: boolean;
    created_at: string;
  };
  targetProductIds: string[];
  targetSubscriptionIds: string[];
  allProducts: ProductItem[];
  allSubscriptions: SubscriptionItem[];
  recentInvoices: Array<{
    id: string;
    number: string;
    invoice_date: string;
    total: number;
    status: string;
  }>;
  canEdit: boolean;
}

export function DiscountDetailClient({
  discount,
  targetProductIds: initialProductIds,
  targetSubscriptionIds: initialSubscriptionIds,
  allProducts,
  allSubscriptions,
  recentInvoices,
  canEdit,
}: DiscountDetailClientProps) {
  const toast = useToast();
  const [selectedProductIds, setSelectedProductIds] =
    useState<string[]>(initialProductIds);
  const [selectedSubIds, setSelectedSubIds] =
    useState<string[]>(initialSubscriptionIds);
  const [saving, setSaving] = useState(false);

  const status = getDiscountStatus(discount);

  async function handleSaveTargets() {
    setSaving(true);
    const targetIds =
      discount.scope === "product" ? selectedProductIds : selectedSubIds;
    const res = await saveDiscountTargetsAction(
      discount.id,
      discount.scope,
      targetIds
    );
    setSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Discount targets updated successfully");
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/discounts"
          className="font-mono text-[12px] text-ink-2 hover:text-accent underline underline-offset-2"
        >
          &larr; Back to Discounts
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-sans text-[20px] font-semibold text-ink">
                {discount.name}
              </h1>
              <Badge status={status} />
              <Badge
                status="active"
                label={discount.scope === "product" ? "Product Scope" : "Subscription Scope"}
              />
              {!discount.active && <Badge status="closed" label="Inactive" />}
            </div>
            <p className="mt-1 font-mono text-[12px] text-ink-2">
              ID: {discount.id}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Details Ledger + Target Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Properties Ledger */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-rule bg-canvas p-4 space-y-3">
            <h2 className="font-sans text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-rule pb-2">
              Discount Rules
            </h2>

            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-ink-2">Discount Kind</span>
                <span className="font-mono font-medium text-ink uppercase">
                  {discount.kind}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-2">Value</span>
                <span className="font-mono font-semibold text-ink">
                  {discount.kind === "percent" ? (
                    `${discount.value}%`
                  ) : (
                    <Money value={discount.value} />
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-2">Min. Purchase</span>
                <span className="font-mono text-ink">
                  <Money value={discount.min_purchase} />
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-2">Min. Quantity</span>
                <span className="font-mono text-ink">
                  {discount.min_quantity}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-2">Starts On</span>
                <span className="font-mono text-ink">
                  {discount.starts_on ? (
                    <DateText value={discount.starts_on} />
                  ) : (
                    "Immediate"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-2">Ends On</span>
                <span className="font-mono text-ink">
                  {discount.ends_on ? (
                    <DateText value={discount.ends_on} />
                  ) : (
                    "No Expiry"
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-ink-2">Times Used</span>
                <span className="font-mono text-ink">
                  {discount.used_count}{" "}
                  {discount.usage_limit != null && ` / ${discount.usage_limit}`}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Activity List */}
          <div className="border border-rule bg-canvas p-4 space-y-3">
            <h2 className="font-sans text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-rule pb-2">
              Recent Invoices Using Discount
            </h2>

            {recentInvoices.length === 0 ? (
              <p className="font-mono text-[12px] text-ink-2">
                No invoices have claimed this discount yet.
              </p>
            ) : (
              <ul className="divide-y divide-rule font-mono text-[12px]">
                {recentInvoices.map((inv) => (
                  <li key={inv.id} className="py-2 flex justify-between items-center">
                    <div>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-ink hover:text-accent underline underline-offset-2"
                      >
                        {inv.number}
                      </Link>
                      <span className="ml-2 text-ink-2">{inv.invoice_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Money value={inv.total} />
                      <Badge status={inv.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Targets Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-rule bg-canvas p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h2 className="font-sans text-[14px] font-semibold text-ink uppercase tracking-wide">
                  {discount.scope === "product"
                    ? "Eligible Products"
                    : "Target Subscriptions"}
                </h2>
                <p className="font-sans text-[12px] text-ink-2 mt-0.5">
                  {discount.scope === "product"
                    ? "Select products that receive this discount. The best single eligible discount applies per line item."
                    : "Select subscriptions that can receive this discount. If none are selected, it applies globally to all subscriptions."}
                </p>
              </div>

              {canEdit && (
                <Button
                  variant="primary"
                  loading={saving}
                  onClick={handleSaveTargets}
                >
                  Save Targets
                </Button>
              )}
            </div>

            {discount.scope === "product" ? (
              /* Product Target Checkboxes */
              <div className="space-y-2">
                <div className="flex justify-between text-[12px] text-ink-2 pb-1 border-b border-rule">
                  <span>Product</span>
                  <span>Base Price</span>
                </div>
                {allProducts.length === 0 ? (
                  <p className="font-mono text-[12px] text-ink-2 py-4">
                    No products exist in the catalog.
                  </p>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-rule">
                    {allProducts.map((p) => {
                      const isChecked = selectedProductIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between py-2.5 px-2 hover:bg-canvas-subtle cursor-pointer ${
                            isChecked ? "bg-canvas-subtle" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!canEdit}
                              onChange={(e) => {
                                setSelectedProductIds((prev) =>
                                  e.target.checked
                                    ? [...prev, p.id]
                                    : prev.filter((id) => id !== p.id)
                                );
                              }}
                              className="accent-accent"
                            />
                            <span className="font-sans text-[13px] text-ink font-medium">
                              {p.name}
                            </span>
                          </div>
                          <span className="font-mono text-[12px] text-ink-2">
                            <Money value={p.sales_price} />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Subscription Target Checkboxes */
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-rule text-[12px] text-ink-2">
                  <span>
                    {selectedSubIds.length === 0
                      ? "Global Scope: Applies to all subscriptions"
                      : `Restricted to ${selectedSubIds.length} subscription(s)`}
                  </span>
                  {selectedSubIds.length > 0 && canEdit && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubIds([])}
                      className="text-bad underline hover:opacity-80"
                    >
                      Clear Selection (Make Global)
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto divide-y divide-rule">
                  {allSubscriptions.map((s) => {
                    const isChecked = selectedSubIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between py-2.5 px-2 hover:bg-canvas-subtle cursor-pointer ${
                          isChecked ? "bg-canvas-subtle" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!canEdit}
                            onChange={(e) => {
                              setSelectedSubIds((prev) =>
                                e.target.checked
                                  ? [...prev, s.id]
                                  : prev.filter((id) => id !== s.id)
                              );
                            }}
                            className="accent-accent"
                          />
                          <div>
                            <span className="font-sans text-[13px] text-ink font-medium">
                              {s.customer_name || "Customer"}
                            </span>
                            <span className="ml-2 font-mono text-[11px] text-ink-2">
                              {s.plan_name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge status={s.status} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
