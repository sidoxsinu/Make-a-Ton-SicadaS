export const taxesResource = {
  name: 'taxes',
  title: 'Tax Rates',
  subtitle: 'GST and regional tax rate declarations.',
  emptyMessage: 'No tax rates configured.',
  columns: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'rate', label: 'Rate (%)', type: 'number', align: 'right' },
    { key: 'active', label: 'Active', type: 'boolean' },
  ],
};
