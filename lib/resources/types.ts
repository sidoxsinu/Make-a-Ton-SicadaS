import type { z } from "zod";
import type { UserRole } from "@/lib/roles";

export type ColumnType =
  | "text"
  | "number"
  | "money"
  | "date"
  | "boolean"
  | "badge"
  | "percent"
  | "custom";

export interface ResourceColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  type?: ColumnType;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  render?: (row: T, index?: number) => React.ReactNode;
}

export interface ResourceFilter {
  key: string;
  label: string;
  type: "text" | "select" | "boolean";
  options?: { value: string; label: string }[];
}

export interface ResourceField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "toggle" | "textarea" | "custom";
  required?: boolean;
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  default?: unknown;
}

export interface ResourceConfig<T = Record<string, unknown>> {
  name: string;
  table: string;
  title: string;
  singularTitle: string;
  permissions: {
    read: UserRole[];
    write: UserRole[];
  };
  columns: ResourceColumn<T>[];
  filters?: ResourceFilter[];
  fields: ResourceField[];
  schema: z.ZodTypeAny;
  search?: string[];
  defaultSort?: { key: string; dir: "asc" | "desc" };
}

export function defineResource<T = Record<string, unknown>>(
  config: ResourceConfig<T>
): ResourceConfig<T> {
  return config;
}
