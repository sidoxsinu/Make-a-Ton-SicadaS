export type PaymentMethod = 'Bank transfer' | 'UPI' | 'Card' | 'Cheque' | 'Cash' | 'Other';

export interface PaymentItem {
  id: string;
  date: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  method: PaymentMethod;
  amount: number;
  note: string;
}

export interface UnpaidInvoice {
  id: string;
  number: string;
  customerName: string;
  amountDue: number;
}
