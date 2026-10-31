import { z } from "zod";
import { defineResource } from "./types";

export const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  validity_days: z.coerce.number().int().min(1, "Validity days must be >= 1").default(30),
  plan_id: z.string().min(1, "Plan selection is required"),
  notes: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export const templatesResource = defineResource({
  name: "quotation_templates",
  table: "quotation_templates",
  title: "Quotation Templates",
  singularTitle: "Template",
  permissions: {
    read: ["admin", "staff"],
    write: ["admin"],
  },
  columns: [
    { key: "name", label: "Template Name", sortable: true },
    { key: "validity_days", label: "Validity (Days)", type: "number", align: "right" },
    { key: "active", label: "Active", type: "boolean" },
  ],
  fields: [
    { key: "name", label: "Template Name", type: "text", required: true, placeholder: "e.g. Standard Odoo Deployment" },
    { key: "validity_days", label: "Quote Validity (Days)", type: "number", required: true, min: 1, default: 30 },
    { key: "plan_id", label: "Linked Plan ID", type: "text", required: true, placeholder: "UUID of linked plan" },
    { key: "notes", label: "Template Notes / T&Cs", type: "textarea" },
    { key: "active", label: "Active", type: "toggle", default: true, placeholder: "Template is selectable for quotations" },
  ],
  schema: templateSchema,
  search: ["name"],
  defaultSort: { key: "name", dir: "asc" },
});
