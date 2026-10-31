import { CustomerItem, CustomerDetail } from '@/types/customer';

// TEST DATA: 30 believable fictional Indian enterprise customer records
export const mockCustomersData: CustomerItem[] = [
  { id: 'cust-1', name: 'Rajesh Kumar', company: 'Tata Consultancy Services Ltd', email: 'rajesh.k@tcs.com', phone: '+91 98765 43210', address: 'TCS House, Raveline Street, Fort, Mumbai 400001', activeSubscriptionsCount: 3, outstandingAmount: 53100.00, overdueAmount: 0.00 },
  { id: 'cust-2', name: 'Ananya Sharma', company: 'Reliance Retail Ventures', email: 'ananya.sharma@ril.com', phone: '+91 98123 45678', address: 'Maker Chambers IV, Nariman Point, Mumbai 400021', activeSubscriptionsCount: 2, outstandingAmount: 38350.00, overdueAmount: 38350.00 },
  { id: 'cust-3', name: 'Vikram Mehta', company: 'Infosys BPM Limited', email: 'v_mehta@infosys.com', phone: '+91 97111 22334', address: 'Electronics City, Hosur Road, Bengaluru 560100', activeSubscriptionsCount: 1, outstandingAmount: 33040.00, overdueAmount: 0.00 },
  { id: 'cust-4', name: 'Siddharth Nair', company: 'Wipro Enterprises', email: 'siddharth.nair@wipro.com', phone: '+91 96222 33445', address: 'Doddakannelli, Sarjapur Road, Bengaluru 560035', activeSubscriptionsCount: 2, outstandingAmount: 11830.00, overdueAmount: 0.00 },
  { id: 'cust-5', name: 'Priya Iyer', company: 'HCL Technologies Ltd', email: 'priya.iyer@hcl.com', phone: '+91 95333 44556', address: 'Technology Hub, Plot No 3A, Sector 126, Noida 201304', activeSubscriptionsCount: 1, outstandingAmount: 25960.00, overdueAmount: 0.00 },
  { id: 'cust-6', name: 'Arjun Deshmukh', company: 'Larsen & Toubro Infotech', email: 'arjun.d@lnt.com', phone: '+91 94444 55667', address: 'L&T House, Ballard Estate, Mumbai 400001', activeSubscriptionsCount: 1, outstandingAmount: 17700.00, overdueAmount: 0.00 },
  { id: 'cust-7', name: 'Kavita Reddy', company: 'Mahindra Logistics Ltd', email: 'kavita.reddy@mahindra.com', phone: '+91 93555 66778', address: 'Mahindra Towers, PK Kurne Chowk, Worli, Mumbai 400018', activeSubscriptionsCount: 2, outstandingAmount: 23010.00, overdueAmount: 23010.00 },
  { id: 'cust-8', name: 'Amitabh Patel', company: 'Adani Digital Labs', email: 'amitabh.p@adani.com', phone: '+91 92666 77889', address: 'Adani Corporate House, SG Highway, Ahmedabad 382421', activeSubscriptionsCount: 1, outstandingAmount: 16520.00, overdueAmount: 0.00 },
  { id: 'cust-9', name: 'Neha Gupta', company: 'Airtel Business Operations', email: 'neha.gupta@airtel.com', phone: '+91 91777 88990', address: 'Bharti Crescent, 1 Nelson Mandela Road, Vasant Kunj, New Delhi 110070', activeSubscriptionsCount: 3, outstandingAmount: 0.00, overdueAmount: 0.00 },
  { id: 'cust-10', name: 'Sanjay Joshi', company: 'Bajaj Finserv Direct', email: 'sanjay.j@bajaj.com', phone: '+91 90888 99001', address: 'Bajaj Auto Ltd Complex, Mumbai-Pune Road, Akurdi, Pune 411035', activeSubscriptionsCount: 1, outstandingAmount: 11210.00, overdueAmount: 0.00 },
  { id: 'cust-11', name: 'Deepak Verma', company: 'Axis Bank Technology Division', email: 'deepak.v@axisbank.com', phone: '+91 89999 00112', address: 'Axis House, C-2 Wadia International Centre, Worli, Mumbai 400025', activeSubscriptionsCount: 2, outstandingAmount: 0.00, overdueAmount: 0.00 },
  { id: 'cust-12', name: 'Meera Pillai', company: 'Maruti Suzuki Supply Solutions', email: 'meera.pillai@maruti.co.in', phone: '+91 88000 11223', address: 'Nelson Mandela Road, Vasant Kunj, New Delhi 110070', activeSubscriptionsCount: 1, outstandingAmount: 28910.00, overdueAmount: 28910.00 },
  { id: 'cust-13', name: 'Rohan Banerjee', company: 'Sun Pharmaceutical Industries', email: 'rohan.b@sunpharma.com', phone: '+91 87111 22334', address: 'SUN House, CTS No 201 B/1, Western Express Highway, Goregaon E, Mumbai 400063', activeSubscriptionsCount: 2, outstandingAmount: 36580.00, overdueAmount: 0.00 },
  { id: 'cust-14', name: 'Sunita Rao', company: 'UltraTech Cement Ltd', email: 'sunita.rao@adityabirla.com', phone: '+91 86222 33445', address: 'Ahura Centre, B-Wing, Mahakali Caves Road, Andheri E, Mumbai 400093', activeSubscriptionsCount: 1, outstandingAmount: 48380.00, overdueAmount: 0.00 },
  { id: 'cust-15', name: 'Karan Agarwal', company: 'Titan Company Retail', email: 'karan.a@titan.co.in', phone: '+91 85333 44556', address: 'Integrity, No 193 Veerasandra, Electronics City P.O., Bengaluru 560100', activeSubscriptionsCount: 1, outstandingAmount: 0.00, overdueAmount: 0.00 },
  { id: 'cust-16', name: 'Pooja Bhatia', company: 'Godrej Consumer Products', email: 'pooja.b@godrej.com', phone: '+91 84444 55667', address: 'Godrej One, Pirojshanagar, Eastern Express Highway, Vikhroli E, Mumbai 400079', activeSubscriptionsCount: 1, outstandingAmount: 9676.00, overdueAmount: 0.00 },
  { id: 'cust-17', name: 'Tarun Choudhury', company: 'Dr Reddys Laboratories', email: 'tarun.c@drreddys.com', phone: '+91 83555 66778', address: '8-2-337 Road No 3, Banjara Hills, Hyderabad 500034', activeSubscriptionsCount: 2, outstandingAmount: 30680.00, overdueAmount: 0.00 },
  { id: 'cust-18', name: 'Geeta Saxena', company: 'ICICI Prudential Life', email: 'geeta.s@icicipru.com', phone: '+91 82666 77889', address: 'ICICI PruLife Towers, Appasaheb Marathe Marg, Prabhadevi, Mumbai 400025', activeSubscriptionsCount: 1, outstandingAmount: 44840.00, overdueAmount: 0.00 },
  { id: 'cust-19', name: 'Nikhil Menon', company: 'Kotak Mahindra Bank', email: 'nikhil.menon@kotak.com', phone: '+91 81777 88990', address: '27 BKC, C-27 G Block, Bandra Kurla Complex, Mumbai 400051', activeSubscriptionsCount: 1, outstandingAmount: 0.00, overdueAmount: 0.00 },
  { id: 'cust-20', name: 'Aarti Shah', company: 'JSW Steel Processing', email: 'aarti.shah@jsw.in', phone: '+91 80888 99001', address: 'JSW Centre, Bandra Kurla Complex, Mumbai 400051', activeSubscriptionsCount: 0, outstandingAmount: 0.00, overdueAmount: 0.00 },
  { id: 'cust-21', name: 'Manish Pandey', company: 'Hindalco Industries', email: 'manish.p@adityabirla.com', phone: '+91 79999 00112', address: 'Century Bhavan, Dr Annie Besant Road, Worli, Mumbai 400030', activeSubscriptionsCount: 1, outstandingAmount: 25370.00, overdueAmount: 0.00 },
  { id: 'cust-22', name: 'Divya Nambiar', company: 'Britannia Industries', email: 'divya.n@britannia.co.in', phone: '+91 78000 11223', address: 'Executive Centre, 5th Floor, DLF Cyber City, Gurugram 122002', activeSubscriptionsCount: 1, outstandingAmount: 0.00, overdueAmount: 0.00 },
  { id: 'cust-23', name: 'Alok Mishra', company: 'Tech Mahindra Global', email: 'alok.mishra@techmahindra.com', phone: '+91 77111 22334', address: 'Rajiv Gandhi Infotech Park, Hinjewadi Phase 3, Pune 411057', activeSubscriptionsCount: 2, outstandingAmount: 40120.00, overdueAmount: 0.00 },
  { id: 'cust-24', name: 'Shruti Kapoor', company: 'Bharat Petroleum Corp', email: 'shruti.k@bharatpetroleum.in', phone: '+91 76222 33445', address: 'Bharat Bhavan, 4 and 6 Currimbhoy Road, Ballard Estate, Mumbai 400001', activeSubscriptionsCount: 1, outstandingAmount: 73160.00, overdueAmount: 0.00 },
  { id: 'cust-25', name: 'Vivek Singhania', company: 'Siemens India Operations', email: 'vivek.s@siemens.com', phone: '+91 75333 44556', address: 'Birla Aurora, Level 21, Dr Annie Besant Road, Worli, Mumbai 400030', activeSubscriptionsCount: 1, outstandingAmount: 32450.00, overdueAmount: 0.00 },
  { id: 'cust-26', name: 'Ritu Dhawan', company: 'Hero MotoCorp Logistics', email: 'ritu.d@heromotocorp.com', phone: '+91 74444 55667', address: 'The Grand Plaza, Plot No 2, Nelson Mandela Road, Vasant Kunj, New Delhi 110070', activeSubscriptionsCount: 1, outstandingAmount: 22420.00, overdueAmount: 0.00 },
  { id: 'cust-27', name: 'Gaurav Prasad', company: 'Havells India Supply Chain', email: 'gaurav.p@havells.com', phone: '+91 73555 66778', address: 'QRG Towers, 2D Sector 126, Noida-Greater Noida Expressway, Noida 201304', activeSubscriptionsCount: 1, outstandingAmount: 14750.00, overdueAmount: 0.00 },
  { id: 'cust-28', name: 'Smita Malhotra', company: 'Apollo Hospitals Enterprise', email: 'smita.m@apollohospitals.com', phone: '+91 72666 77889', address: '19 Bishop Gardens, Raja Annamalaipuram, Chennai 600028', activeSubscriptionsCount: 2, outstandingAmount: 64900.00, overdueAmount: 0.00 },
  { id: 'cust-29', name: 'Harish Sundaram', company: 'Eicher Motors Fleet', email: 'harish.s@eicher.in', phone: '+91 71777 88990', address: '3rd Floor, Select CITYWALK, A-3 District Centre Saket, New Delhi 110017', activeSubscriptionsCount: 1, outstandingAmount: 0.00, overdueAmount: 0.00 },
  { id: 'cust-30', name: 'Nisha Varma', company: 'Torrent Pharmaceuticals', email: 'nisha.v@torrentpharma.com', phone: '+91 70888 99001', address: 'Torrent House, Off Ashram Road, Ahmedabad 380009', activeSubscriptionsCount: 0, outstandingAmount: 0.00, overdueAmount: 0.00 },
];

// TEST DATA: Complete customer detail view populated with mock items
export const mockCustomerDetail: CustomerDetail = {
  ...mockCustomersData[0],
  subscriptions: [
    { id: 'sub-1', number: 'SUB-2026-001', customerName: 'Tata Consultancy Services Ltd', planName: 'Enterprise Scale', status: 'ACTIVE', startDate: '15 Jan 2026', expiryDate: '14 Jan 2027', nextInvoiceDate: '15 Nov 2026', monthlyValue: 45000.00 },
    { id: 'sub-11', number: 'SUB-2026-011', customerName: 'Tata Consultancy Services Ltd', planName: 'Growth Pro', status: 'ACTIVE', startDate: '10 Jun 2026', expiryDate: '09 Jun 2027', nextInvoiceDate: '10 Nov 2026', monthlyValue: 22000.00 },
    { id: 'sub-25', number: 'SUB-2026-025', customerName: 'Tata Consultancy Services Ltd', planName: 'Standard Business', status: 'ACTIVE', startDate: '20 Oct 2026', expiryDate: '28 Nov 2026', nextInvoiceDate: '20 Nov 2026', monthlyValue: 15000.00 },
  ],
  invoices: [
    { id: 'inv-1', number: 'INV-2026-089', customerName: 'Tata Consultancy Services Ltd', subscriptionNumber: 'SUB-2026-001', invoiceDate: '01 Oct 2026', dueDate: '31 Oct 2026', total: 53100.00, paid: 0.00, due: 53100.00, status: 'CONFIRMED' },
    { id: 'inv-12', number: 'INV-2026-012', customerName: 'Tata Consultancy Services Ltd', subscriptionNumber: 'SUB-2026-001', invoiceDate: '15 Sep 2026', dueDate: '15 Oct 2026', total: 53100.00, paid: 53100.00, due: 0.00, status: 'PAID' },
    { id: 'inv-5', number: 'INV-2026-005', customerName: 'Tata Consultancy Services Ltd', subscriptionNumber: 'SUB-2026-011', invoiceDate: '10 Aug 2026', dueDate: '10 Sep 2026', total: 25960.00, paid: 25960.00, due: 0.00, status: 'PAID' },
  ],
  payments: [
    { id: 'pay-1', date: '15 Oct 2026', invoiceId: 'inv-12', invoiceNumber: 'INV-2026-012', customerName: 'Tata Consultancy Services Ltd', method: 'Bank transfer', amount: 53100.00, note: 'NEFT Settlement Ref #9283012', recordedBy: 'admin@brightloop.test' },
    { id: 'pay-10', date: '10 Sep 2026', invoiceId: 'inv-5', invoiceNumber: 'INV-2026-005', customerName: 'Tata Consultancy Services Ltd', method: 'Bank transfer', amount: 25960.00, note: 'NEFT Settlement Ref #8392019', recordedBy: 'finance@brightloop.test' },
  ],
};

export function getMockCustomerDetail(customerId: string): CustomerDetail | null {
  const customer = mockCustomersData.find(({ id }) => id === customerId);
  if (!customer) return null;

  if (customer.id === mockCustomerDetail.id) return mockCustomerDetail;

  return {
    ...customer,
    subscriptions: [],
    invoices: [],
    payments: [],
  };
}
