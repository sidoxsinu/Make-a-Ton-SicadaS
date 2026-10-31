import React from "react";
import { z } from "zod";
import { defineResource } from "./types";
import { Badge } from "@/components/ui/Badge";

export type DiscountStatus =
  | "scheduled"
  | "running"
  | "expired"
  | "exhausted"
  | "inactive";

export function getDiscountStatus(row: {
  active: boolean;
  starts_on?: string | null;
  ends_on?: string | null;
  usage_limit?: number | null;
  used_count: number;
}): DiscountStatus {
  if (!row.active) return "inactive";

  const today = new Date().toISOString().split("T")[0];

  if (row.starts_on && row.starts_on > today) {
    return "scheduled";
  }
  if (row.ends_on && row.ends_on < today) {
    return "expired";
  }
  if (row.usage_limit != null && row.used_count >= row.usage_limit) {
    return "exhausted";
  }
  return "running";
}

export const discountSchema = z
  .object({
    name: z.string().min(1, "Discount name is required"),
    kind: z.enum(["percent", "fixed"]),
    value: z.coerce.number().positive("Value must be greater than 0"),
    scope: z.enum(["product", "subscription"]),
    min_purchase: z.coerce.number().min(0, "Min purchase must be >= 0").default(0),
    min_quantity: z.coerce.number().int().min(0, "Min quantity must be >= 0").default(0),
    starts_on: z.string().optional().nullable(),
    ends_on: z.string().optional().nullable(),
    usage_limit: z.coerce.number().int().positive("Usage limit must be positive").optional().nullable(),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => data.kind !== "percent" || data.value <= 100,
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    }
  )
  .refine(
    (data) => !data.ends_on || !data.starts_on || data.ends_on >= data.starts_on,
    {
      message: "End date must be on or after start date",
      path: ["ends_on"],
    }
  );

export const discountsResource = defineResource({
  name: "discounts",
  table: "discounts",
  title: "Discounts & Promotions",
  singularTitle: "Discount",
  permissions: {
    read: ["admin", "staff"],
    write: ["admin"],
  },
  columns: [
    { key: "name", label: "Discount Name", sortable: true },
    { key: "scope", label: "Scope", type: "badge", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (row: Record<string, unknown>) => {
        const s = getDiscountStatus(row as unknown as {
          active: boolean;
          starts_on?: string | null;
          ends_on?: string | null;
          usage_limit?: number | null;
          used_count: number;
        });
        return React.createElement(Badge, { status: s });
      },
    },
    { key: "kind", label: "Type", sortable: true },
    {
      key: "value",
      label: "Value",
      align: "right",
      sortable: true,
      render: (row: Record<string, unknown>) => {
        if (row.kind === "percent") {
          return `${Number(row.value).toFixed(2)}%`;
        }
        return `₹${Number(row.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
      },
    },
    { key: "min_purchase", label: "Min Purchase", type: "money", align: "right" },
    { key: "min_quantity", label: "Min Qty", type: "number", align: "right" },
    {
      key: "usage",
      label: "Usage",
      align: "right",
      render: (row: Record<string, unknown>) => {
        const used = Number(row.used_count || 0);
        const limit = row.usage_limit != null ? Number(row.usage_limit) : "∞";
        return `${used} / ${limit}`;
      },
    },
  ],
  filters: [
    {
      key: "scope",
      label: "Scope",
      type: "select",
      options: [
        { value: "product", label: "Product Level" },
        { value: "subscription", label: "Subscription Level" },
      ],
    },
    {
      key: "kind",
      label: "Kind",
      type: "select",
      options: [
        { value: "percent", label: "Percentage" },
        { value: "fixed", label: "Fixed Amount" },
      ],
    },
    { key: "active", label: "Active", type: "boolean" },
  ],
  fields: [
    { key: "name", label: "Discount Name", type: "text", required: true, placeholder: "e.g. Summer Launch 10%" },
    {
      key: "scope",
      label: "Scope",
      type: "select",
      required: true,
      options: [
        { value: "product", label: "Product Level (Applies to specific products)" },
        { value: "subscription", label: "Subscription Level (Applies to whole contract)" },
      ],
      default: "product",
    },
    {
      key: "kind",
      label: "Discount Kind",
      type: "select",
      required: true,
      options: [
        { value: "percent", label: "Percentage (%)" },
        { value: "fixed", label: "Fixed Amount" },
      ],
      default: "percent",
    },
    {
      key: "value",
      label: "Discount Value",
      type: "number",
      required: true,
      placeholder: "e.g. 10 for 10% or 500 for fixed",
    },
    {
      key: "min_purchase",
      label: "Minimum Purchase Amount",
      type: "number",
      placeholder: "0.00",
      default: 0,
    },
    {
      key: "min_quantity",
      label: "Minimum Item Quantity",
      type: "number",
      placeholder: "0",
      default: 0,
    },
    {
      key: "starts_on",
      label: "Starts On",
      type: "date",
    },
    {
      key: "ends_on",
      label: "Ends On",
      type: "date",
    },
    {
      key: "usage_limit",
      label: "Usage Limit (Leave blank for unlimited)",
      type: "number",
      placeholder: "e.g. 100",
    },
    {
      key: "active",
      label: "Active",
      type: "toggle",
      default: true,
    },
  ],
  schema: discountSchema,
  search: ["name"],
  defaultSort: { key: "created_at", dir: "desc" },
});
