export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'OVERDUE' | 'PARTIAL' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  number: string;
  customerName: string;
  subscriptionNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  paid: number;
  due: number;
  status: InvoiceStatus;
  daysOverdue?: number;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface InvoicePayment {
  id: string;
  date: string;
  method: string;
  amount: number;
  note: string;
}

export interface InvoiceDetail {
  id: string;
  number: string;
  customerName: string;
  subscriptionNumber: string;
  subscriptionId: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  billingPeriod: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  payments: InvoicePayment[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  paidTotal: number;
  amountDue: number;
}
