"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StateStepper } from "@/components/data/StateStepper";
import { Badge } from "@/components/ui/Badge";
import { DateText } from "@/components/ui/DateText";
import { Money } from "@/components/ui/Money";
import { Button } from "@/components/ui/Button";
import { ActionBar, ActionItem } from "@/components/data/ActionBar";
import { TotalsLedger } from "@/components/data/TotalsLedger";
import { HistoryList, StatusHistoryItem } from "@/components/data/HistoryList";
import { LineItemsEditor, LineItemColumn } from "@/components/data/LineItemsEditor";
import { useToast } from "@/components/ui/Toast";
import { calculateTotals } from "@/lib/pricing";
import {
  transitionSubscriptionAction,
  renewSubscriptionAction,
  billNowAction,
  saveSubscriptionLinesAction,
  type SubscriptionLineInput,
} from "../actions";

interface ProductOption {
  id: string;
  name: string;
  sales_price: number;
  default_tax_id?: string | null;
}

interface VariantOption {
  id: string;
  product_id: string;
  attribute: string;
  value: string;
  extra_price: number;
}

interface TaxOption {
  id: string;
  name: string;
  rate: number;
}

interface PlanData {
  id: string;
  name: string;
  billing_period: string;
  min_quantity: number;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
  auto_close: boolean;
}

interface SubscriptionData {
  id: string;
  number: string;
  status: string;
  start_date: string;
  expiry_date: string;
  next_invoice_date: string | null;
  quote_valid_until: string | null;
  notes: string | null;
  customer?: { id: string; name: string; email: string } | null;
  plan?: PlanData | null;
  payment_term?: { id: string; name: string; days: number } | null;
}

interface InvoiceSummary {
  id: string;
  number: string;
  status: string;
  invoice_date: string;
  due_date: string;
  total: number;
  amount_paid: number;
}

export interface SubscriptionDetailClientProps {
  subscription: SubscriptionData;
  initialLines: SubscriptionLineInput[];
  history: StatusHistoryItem[];
  invoices: InvoiceSummary[];
  products: ProductOption[];
  variants: VariantOption[];
  taxes: TaxOption[];
}

const STEPPER_STEPS = ["Draft", "Quotation", "Confirmed", "Active", "Closed"];

export function SubscriptionDetailClient({
  subscription,
  initialLines,
  history,
  invoices,
  products,
  variants,
  taxes,
}: SubscriptionDetailClientProps) {
  const toast = useToast();
  const [lines, setLines] = useState<SubscriptionLineInput[]>(initialLines);
  const [savingLines, setSavingLines] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const status = subscription.status;
  const isDraftOrQuotation = status === "draft" || status === "quotation";
  const isPaused = status === "paused";
  const plan = subscription.plan;
  const minQty = plan?.min_quantity || 1;

  // Calculate totals live for editor preview
  const lineTaxRates = lines.map((l) => {
    const tax = taxes.find((t) => t.id === l.tax_id);
    return tax ? Number(tax.rate) : 0;
  });

  const totals = calculateTotals(
    lines.map((l, i) => ({
      quantity: l.quantity,
      unit_price: l.unit_price,
      tax_rate: lineTaxRates[i] || 0,
    }))
  );

  // Line columns for LineItemsEditor
  const lineColumns: LineItemColumn<SubscriptionLineInput>[] = [
    {
      key: "product_id",
      label: "Product",
      width: "30%",
      renderCell: (item, _, update) => {
        if (!isDraftOrQuotation) {
          return <span>{item.description}</span>;
        }

        return (
          <select
            value={item.product_id || ""}
            onChange={(e) => {
              const pid = e.target.value;
              const prod = products.find((p) => p.id === pid);
              update({
                product_id: pid || null,
                variant_id: null,
                description: prod ? prod.name : item.description,
                unit_price: prod ? Number(prod.sales_price) : item.unit_price,
                tax_id: prod?.default_tax_id || item.tax_id,
              });
            }}
            className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-sans"
          >
            <option value="">Custom description...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "description",
      label: "Description",
      width: "30%",
      renderCell: (item, _, update) => {
        if (!isDraftOrQuotation) return <span>{item.description}</span>;

        return (
          <input
            type="text"
            value={item.description}
            onChange={(e) => update({ description: e.target.value })}
            className="w-full h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-sans"
          />
        );
      },
    },
    {
      key: "quantity",
      label: "Qty",
      width: "12%",
      align: "right",
      renderCell: (item, _, update) => {
        const hasMinQtyViolation = item.quantity < minQty;

        if (!isDraftOrQuotation) {
          return <span className="font-mono">{item.quantity}</span>;
        }

        return (
          <div className="flex flex-col items-end">
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                update({
                  quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
              className={`w-[60px] h-[32px] px-2 bg-sheet border rounded-sm text-[13px] font-mono text-right ${
                hasMinQtyViolation ? "border-bad text-bad" : "border-rule-strong"
              }`}
            />
            {hasMinQtyViolation && (
              <span className="text-[10px] text-bad font-mono">Min {minQty}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "unit_price",
      label: "Unit Price",
      width: "15%",
      align: "right",
      renderCell: (item, _, update) => {
        if (!isDraftOrQuotation) {
          return <Money value={item.unit_price} />;
        }

        return (
          <input
            type="number"
            step="0.01"
            value={item.unit_price}
            onChange={(e) =>
              update({ unit_price: parseFloat(e.target.value) || 0 })
            }
            className="w-[85px] h-[32px] px-2 bg-sheet border border-rule-strong rounded-sm text-[13px] font-mono text-right"
          />
        );
      },
    },
    {
      key: "line_total",
      label: "Amount",
      width: "13%",
      align: "right",
      renderCell: (item, idx) => {
        const lineTotal = totals.lines[idx]?.line_total ?? item.quantity * item.unit_price;
        return <Money value={lineTotal} />;
      },
    },
  ];

  async function handleTransition(toState: string) {
    setActionLoading(true);
    const res = await transitionSubscriptionAction(subscription.id, toState);
    setActionLoading(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleRenew() {
    setActionLoading(true);
    const res = await renewSubscriptionAction(subscription.id);
    setActionLoading(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleBillNow() {
    setActionLoading(true);
    const res = await billNowAction(subscription.id);
    setActionLoading(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  async function handleSaveLines() {
    setSavingLines(true);
    const res = await saveSubscriptionLinesAction(subscription.id, lines);
    setSavingLines(false);

    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  }

  // Construct Action Bar items by state
  const actions: ActionItem[] = [];

  if (status === "draft") {
    actions.push(
      {
        label: "Send for Quotation",
        variant: "primary",
        onClick: () => handleTransition("quotation"),
        disabled: actionLoading,
      },
      {
        label: "Close Subscription",
        variant: "danger",
        onClick: () => handleTransition("closed"),
        disabled: actionLoading,
      }
    );
  } else if (status === "quotation") {
    actions.push(
      {
        label: "Confirm Quotation",
        variant: "primary",
        onClick: () => handleTransition("confirmed"),
        disabled: actionLoading,
      },
      {
        label: "Back to Draft",
        variant: "secondary",
        onClick: () => handleTransition("draft"),
        disabled: actionLoading,
      },
      {
        label: "Close Subscription",
        variant: "danger",
        onClick: () => handleTransition("closed"),
        disabled: actionLoading,
      }
    );
  } else if (status === "confirmed") {
    actions.push(
      {
        label: "Activate Subscription",
        variant: "primary",
        onClick: () => handleTransition("active"),
        disabled: actionLoading,
      },
      {
        label: "Close Subscription",
        variant: "danger",
        onClick: () => handleTransition("closed"),
        disabled: actionLoading,
      }
    );
  } else if (status === "active") {
    if (plan?.pausable) {
      actions.push({
        label: "Pause Subscription",
        variant: "secondary",
        onClick: () => handleTransition("paused"),
        disabled: actionLoading,
      });
    }
    if (plan?.renewable) {
      actions.push({
        label: "Renew Subscription",
        variant: "secondary",
        onClick: handleRenew,
        disabled: actionLoading,
      });
    }
    actions.push({
      label: "Bill Now",
      variant: "primary",
      onClick: handleBillNow,
      disabled: actionLoading,
    });
    if (plan?.closable) {
      actions.push({
        label: "Close Subscription",
        variant: "danger",
        onClick: () => handleTransition("closed"),
        disabled: actionLoading,
      });
    }
  } else if (status === "paused") {
    actions.push(
      {
        label: "Resume Subscription",
        variant: "primary",
        onClick: () => handleTransition("active"),
        disabled: actionLoading,
      },
      {
        label: "Close Subscription",
        variant: "danger",
        onClick: () => handleTransition("closed"),
        disabled: actionLoading,
      }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/subscriptions"
            className="text-[13px] font-sans text-ink underline decoration-1 decoration-rule hover:text-ink-2"
          >
            Subscriptions
          </Link>
          <span className="text-rule">/</span>
          <h2 className="text-[18px] font-mono font-semibold text-ink">
            {subscription.number}
          </h2>
          <Badge status={status} />
        </div>

        {/* State Stepper */}
        <StateStepper
          steps={STEPPER_STEPS}
          current={isPaused ? "active" : status}
          badgeOverlay={isPaused ? "Paused" : undefined}
        />
      </div>

      {/* Action Bar */}
      {actions.length > 0 && <ActionBar actions={actions} />}

      {/* Main Grid: Left (2/3) Fields & Lines, Right (1/3) Totals, Invoices, History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Metadata Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-sheet border border-rule rounded-sm text-[13px] font-sans">
            <div>
              <span className="text-ink-2 text-[12px] block">Customer:</span>
              <span className="font-semibold text-ink">
                {subscription.customer?.name}
              </span>
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Plan:</span>
              <span className="font-semibold text-ink">
                {plan?.name} ({plan?.billing_period})
              </span>
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Start Date:</span>
              <DateText value={subscription.start_date} />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Expiry Date:</span>
              <DateText value={subscription.expiry_date} />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Payment Terms:</span>
              <span className="text-ink">{subscription.payment_term?.name}</span>
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Quote Validity:</span>
              <DateText value={subscription.quote_valid_until} fallback="N/A" />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Next Invoice:</span>
              <DateText
                value={subscription.next_invoice_date}
                fallback="Nothing due"
              />
            </div>
            <div>
              <span className="text-ink-2 text-[12px] block">Min Line Qty:</span>
              <span className="font-mono text-ink">{minQty}</span>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-sans font-semibold text-ink">
                  Contract Product Lines
                </h3>
                <p className="text-[12px] font-sans text-ink-2">
                  {isDraftOrQuotation
                    ? "Lines are editable in Draft and Quotation states."
                    : "Lines are locked once Confirmed or Active."}
                </p>
              </div>

              {isDraftOrQuotation && (
                <Button
                  variant="secondary"
                  onClick={handleSaveLines}
                  loading={savingLines}
                >
                  Save Line Items
                </Button>
              )}
            </div>

            <LineItemsEditor
              columns={lineColumns}
              items={lines}
              onChange={setLines}
              createDefaultItem={() => ({
                product_id: products[0]?.id || null,
                variant_id: null,
                description: products[0]?.name || "New line item",
                quantity: minQty,
                unit_price: Number(products[0]?.sales_price || 0),
                tax_id: products[0]?.default_tax_id || null,
              })}
              readOnly={!isDraftOrQuotation}
              addLabel="Add Product Line"
            />
          </div>
        </div>

        {/* Right Column (1 col): Totals Ledger, Invoices, History */}
        <div className="flex flex-col gap-6">
          {/* Totals Ledger Preview */}
          <div>
            <h3 className="text-[14px] font-sans font-semibold text-ink pb-2">
              Financial Preview
            </h3>
            <TotalsLedger
              subtotal={totals.subtotal}
              discountTotal={totals.discount_total}
              taxTotal={totals.tax_total}
              total={totals.total}
            />
          </div>

          {/* Invoices Generated for this Subscription */}
          <div className="border border-rule rounded-sm bg-sheet p-4 flex flex-col gap-3">
            <h3 className="text-[14px] font-sans font-semibold text-ink border-b border-rule pb-2">
              Generated Invoices ({invoices.length})
            </h3>
            {invoices.length === 0 ? (
              <p className="text-[13px] text-ink-2">No invoices generated yet.</p>
            ) : (
              <ul className="divide-y divide-rule text-[13px] font-sans">
                {invoices.map((inv) => (
                  <li
                    key={inv.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-mono underline text-ink hover:text-accent"
                      >
                        {inv.number}
                      </Link>
                      <Badge status={inv.status} />
                    </div>
                    <Money value={inv.total} className="font-semibold" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Transition History Audit */}
          <HistoryList items={history} />
        </div>
      </div>
    </div>
  );
}
