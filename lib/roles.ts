export type UserRole = "admin" | "staff" | "customer";

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

export function getRedirectForRole(role: UserRole | null | undefined): string {
  if (role === "admin" || role === "staff") {
    return "/dashboard";
  }
  return "/portal";
}
