// Single permission map. Navigation, server actions, resource configs and
// button visibility all read from here. The database remains the authority.

export const ROLES = ["admin", "staff", "customer"] as const;
export type Role = (typeof ROLES)[number];
export type UserRole = Role;

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

export function getRedirectForRole(role: UserRole | null | undefined): string {
  if (role === "admin" || role === "staff") {
    return "/dashboard";
  }
  return "/portal";
}

// Actions that only admin may take on a record (payment delete, staff deactivate).
export function canDelete(
  role: Role | null | undefined,
  area: Area
): boolean {
  return role === "admin" && can(role, area, "write");
}

export interface PermissionMap {
  canManageStaff: boolean;
  canManageSettings: boolean;
  canWriteCatalog: boolean;
  canReadCatalog: boolean;
  canWriteDiscounts: boolean;
  canReadDiscounts: boolean;
  canWriteSubscriptions: boolean;
  canManageInvoices: boolean;
  canRecordPayments: boolean;
  canDeletePayments: boolean;
  canViewReports: boolean;
  isTeam: boolean;
  isCustomer: boolean;
}

export function getPermissions(role: UserRole | null | undefined): PermissionMap {
  const r = role || "customer";

  return {
    canManageStaff: r === "admin",
    canManageSettings: r === "admin",
    canWriteCatalog: r === "admin",
    canReadCatalog: r === "admin" || r === "staff",
    canWriteDiscounts: r === "admin",
    canReadDiscounts: r === "admin" || r === "staff",
    canWriteSubscriptions: r === "admin" || r === "staff",
    canManageInvoices: r === "admin" || r === "staff",
    canRecordPayments: r === "admin" || r === "staff",
    canDeletePayments: r === "admin",
    canViewReports: r === "admin" || r === "staff",
    isTeam: r === "admin" || r === "staff",
    isCustomer: r === "customer",
  };
}

export async function getCurrentUserRole(supabase: any): Promise<UserRole> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "customer";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as UserRole) || "customer";
}
