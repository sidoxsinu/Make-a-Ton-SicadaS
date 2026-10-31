export const plansResource = {
  name: 'plans',
  title: 'Plans',
  subtitle: 'Recurring billing plan definitions and constraints.',
  emptyMessage: 'No plans yet.',
  columns: [
    { key: 'name', label: 'Name', type: 'link' },
    { key: 'price', label: 'Price', type: 'money', align: 'right' },
    { key: 'billingPeriod', label: 'Billing period', type: 'text' },
    { key: 'minimumQuantity', label: 'Minimum quantity', type: 'number', align: 'right' },
    { key: 'availableFrom', label: 'Available from', type: 'date' },
    { key: 'availableTo', label: 'Available to', type: 'date' },
    { key: 'closeAutomatically', label: 'Close automatically', type: 'boolean' },
    { key: 'closable', label: 'Closable', type: 'boolean' },
    { key: 'pausable', label: 'Pausable', type: 'boolean' },
    { key: 'renewable', label: 'Renewable', type: 'boolean' },
  ],
};
