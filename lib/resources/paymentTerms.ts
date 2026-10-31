import { z } from "zod";
import { defineResource } from "./types";

export const paymentTermSchema = z.object({
  name: z.string().min(1, "Name is required"),
  days: z.coerce.number().int().min(0, "Days must be >= 0"),
});

export const paymentTermsResource = defineResource({
  name: "payment_terms",
  table: "payment_terms",
  title: "Payment Terms",
  singularTitle: "Payment Term",
  permissions: {
    read: ["admin", "staff"],
    write: ["admin"],
  },
  columns: [
    { key: "name", label: "Term Name", sortable: true },
    { key: "days", label: "Due Days", type: "number", align: "right", sortable: true },
  ],
  fields: [
    { key: "name", label: "Term Name", type: "text", required: true, placeholder: "e.g. Net 30" },
    { key: "days", label: "Days until due", type: "number", required: true, min: 0, default: 30 },
  ],
  schema: paymentTermSchema,
  search: ["name"],
  defaultSort: { key: "days", dir: "asc" },
});

