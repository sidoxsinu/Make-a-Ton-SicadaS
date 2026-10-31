import { PaymentItem, UnpaidInvoice } from '@/types/payment';

// TEST DATA: 30 believable fictional Indian company payment records
export const mockPaymentsData: PaymentItem[] = [
  { id: 'pay-1', date: '31 Oct 2026', invoiceId: 'inv-1', invoiceNumber: 'INV-2026-089', customerName: 'Tata Consultancy Services Ltd', method: 'Bank transfer', amount: 53100.00, note: 'NEFT Ref #9283012', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-2', date: '28 Oct 2026', invoiceId: 'inv-9', invoiceNumber: 'INV-2026-097', customerName: 'Airtel Business Operations', method: 'UPI', amount: 12980.00, note: 'UPI TXN 8492019382', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-3', date: '25 Oct 2026', invoiceId: 'inv-19', invoiceNumber: 'INV-2026-107', customerName: 'Kotak Mahindra Bank', method: 'Bank transfer', amount: 34220.00, note: 'RTGS Ref #739201', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-4', date: '22 Oct 2026', invoiceId: 'inv-15', invoiceNumber: 'INV-2026-103', customerName: 'Titan Company Retail', method: 'Card', amount: 20650.00, note: 'Corporate Card ending 4092', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-5', date: '20 Oct 2026', invoiceId: 'inv-4', invoiceNumber: 'INV-2026-092', customerName: 'Wipro Enterprises', method: 'Cheque', amount: 10000.00, note: 'HDFC Cheque #004921', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-6', date: '18 Oct 2026', invoiceId: 'inv-11', invoiceNumber: 'INV-2026-099', customerName: 'Axis Bank Technology Division', method: 'Bank transfer', amount: 61360.00, note: 'NEFT Ref #482910', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-7', date: '15 Oct 2026', invoiceId: 'inv-22', invoiceNumber: 'INV-2026-110', customerName: 'Britannia Industries', method: 'UPI', amount: 11564.00, note: 'UPI TXN 293810293', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-8', date: '12 Oct 2026', invoiceId: 'inv-29', invoiceNumber: 'INV-2026-117', customerName: 'Eicher Motors Fleet', method: 'Bank transfer', amount: 27140.00, note: 'IMPS Ref #839201', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-9', date: '10 Oct 2026', invoiceId: 'inv-31', invoiceNumber: 'INV-2026-080', customerName: 'Mahindra Logistics Ltd', method: 'Cash', amount: 5000.00, note: 'Petty cash settlement', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-10', date: '08 Oct 2026', invoiceId: 'inv-32', invoiceNumber: 'INV-2026-081', customerName: 'Infosys BPM Limited', method: 'Bank transfer', amount: 15000.00, note: 'NEFT Ref #382910', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-11', date: '05 Oct 2026', invoiceId: 'inv-33', invoiceNumber: 'INV-2026-082', customerName: 'Reliance Retail Ventures', method: 'Card', amount: 18500.00, note: 'Visa Corp #1029', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-12', date: '02 Oct 2026', invoiceId: 'inv-34', invoiceNumber: 'INV-2026-083', customerName: 'Adani Digital Labs', method: 'UPI', amount: 14000.00, note: 'GPay UPI 9201920', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-13', date: '28 Sep 2026', invoiceId: 'inv-35', invoiceNumber: 'INV-2026-075', customerName: 'HCL Technologies Ltd', method: 'Bank transfer', amount: 22000.00, note: 'RTGS Ref #492019', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-14', date: '25 Sep 2026', invoiceId: 'inv-36', invoiceNumber: 'INV-2026-076', customerName: 'Larsen & Toubro Infotech', method: 'Cheque', amount: 15000.00, note: 'ICICI Cheque #920192', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-15', date: '22 Sep 2026', invoiceId: 'inv-37', invoiceNumber: 'INV-2026-077', customerName: 'Sun Pharmaceutical Industries', method: 'Bank transfer', amount: 31000.00, note: 'NEFT Ref #839201', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-16', date: '20 Sep 2026', invoiceId: 'inv-38', invoiceNumber: 'INV-2026-078', customerName: 'UltraTech Cement Ltd', method: 'Bank transfer', amount: 41000.00, note: 'NEFT Ref #102938', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-17', date: '18 Sep 2026', invoiceId: 'inv-39', invoiceNumber: 'INV-2026-079', customerName: 'Bajaj Finserv Direct', method: 'UPI', amount: 9500.00, note: 'PhonePe UPI 482910', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-18', date: '15 Sep 2026', invoiceId: 'inv-40', invoiceNumber: 'INV-2026-070', customerName: 'Godrej Consumer Products', method: 'Card', amount: 8200.00, note: 'MasterCard #8391', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-19', date: '12 Sep 2026', invoiceId: 'inv-41', invoiceNumber: 'INV-2026-071', customerName: 'Dr Reddys Laboratories', method: 'Bank transfer', amount: 26000.00, note: 'RTGS Ref #839210', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-20', date: '10 Sep 2026', invoiceId: 'inv-42', invoiceNumber: 'INV-2026-072', customerName: 'ICICI Prudential Life', method: 'Bank transfer', amount: 38000.00, note: 'NEFT Ref #293810', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-21', date: '08 Sep 2026', invoiceId: 'inv-43', invoiceNumber: 'INV-2026-073', customerName: 'Hindalco Industries', method: 'UPI', amount: 21500.00, note: 'UPI 4820192', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-22', date: '05 Sep 2026', invoiceId: 'inv-44', invoiceNumber: 'INV-2026-074', customerName: 'Tech Mahindra Global', method: 'Bank transfer', amount: 34000.00, note: 'NEFT Ref #928102', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-23', date: '02 Sep 2026', invoiceId: 'inv-45', invoiceNumber: 'INV-2026-065', customerName: 'Bharat Petroleum Corp', method: 'Cheque', amount: 62000.00, note: 'SBI Cheque #192830', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-24', date: '28 Aug 2026', invoiceId: 'inv-46', invoiceNumber: 'INV-2026-066', customerName: 'Siemens India Operations', method: 'Bank transfer', amount: 27500.00, note: 'RTGS Ref #839201', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-25', date: '25 Aug 2026', invoiceId: 'inv-47', invoiceNumber: 'INV-2026-067', customerName: 'Hero MotoCorp Logistics', method: 'UPI', amount: 19000.00, note: 'UPI 3920192', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-26', date: '22 Aug 2026', invoiceId: 'inv-48', invoiceNumber: 'INV-2026-068', customerName: 'Havells India Supply Chain', method: 'Cash', amount: 12500.00, note: 'Branch deposit', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-27', date: '20 Aug 2026', invoiceId: 'inv-49', invoiceNumber: 'INV-2026-069', customerName: 'Apollo Hospitals Enterprise', method: 'Bank transfer', amount: 55000.00, note: 'NEFT Ref #291029', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-28', date: '15 Aug 2026', invoiceId: 'inv-50', invoiceNumber: 'INV-2026-060', customerName: 'Torrent Pharmaceuticals', method: 'Bank transfer', amount: 16500.00, note: 'RTGS Ref #482910', recordedBy: 'admin@brightloop.test' },
  { id: 'pay-29', date: '10 Aug 2026', invoiceId: 'inv-51', invoiceNumber: 'INV-2026-061', customerName: 'Tata Consultancy Services Ltd', method: 'UPI', amount: 45000.00, note: 'UPI 8392019', recordedBy: 'finance@brightloop.test' },
  { id: 'pay-30', date: '05 Aug 2026', invoiceId: 'inv-52', invoiceNumber: 'INV-2026-062', customerName: 'Reliance Retail Ventures', method: 'Card', amount: 32500.00, note: 'Corporate Card #9021', recordedBy: 'admin@brightloop.test' },
];

// TEST DATA: Confirmed invoices with an amount due for the Record Payment drawer picker
export const mockUnpaidInvoices: UnpaidInvoice[] = [
  { id: 'inv-2', number: 'INV-2026-090', customerName: 'Reliance Retail Ventures', amountDue: 38350.00 },
  { id: 'inv-3', number: 'INV-2026-091', customerName: 'Infosys BPM Limited', amountDue: 33040.00 },
  { id: 'inv-4', number: 'INV-2026-092', customerName: 'Wipro Enterprises', amountDue: 11830.00 },
  { id: 'inv-7', number: 'INV-2026-095', customerName: 'Mahindra Logistics Ltd', amountDue: 23010.00 },
  { id: 'inv-8', number: 'INV-2026-096', customerName: 'Adani Digital Labs', amountDue: 16520.00 },
  { id: 'inv-12', number: 'INV-2026-100', customerName: 'Maruti Suzuki Supply Solutions', amountDue: 28910.00 },
  { id: 'inv-13', number: 'INV-2026-101', customerName: 'Sun Pharmaceutical Industries', amountDue: 36580.00 },
  { id: 'inv-17', number: 'INV-2026-105', customerName: 'Dr Reddys Laboratories', amountDue: 30680.00 },
  { id: 'inv-18', number: 'INV-2026-106', customerName: 'ICICI Prudential Life', amountDue: 44840.00 },
  { id: 'inv-23', number: 'INV-2026-111', customerName: 'Tech Mahindra Global', amountDue: 40120.00 },
];
