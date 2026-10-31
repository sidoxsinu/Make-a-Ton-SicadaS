import { z } from "zod";
import { defineResource } from "./types";

export const variantSchema = z.object({
  id: z.string().optional(),
  attribute: z.string().min(1, "Attribute is required (e.g. Brand, Tier)"),
  value: z.string().min(1, "Value is required (e.g. Odoo, Pro)"),
  extra_price: z.coerce.number().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  type: z.enum(["service", "goods", "digital"]).default("service"),
  sales_price: z.coerce.number().min(0, "Sales price must be >= 0"),
  cost_price: z.coerce.number().min(0, "Cost price must be >= 0").default(0),
  default_tax_id: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export const productsResource = defineResource({
  name: "products",
  table: "products",
  title: "Products & Services",
  singularTitle: "Product",
  permissions: {
    read: ["admin", "staff"],
    write: ["admin"],
  },
  columns: [
    { key: "name", label: "Product Name", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "sales_price", label: "Sales Price", type: "money", align: "right", sortable: true },
    { key: "cost_price", label: "Cost Price", type: "money", align: "right" },
    { key: "active", label: "Active", type: "boolean" },
  ],
  filters: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "service", label: "Service" },
        { value: "goods", label: "Goods" },
        { value: "digital", label: "Digital" },
      ],
    },
    { key: "active", label: "Active", type: "boolean" },
  ],
  fields: [
    { key: "name", label: "Product Name", type: "text", required: true, placeholder: "e.g. Odoo CRM" },
    {
      key: "type",
      label: "Product Type",
      type: "select",
      required: true,
      options: [
        { value: "service", label: "Service" },
        { value: "goods", label: "Goods" },
        { value: "digital", label: "Digital" },
      ],
      default: "service",
    },
    { key: "sales_price", label: "Sales Price (Tax Exclusive)", type: "number", required: true, min: 0, default: 1000 },
    { key: "cost_price", label: "Cost Price (Internal Team Only)", type: "number", default: 0 },
    { key: "notes", label: "Internal Notes", type: "textarea" },
    { key: "active", label: "Active", type: "toggle", default: true, placeholder: "Product is active and billable" },
  ],
  schema: productSchema,
  search: ["name"],
  defaultSort: { key: "name", dir: "asc" },
});

