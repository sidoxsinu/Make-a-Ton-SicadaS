export type SubscriptionStatus = 
  | 'DRAFT' 
  | 'QUOTATION' 
  | 'CONFIRMED' 
  | 'ACTIVE' 
  | 'PAUSED' 
  | 'CLOSED' 
  | 'CANCELLED';

export interface SubscriptionItem {
  id: string;
  number: string;
  customerName: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  nextInvoiceDate: string;
}
