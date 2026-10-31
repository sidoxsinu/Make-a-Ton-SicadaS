import { InvoiceItem, InvoiceDetail } from '@/types/invoice';

// TEST DATA: 30 believable fictional Indian companies and INR amounts for invoices list
export const mockInvoicesData: InvoiceItem[] = [
  { id: 'inv-1', number: 'INV-2026-089', customerName: 'Tata Consultancy Services Ltd', subscriptionNumber: 'SUB-2026-001', invoiceDate: '01 Oct 2026', dueDate: '31 Oct 2026', total: 53100.00, paid: 53100.00, due: 0.00, status: 'PAID' },
  { id: 'inv-2', number: 'INV-2026-090', customerName: 'Reliance Retail Ventures', subscriptionNumber: 'SUB-2026-002', invoiceDate: '01 Oct 2026', dueDate: '15 Oct 2026', total: 38350.00, paid: 0.00, due: 38350.00, status: 'OVERDUE', daysOverdue: 16 },
  { id: 'inv-3', number: 'INV-2026-091', customerName: 'Infosys BPM Limited', subscriptionNumber: 'SUB-2026-003', invoiceDate: '05 Oct 2026', dueDate: '04 Nov 2026', total: 33040.00, paid: 0.00, due: 33040.00, status: 'CONFIRMED' },
  { id: 'inv-4', number: 'INV-2026-092', customerName: 'Wipro Enterprises', subscriptionNumber: 'SUB-2026-004', invoiceDate: '10 Oct 2026', dueDate: '09 Nov 2026', total: 21830.00, paid: 10000.00, due: 11830.00, status: 'PARTIAL' },
  { id: 'inv-5', number: 'INV-2026-093', customerName: 'HCL Technologies Ltd', subscriptionNumber: 'SUB-2026-005', invoiceDate: '15 Oct 2026', dueDate: '14 Nov 2026', total: 25960.00, paid: 0.00, due: 25960.00, status: 'DRAFT' },
  { id: 'inv-6', number: 'INV-2026-094', customerName: 'Larsen & Toubro Infotech', subscriptionNumber: 'SUB-2026-006', invoiceDate: '20 Oct 2026', dueDate: '19 Nov 2026', total: 17700.00, paid: 0.00, due: 17700.00, status: 'DRAFT' },
  { id: 'inv-7', number: 'INV-2026-095', customerName: 'Mahindra Logistics Ltd', subscriptionNumber: 'SUB-2026-007', invoiceDate: '01 Sep 2026', dueDate: '01 Oct 2026', total: 23010.00, paid: 0.00, due: 23010.00, status: 'OVERDUE', daysOverdue: 30 },
  { id: 'inv-8', number: 'INV-2026-096', customerName: 'Adani Digital Labs', subscriptionNumber: 'SUB-2026-008', invoiceDate: '25 Oct 2026', dueDate: '24 Nov 2026', total: 16520.00, paid: 0.00, due: 16520.00, status: 'CONFIRMED' },
  { id: 'inv-9', number: 'INV-2026-097', customerName: 'Airtel Business Operations', subscriptionNumber: 'SUB-2026-009', invoiceDate: '28 Oct 2026', dueDate: '27 Nov 2026', total: 12980.00, paid: 12980.00, due: 0.00, status: 'PAID' },
  { id: 'inv-10', number: 'INV-2026-098', customerName: 'Bajaj Finserv Direct', subscriptionNumber: 'SUB-2026-010', invoiceDate: '29 Oct 2026', dueDate: '28 Nov 2026', total: 11210.00, paid: 0.00, due: 11210.00, status: 'DRAFT' },
  { id: 'inv-11', number: 'INV-2026-099', customerName: 'Axis Bank Technology Division', subscriptionNumber: 'SUB-2026-011', invoiceDate: '01 Oct 2026', dueDate: '31 Oct 2026', total: 61360.00, paid: 61360.00, due: 0.00, status: 'PAID' },
  { id: 'inv-12', number: 'INV-2026-100', customerName: 'Maruti Suzuki Supply Solutions', subscriptionNumber: 'SUB-2026-012', invoiceDate: '05 Oct 2026', dueDate: '20 Oct 2026', total: 28910.00, paid: 0.00, due: 28910.00, status: 'OVERDUE', daysOverdue: 11 },
  { id: 'inv-13', number: 'INV-2026-101', customerName: 'Sun Pharmaceutical Industries', subscriptionNumber: 'SUB-2026-013', invoiceDate: '10 Oct 2026', dueDate: '09 Nov 2026', total: 36580.00, paid: 0.00, due: 36580.00, status: 'CONFIRMED' },
  { id: 'inv-14', number: 'INV-2026-102', customerName: 'UltraTech Cement Ltd', subscriptionNumber: 'SUB-2026-014', invoiceDate: '12 Oct 2026', dueDate: '11 Nov 2026', total: 48380.00, paid: 0.00, due: 48380.00, status: 'DRAFT' },
  { id: 'inv-15', number: 'INV-2026-103', customerName: 'Titan Company Retail', subscriptionNumber: 'SUB-2026-015', invoiceDate: '15 Oct 2026', dueDate: '14 Nov 2026', total: 20650.00, paid: 20650.00, due: 0.00, status: 'PAID' },
  { id: 'inv-16', number: 'INV-2026-104', customerName: 'Godrej Consumer Products', subscriptionNumber: 'SUB-2026-016', invoiceDate: '18 Oct 2026', dueDate: '17 Nov 2026', total: 9676.00, paid: 0.00, due: 9676.00, status: 'DRAFT' },
  { id: 'inv-17', number: 'INV-2026-105', customerName: 'Dr Reddys Laboratories', subscriptionNumber: 'SUB-2026-017', invoiceDate: '20 Oct 2026', dueDate: '19 Nov 2026', total: 30680.00, paid: 0.00, due: 30680.00, status: 'CONFIRMED' },
  { id: 'inv-18', number: 'INV-2026-106', customerName: 'ICICI Prudential Life', subscriptionNumber: 'SUB-2026-018', invoiceDate: '22 Oct 2026', dueDate: '21 Nov 2026', total: 44840.00, paid: 0.00, due: 44840.00, status: 'CONFIRMED' },
  { id: 'inv-19', number: 'INV-2026-107', customerName: 'Kotak Mahindra Bank', subscriptionNumber: 'SUB-2026-019', invoiceDate: '25 Oct 2026', dueDate: '24 Nov 2026', total: 34220.00, paid: 34220.00, due: 0.00, status: 'PAID' },
  { id: 'inv-20', number: 'INV-2026-108', customerName: 'JSW Steel Processing', subscriptionNumber: 'SUB-2026-020', invoiceDate: '26 Oct 2026', dueDate: '25 Nov 2026', total: 56640.00, paid: 0.00, due: 56640.00, status: 'CANCELLED' },
  { id: 'inv-21', number: 'INV-2026-109', customerName: 'Hindalco Industries', subscriptionNumber: 'SUB-2026-021', invoiceDate: '27 Oct 2026', dueDate: '26 Nov 2026', total: 25370.00, paid: 0.00, due: 25370.00, status: 'DRAFT' },
  { id: 'inv-22', number: 'INV-2026-110', customerName: 'Britannia Industries', subscriptionNumber: 'SUB-2026-022', invoiceDate: '28 Oct 2026', dueDate: '27 Nov 2026', total: 11564.00, paid: 11564.00, due: 0.00, status: 'PAID' },
  { id: 'inv-23', number: 'INV-2026-111', customerName: 'Tech Mahindra Global', subscriptionNumber: 'SUB-2026-023', invoiceDate: '29 Oct 2026', dueDate: '28 Nov 2026', total: 40120.00, paid: 0.00, due: 40120.00, status: 'CONFIRMED' },
  { id: 'inv-24', number: 'INV-2026-112', customerName: 'Bharat Petroleum Corp', subscriptionNumber: 'SUB-2026-024', invoiceDate: '30 Oct 2026', dueDate: '29 Nov 2026', total: 73160.00, paid: 0.00, due: 73160.00, status: 'DRAFT' },
  { id: 'inv-25', number: 'INV-2026-113', customerName: 'Siemens India Operations', subscriptionNumber: 'SUB-2026-025', invoiceDate: '31 Oct 2026', dueDate: '30 Nov 2026', total: 32450.00, paid: 0.00, due: 32450.00, status: 'DRAFT' },
  { id: 'inv-26', number: 'INV-2026-114', customerName: 'Hero MotoCorp Logistics', subscriptionNumber: 'SUB-2026-026', invoiceDate: '31 Oct 2026', dueDate: '30 Nov 2026', total: 22420.00, paid: 0.00, due: 22420.00, status: 'DRAFT' },
  { id: 'inv-27', number: 'INV-2026-115', customerName: 'Havells India Supply Chain', subscriptionNumber: 'SUB-2026-027', invoiceDate: '31 Oct 2026', dueDate: '30 Nov 2026', total: 14750.00, paid: 0.00, due: 14750.00, status: 'DRAFT' },
  { id: 'inv-28', number: 'INV-2026-116', customerName: 'Apollo Hospitals Enterprise', subscriptionNumber: 'SUB-2026-028', invoiceDate: '31 Oct 2026', dueDate: '30 Nov 2026', total: 64900.00, paid: 0.00, due: 64900.00, status: 'DRAFT' },
  { id: 'inv-29', number: 'INV-2026-117', customerName: 'Eicher Motors Fleet', subscriptionNumber: 'SUB-2026-029', invoiceDate: '31 Oct 2026', dueDate: '30 Nov 2026', total: 27140.00, paid: 27140.00, due: 0.00, status: 'PAID' },
  { id: 'inv-30', number: 'INV-2026-118', customerName: 'Torrent Pharmaceuticals', subscriptionNumber: 'SUB-2026-030', invoiceDate: '31 Oct 2026', dueDate: '30 Nov 2026', total: 19470.00, paid: 0.00, due: 19470.00, status: 'CANCELLED' }
];

// TEST DATA: Believable fictional Indian enterprise invoice detail
export const mockInvoiceDetail: InvoiceDetail = {
  id: 'inv-1',
  number: 'INV-2026-089',
  customerName: 'Tata Consultancy Services Ltd',
  subscriptionNumber: 'SUB-2026-001',
  subscriptionId: 'sub-1',
  invoiceDate: '01 Oct 2026',
  dueDate: '31 Oct 2026',
  paymentTerms: 'Net 30',
  billingPeriod: '01 Oct 2026 to 31 Oct 2026',
  status: 'CONFIRMED',
  subtotal: 45000.00,
  discountTotal: 0.00,
  taxTotal: 8100.00,
  total: 53100.00,
  paidTotal: 0.00,
  amountDue: 53100.00,
  lines: [
    {
      id: 'line-1',
      description: 'SMS Billing Engine (Enterprise Core Tier)',
      quantity: 10,
      unitPrice: 3500.00,
      discount: 0.00,
      tax: 6300.00,
      total: 41300.00
    },
    {
      id: 'line-2',
      description: 'API Access Pass (Unlimited Webhook Extensions)',
      quantity: 2,
      unitPrice: 5000.00,
      discount: 0.00,
      tax: 1800.00,
      total: 11800.00
    }
  ],
  payments: [
    {
      id: 'pay-1',
      date: '15 Oct 2026',
      method: 'Bank Transfer (NEFT)',
      amount: 20000.00,
      note: 'Part payment batch 1'
    }
  ]
};

export function getMockInvoiceDetail(invoiceId: string): InvoiceDetail | null {
  const invoice = mockInvoicesData.find(({ id }) => id === invoiceId);
  if (!invoice) return null;

  return {
    ...mockInvoiceDetail,
    id: invoice.id,
    number: invoice.number,
    customerName: invoice.customerName,
    subscriptionNumber: invoice.subscriptionNumber,
    subscriptionId: invoice.id.replace(/^inv-/, 'sub-'),
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    billingPeriod: `${invoice.invoiceDate} to ${invoice.dueDate}`,
    subtotal: invoice.total,
    discountTotal: 0,
    taxTotal: 0,
    total: invoice.total,
    paidTotal: invoice.paid,
    amountDue: invoice.due,
    lines: [
      {
        id: `line-${invoice.id}`,
        description: 'Subscription services',
        quantity: 1,
        unitPrice: invoice.total,
        discount: 0,
        tax: 0,
        total: invoice.total,
      },
    ],
    payments: invoice.paid > 0
      ? [{
          id: `payment-${invoice.id}`,
          date: invoice.invoiceDate,
          method: 'Recorded payment',
          amount: invoice.paid,
          note: 'Payment data from invoice demo record',
        }]
      : [],
  };
}
