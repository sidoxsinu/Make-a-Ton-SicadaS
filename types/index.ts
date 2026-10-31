export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'CANCELLED';

export interface Subscription {
  id: string;
  customerName: string;
  status: SubscriptionStatus;
  amount: number;
  startDate: string;
}

export interface OverdueInvoice {
  id: string;
  customerName: string;
  dueDate: string;
  daysOverdue: number;
  amountDue: number;
}

export interface AgingBucket {
  range: string;
  amount: number;
}

export interface MonthlyCollection {
  period: string;
  amount: number;
}
