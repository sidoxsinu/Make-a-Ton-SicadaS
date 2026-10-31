export const discountsResource = {
  name: 'discounts',
  title: 'Discounts',
  subtitle: 'Promotional rules and subscription price adjustments.',
  emptyMessage: 'No discounts yet.',
  columns: [
    { key: 'name', label: 'Name', type: 'link' },
    { key: 'kind', label: 'Kind', type: 'text' },
    { key: 'value', label: 'Value', type: 'number', align: 'right' },
    { key: 'scope', label: 'Scope', type: 'text' },
    { key: 'minimumPurchase', label: 'Minimum purchase', type: 'money', align: 'right' },
    { key: 'startsAt', label: 'Starts', type: 'date' },
    { key: 'endsAt', label: 'Ends', type: 'date' },
    { key: 'usedCount', label: 'Used', type: 'text' },
    { key: 'status', label: 'State', type: 'badge' },
  ],
};
