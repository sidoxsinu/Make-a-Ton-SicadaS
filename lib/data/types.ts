export type ProductType = 'service' | 'goods' | 'digital';
export type BillingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type DiscountKind = 'fixed' | 'percent';
export type DiscountScope = 'product' | 'subscription';
export type DiscountState = 'Scheduled' | 'Running' | 'Expired' | 'Exhausted' | 'Inactive';
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';
export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'CANCELLED';
export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'OVERDUE' | 'PARTIAL' | 'CANCELLED';

export interface ListResult<T> {
  rows: T[];
  total: number;
}

export type Row = Record<string, unknown> & { id: string };

export interface ProductVariant {
  id: string;
  attribute: string;
  value: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  defaultTaxRate: number;
  active: boolean;
  variants: ProductVariant[];
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  minimumQuantity: number;
  availableFrom: string;
  availableTo: string;
  closeAutomatically: boolean;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
}

export interface TemplateLineItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface SubscriptionTemplate {
  id: string;
  name: string;
  validityDays: number;
  planId: string;
  planName: string;
  lines: TemplateLineItem[];
}

export interface Discount {
  id: string;
  name: string;
  kind: DiscountKind;
  value: number;
  scope: DiscountScope;
  minimumPurchase: number;
  minimumQuantity: number;
  startsAt: string;
  endsAt: string;
  usedCount: number;
  maxUsage: number;
  active: boolean;
  targetProductIds: string[];
  targetSubscriptionIds: string[];
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  active: boolean;
}

export interface PaymentTerm {
  id: string;
  name: string;
  days: number;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Deactivated';
  addedAt: string;
}

export interface BillingRun {
  id: string;
  ranAt: string;
  createdCount: number;
  failedCount: number;
  errorDetail: string;
}

export interface AppSettings {
  companyName: string;
  currencyCode: string;
  confirmInvoicesAutomatically: boolean;
}
