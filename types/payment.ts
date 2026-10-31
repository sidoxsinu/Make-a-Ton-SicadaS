export type PaymentMethod = 'Bank transfer' | 'UPI' | 'Card' | 'Cheque' | 'Cash';

export interface PaymentItem {
  id: string;
  date: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  method: PaymentMethod;
  amount: number;
  note: string;
  recordedBy: string;
}

export interface UnpaidInvoice {
  id: string;
  number: string;
  customerName: string;
  amountDue: number;
}
