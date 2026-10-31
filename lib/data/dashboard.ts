import { OverdueInvoice, AgingBucket, MonthlyCollection } from '@/types';

// TEST DATA: Believable fictional Indian companies and INR amounts
export const mockKpiData = {
  activeSubscriptionsCount: 10000,
  activeSubscriptionsContext: "12 draft, 8 quotation, 15 confirmed, 3 paused",
  mrr: 2237.50,
  mrrContext: "Active lines, excluding tax and discounts",
  invoicedInPeriod: 1840250.00,
  collectedInPeriod: 421500.00,
  outstanding: 982400.50,
  outstandingContext: "All confirmed invoices with an amount due",
  overdueAmount: 215000.00,
  overdueContext: "14 invoices",
};

export const mockOverdueInvoices: OverdueInvoice[] = [
  { id: 'INV-2026-089', customerName: 'Tata Consultancy Services Ltd', dueDate: '01 Oct 2026', daysOverdue: 30, amountDue: 45000.00 },
  { id: 'INV-2026-092', customerName: 'Reliance Retail Ventures', dueDate: '05 Oct 2026', daysOverdue: 26, amountDue: 32500.00 },
  { id: 'INV-2026-095', customerName: 'Infosys BPM Limited', dueDate: '10 Oct 2026', daysOverdue: 21, amountDue: 28000.00 },
  { id: 'INV-2026-098', customerName: 'Wipro Enterprises', dueDate: '12 Oct 2026', daysOverdue: 19, amountDue: 18500.00 },
  { id: 'INV-2026-101', customerName: 'HCL Technologies Ltd', dueDate: '15 Oct 2026', daysOverdue: 16, amountDue: 22000.00 },
  { id: 'INV-2026-104', customerName: 'Larsen & Toubro Infotech', dueDate: '18 Oct 2026', daysOverdue: 13, amountDue: 15000.00 },
  { id: 'INV-2026-107', customerName: 'Mahindra Logistics Ltd', dueDate: '20 Oct 2026', daysOverdue: 11, amountDue: 19500.00 },
  { id: 'INV-2026-110', customerName: 'Adani Digital Labs', dueDate: '22 Oct 2026', daysOverdue: 9, amountDue: 14000.00 },
  { id: 'INV-2026-112', customerName: 'Airtel Business Operations', dueDate: '25 Oct 2026', daysOverdue: 6, amountDue: 11000.00 },
  { id: 'INV-2026-115', customerName: 'Bajaj Finserv Direct', dueDate: '28 Oct 2026', daysOverdue: 3, amountDue: 9500.00 },
];

export const mockAgingBuckets: AgingBucket[] = [
  { range: '1 to 30 days', amount: 145000.00 },
  { range: '31 to 60 days', amount: 52000.00 },
  { range: 'over 60 days', amount: 18000.00 },
];

export const mockMonthlyCollections: MonthlyCollection[] = [
  { period: 'Nov 25', amount: 182000 },
  { period: 'Dec 25', amount: 240500 },
  { period: 'Jan 26', amount: 198000 },
  { period: 'Feb 26', amount: 265400 },
  { period: 'Mar 26', amount: 310000 },
  { period: 'Apr 26', amount: 287250 },
  { period: 'May 26', amount: 342000 },
  { period: 'Jun 26', amount: 361800 },
  { period: 'Jul 26', amount: 298000 },
  { period: 'Aug 26', amount: 405600 },
  { period: 'Sep 26', amount: 388000 },
  { period: 'Oct 26', amount: 421500 },
];
