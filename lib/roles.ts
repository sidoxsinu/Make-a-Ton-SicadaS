// Single permission map. Navigation, server actions, resource configs and
// button visibility all read from here. The database remains the authority.

export const ROLES = ["admin", "staff", "customer"] as const;
export type Role = (typeof ROLES)[number];

export const TEAM_ROLES: readonly Role[] = ["admin", "staff"];

export interface Permission {
  read: readonly Role[];
  write: readonly Role[];
}

const TEAM: readonly Role[] = ["admin", "staff"];
const ADMIN: readonly Role[] = ["admin"];
const CUSTOMER: readonly Role[] = ["customer"];
const NONE: readonly Role[] = [];

export const PERMISSIONS = {
  dashboard: { read: TEAM, write: NONE },
  customers: { read: TEAM, write: TEAM },
  products: { read: TEAM, write: ADMIN },
  plans: { read: TEAM, write: ADMIN },
  templates: { read: TEAM, write: ADMIN },
  subscriptions: { read: TEAM, write: TEAM },
  invoices: { read: TEAM, write: TEAM },
  payments: { read: TEAM, write: TEAM },
  discounts: { read: TEAM, write: ADMIN },
  taxes: { read: TEAM, write: ADMIN },
  paymentTerms: { read: TEAM, write: ADMIN },
  staff: { read: ADMIN, write: ADMIN },
  billingRuns: { read: TEAM, write: TEAM },
  settings: { read: TEAM, write: ADMIN },
  portal: { read: CUSTOMER, write: CUSTOMER },
} as const satisfies Record<string, Permission>;

export type Area = keyof typeof PERMISSIONS;

export function can(
  role: Role | null | undefined,
  area: Area,
  action: "read" | "write"
): boolean {
  if (!role) return false;
  return PERMISSIONS[area][action].includes(role);
}

export function isTeam(role: Role | null | undefined): boolean {
  return !!role && TEAM_ROLES.includes(role);
}

export function homeFor(role: Role): string {
  return role === "customer" ? "/portal" : "/dashboard";
}

// Actions that only admin may take on a record (payment delete, staff deactivate).
export function canDelete(
  role: Role | null | undefined,
  area: Area
): boolean {
  return role === "admin" && can(role, area, "write");
}
