import { z } from "zod";
import { defineResource } from "./types";

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tax_number: z.string().optional().nullable(),
});

export const customersResource = defineResource({
  name: "customers",
  table: "customers",
  title: "Customers",
  singularTitle: "Customer",
  permissions: {
    read: ["admin", "staff"],
    write: ["admin", "staff"],
  },
  columns: [
    { key: "name", label: "Customer Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "company", label: "Company" },
    { key: "phone", label: "Phone" },
    { key: "tax_number", label: "Tax ID / GSTIN" },
  ],
  fields: [
    { key: "name", label: "Full Name / Trade Name", type: "text", required: true },
    { key: "email", label: "Email Address", type: "text", required: true },
    { key: "company", label: "Company Name", type: "text" },
    { key: "phone", label: "Phone Number", type: "text" },
    { key: "address", label: "Billing Address", type: "textarea" },
    { key: "tax_number", label: "Tax ID / GSTIN", type: "text" },
  ],
  schema: customerSchema,
  search: ["name", "email", "company"],
  defaultSort: { key: "name", dir: "asc" },
});
