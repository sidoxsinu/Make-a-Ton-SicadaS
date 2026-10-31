import type { z } from "zod";
import type { Permission } from "@/lib/roles";
import type { FilterOption, SortDir } from "@/lib/listParams";

export type ColumnType =
  | "text"
  | "number"
  | "money"
  | "percent"
  | "date"
  | "boolean"
  | "badge";

export interface ResourceColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: ColumnType;
  align?: "left" | "right" | "center";
}

export interface ResourceFilter {
  key: string;
  type: "text" | "select" | "boolean" | "date";
  label?: string;
  options?: FilterOption[];
}

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "toggle";

export interface ResourceField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  default?: string | number | boolean;
  help?: string;
  options?: FilterOption[];
}

export interface ResourceDefinition {
  name: string;
  table: string;
  title: string;
  permissions: Permission;
  columns: ResourceColumn[];
  filters?: ResourceFilter[];
  fields: ResourceField[];
  schema: z.ZodTypeAny;
  search?: string[];
  // Route segment. Defaults to the kebab case of name (paymentTerms becomes payment-terms).
  path?: string;
  // false when the resource has no detail route. Rows then link to ?edit=ID.
  detail?: boolean;
  defaultSort?: { key: string; dir: SortDir };
}

export interface Resource extends ResourceDefinition {
  path: string;
  detail: boolean;
  filters: ResourceFilter[];
  search: string[];
}

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export function defineResource(definition: ResourceDefinition): Resource {
  return {
    ...definition,
    path: `/${definition.path ?? kebab(definition.name)}`.replace(/^\/\//, "/"),
    detail: definition.detail ?? true,
    filters: definition.filters ?? [],
    search: definition.search ?? [],
  };
}
