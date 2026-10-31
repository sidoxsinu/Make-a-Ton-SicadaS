import { SubscriptionStatus } from './subscription';

export interface SubscriptionLineItem {
  id: string;
  productId: string;
  productName: string;
  variant: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  minQuantity?: number;
}

export interface SubscriptionInvoice {
  id: string;
  number: string;
  date: string;
  total: number;
  status: 'PAID' | 'OVERDUE' | 'DRAFT' | 'PARTIAL';
}

export interface SubscriptionHistoryEvent {
  id: string;
  event: string;
  user: string;
  timestamp: string;
}

export interface SubscriptionDetail {
  id: string;
  number: string;
  customerName: string;
  planName: string;
  status: SubscriptionStatus;
  isPaused: boolean;
  startDate: string;
  expiryDate: string;
  paymentTerms: string;
  lines: SubscriptionLineItem[];
  invoices: SubscriptionInvoice[];
  history: SubscriptionHistoryEvent[];
  allowBillNow: boolean;
  allowPause: boolean;
  allowRenew: boolean;
}
