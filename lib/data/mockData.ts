import {
  Product,
  Plan,
  SubscriptionTemplate,
  Discount,
  Tax,
  PaymentTerm,
  StaffUser,
  BillingRun,
  AppSettings,
} from './types';

// TEST DATA: Fictional Indian company catalog data
export const mockProductsData: Product[] = [
  {
    id: 'prod-1',
    name: 'SMS Billing Engine',
    type: 'service',
    salesPrice: 3500.0,
    costPrice: 1200.0,
    defaultTaxRate: 18,
    active: true,
    variants: [
      { id: 'var-1', attribute: 'Tier', value: 'Enterprise Core', extraPrice: 500.0 },
    ],
  },
  {
    id: 'prod-2',
    name: 'API Access Pass',
    type: 'digital',
    salesPrice: 5000.0,
    costPrice: 800.0,
    defaultTaxRate: 18,
    active: true,
    variants: [],
  },
];

export const mockPlansData: Plan[] = [
  {
    id: 'plan-1',
    name: 'Enterprise Scale',
    price: 45000.0,
    billingPeriod: 'monthly',
    minimumQuantity: 5,
    availableFrom: '01 Jan 2026',
    availableTo: '31 Dec 2026',
    closeAutomatically: false,
    closable: true,
    pausable: true,
    renewable: true,
  },
  {
    id: 'plan-2',
    name: 'Growth Pro',
    price: 22000.0,
    billingPeriod: 'monthly',
    minimumQuantity: 2,
    availableFrom: '01 Jan 2026',
    availableTo: '31 Dec 2026',
    closeAutomatically: true,
    closable: true,
    pausable: false,
    renewable: true,
  },
];

export const mockTemplatesData: SubscriptionTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Standard Corporate Onboarding',
    validityDays: 365,
    planId: 'plan-1',
    planName: 'Enterprise Scale',
    lines: [
      { id: 'tl-1', productId: 'prod-1', variantId: 'var-1', quantity: 10 },
    ],
  },
];

export const mockDiscountsData: Discount[] = [
  {
    id: 'disc-1',
    name: 'Diwali Festive Offer',
    kind: 'percent',
    value: 15,
    scope: 'subscription',
    minimumPurchase: 10000,
    minimumQuantity: 1,
    startsAt: '15 Oct 2026',
    endsAt: '15 Nov 2026',
    usedCount: 3,
    maxUsage: 10,
    active: true,
    targetProductIds: [],
    targetSubscriptionIds: [],
  },
];

export const mockTaxesData: Tax[] = [
  { id: 'tax-1', name: 'GST 18%', rate: 18, active: true },
  { id: 'tax-2', name: 'GST 5%', rate: 5, active: true },
];

export const mockPaymentTermsData: PaymentTerm[] = [
  { id: 'pt-1', name: 'Net 30', days: 30 },
  { id: 'pt-2', name: 'Due on Receipt', days: 0 },
];

export const mockStaffData: StaffUser[] = [
  {
    id: 'usr-1',
    name: 'Malavika M T',
    email: 'admin@brightloop.test',
    role: 'ADMIN',
    status: 'Active',
    addedAt: '01 Jan 2026',
  },
  {
    id: 'usr-2',
    name: 'Sinan Sicadas',
    email: 'staff@brightloop.test',
    role: 'STAFF',
    status: 'Active',
    addedAt: '15 Feb 2026',
  },
];

export const mockBillingRunsData: BillingRun[] = [
  {
    id: 'run-1',
    ranAt: '31 Oct 2026, 06:00 AM',
    createdCount: 24,
    failedCount: 0,
    errorDetail: '',
  },
];

export const mockSettingsData: AppSettings = {
  companyName: 'Brightloop SMS India Private Limited',
  currencyCode: 'INR',
  confirmInvoicesAutomatically: false,
};
