export const paymentTermsResource = {
  name: 'payment-terms',
  title: 'Payment Terms',
  subtitle: 'Invoice credit days and due schedules.',
  emptyMessage: 'No payment terms configured.',
  columns: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'days', label: 'Days', type: 'number', align: 'right' },
  ],
};
