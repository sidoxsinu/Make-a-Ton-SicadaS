import { z } from "zod";
import { defineResource } from "./types";

export const planSchema = z
  .object({
    name: z.string().min(1, "Plan name is required"),
    price: z.coerce.number().min(0, "Price must be >= 0").default(0),
    billing_period: z.enum(["daily", "weekly", "monthly", "yearly"]),
    min_quantity: z.coerce.number().int().min(1, "Minimum quantity must be >= 1").default(1),
    available_from: z.string().min(1, "Start date is required"),
    available_to: z.string().optional().nullable(),
    auto_close: z.boolean().default(false),
    closable: z.boolean().default(true),
    pausable: z.boolean().default(false),
    renewable: z.boolean().default(false),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => !data.available_to || data.available_to >= data.available_from,
    {
      message: "End date must be on or after start date",
      path: ["available_to"],
    }
  );

export const plansResource = defineResource({
  name: "plans",
  table: "plans",
  title: "Subscription Plans",
  singularTitle: "Plan",
  permissions: {
    read: ["admin", "staff"],
    write: ["admin"],
  },
  columns: [
    { key: "name", label: "Plan Name", sortable: true },
    { key: "billing_period", label: "Period", sortable: true },
    { key: "price", label: "Base Price", type: "money", align: "right", sortable: true },
    { key: "min_quantity", label: "Min Qty", type: "number", align: "right" },
    { key: "pausable", label: "Pausable", type: "boolean" },
    { key: "closable", label: "Closable Early", type: "boolean" },
    { key: "renewable", label: "Renewable", type: "boolean" },
    { key: "auto_close", label: "Auto Close", type: "boolean" },
    { key: "active", label: "Active", type: "boolean" },
  ],
  filters: [
    {
      key: "billing_period",
      label: "Billing Period",
      type: "select",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
      ],
    },
    { key: "active", label: "Active", type: "boolean" },
  ],
  fields: [
    { key: "name", label: "Plan Name", type: "text", required: true, placeholder: "e.g. Enterprise Monthly" },
    {
      key: "billing_period",
      label: "Billing Cadence",
      type: "select",
      required: true,
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
      ],
      default: "monthly",
    },
    { key: "price", label: "Base Plan Fee (optional line)", type: "number", default: 0 },
    { key: "min_quantity", label: "Minimum Product Quantity", type: "number", default: 1, min: 1 },
    { key: "available_from", label: "Available From Date", type: "date", required: true, default: new Date().toISOString().split("T")[0] },
    { key: "available_to", label: "Available To Date (optional)", type: "date" },
    { key: "closable", label: "Can be closed early", type: "toggle", default: true, placeholder: "Allow closing active subscription before expiry" },
    { key: "pausable", label: "Can be paused", type: "toggle", default: false, placeholder: "Allow customer/team to pause and resume billing" },
    { key: "renewable", label: "Can be renewed", type: "toggle", default: false, placeholder: "Allow renewing for another term upon expiry" },
    { key: "auto_close", label: "Close automatically at expiry", type: "toggle", default: false, placeholder: "System closes subscription after last invoice" },
    { key: "active", label: "Active", type: "toggle", default: true, placeholder: "Plan is active and selectable for new subscriptions" },
  ],
  schema: planSchema,
  search: ["name"],
  defaultSort: { key: "name", dir: "asc" },
});
