import { SubscriptionItem } from './subscription';
import { InvoiceItem } from './invoice';
import { PaymentItem } from './payment';

export interface CustomerItem {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

export interface CustomerDetail extends CustomerItem {
  subscriptions: SubscriptionItem[];
  invoices: InvoiceItem[];
  payments: PaymentItem[];
}
