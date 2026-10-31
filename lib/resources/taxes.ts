import { z } from "zod";
import { defineResource } from "./types";

export const taxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rate: z.coerce.number().min(0, "Rate must be >= 0").max(100, "Rate must be <= 100"),
  active: z.boolean().default(true),
});

export const taxesResource = defineResource({
  name: "taxes",
  table: "taxes",
  title: "Taxes",
  singularTitle: "Tax",
  permissions: {
    read: ["admin", "staff"],
    write: ["admin"],
  },
  columns: [
    { key: "name", label: "Name", sortable: true },
    { key: "rate", label: "Rate", type: "percent", align: "right", sortable: true },
    { key: "active", label: "Active", type: "boolean" },
  ],
  filters: [{ key: "active", label: "Active", type: "boolean" }],
  fields: [
    { key: "name", label: "Tax Name", type: "text", required: true, placeholder: "e.g. GST 18%" },
    { key: "rate", label: "Rate (%)", type: "number", required: true, min: 0, max: 100, default: 18 },
    { key: "active", label: "Active", type: "toggle", default: true, placeholder: "Tax rate active and selectable" },
  ],
  schema: taxSchema,
  search: ["name"],
  defaultSort: { key: "name", dir: "asc" },
});
