import { SubscriptionDetail } from '@/types/subscriptionDetail';

// TEST DATA: Believable fictional Indian enterprise subscription detail
export const mockSubscriptionDetail: SubscriptionDetail = {
  id: 'sub-1',
  number: 'SUB-2026-001',
  customerName: 'Tata Consultancy Services Ltd',
  planName: 'Enterprise Scale',
  status: 'ACTIVE',
  isPaused: false,
  startDate: '15 Jan 2026',
  expiryDate: '14 Jan 2027',
  paymentTerms: 'Net 30',
  allowBillNow: true,
  allowPause: true,
  allowRenew: true,
  lines: [
    {
      id: 'line-1',
      productId: 'prod-1',
      productName: 'SMS Billing Engine',
      variant: 'Enterprise Core',
      description: 'High-throughput recurring payment processor',
      quantity: 10,
      unitPrice: 3500.00,
      taxPercent: 18,
      minQuantity: 5,
    },
    {
      id: 'line-2',
      productId: 'prod-2',
      productName: 'API Access Pass',
      variant: 'Unlimited Tier',
      description: 'Webhook and REST API rate limit expansion',
      quantity: 2,
      unitPrice: 5000.00,
      taxPercent: 18,
      minQuantity: 5,
    },
  ],
  invoices: [
    {
      id: 'inv-1',
      number: 'INV-2026-089',
      date: '15 Oct 2026',
      total: 53100.00,
      status: 'PAID',
    },
    {
      id: 'inv-2',
      number: 'INV-2026-012',
      date: '15 Sep 2026',
      total: 53100.00,
      status: 'PAID',
    },
  ],
  history: [
    {
      id: 'hist-4',
      event: 'Subscription activated',
      user: 'sinan@sicadas.local',
      timestamp: '15 Jan 2026, 10:30 AM',
    },
    {
      id: 'hist-3',
      event: 'Quotation confirmed by client',
      user: 'admin@brightloop.test',
      timestamp: '12 Jan 2026, 04:15 PM',
    },
    {
      id: 'hist-2',
      event: 'Quotation sent to client',
      user: 'admin@brightloop.test',
      timestamp: '10 Jan 2026, 11:00 AM',
    },
    {
      id: 'hist-1',
      event: 'Draft created',
      user: 'admin@brightloop.test',
      timestamp: '08 Jan 2026, 09:14 AM',
    },
  ],
};
