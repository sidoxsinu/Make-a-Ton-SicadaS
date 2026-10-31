export const productsResource = {
  name: 'products',
  title: 'Products',
  subtitle: 'Services, goods, and digital product catalog.',
  emptyMessage: 'No products yet. Add a product.',
  columns: [
    { key: 'name', label: 'Name', type: 'link' },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'salesPrice', label: 'Sales price', type: 'money', align: 'right' },
    { key: 'costPrice', label: 'Cost price', type: 'money', align: 'right', teamOnly: true },
    { key: 'defaultTaxRate', label: 'Default tax', type: 'percent', align: 'right' },
    { key: 'active', label: 'Active', type: 'boolean' },
  ],
};
