export const DEFAULT_CATEGORIES = [
  { name: 'ភេសជ្ជៈ', description: 'ភេសជ្ជៈក្តៅ ត្រជាក់ និង ទឹកផ្លែឈើ' },
  { name: 'អាហារ', description: 'អាហារសម្រន់ និង នំប៉័ង' },
  { name: 'គ្រឿងទេស', description: 'គ្រឿងទេសប្រចាំថ្ងៃ និង ទំនិញចម្អិន' },
  { name: 'ទំនិញទូទៅ', description: 'ទំនិញប្រើប្រាស់ទូទៅ' },
];

export const DEFAULT_UNITS = [
  { name: 'កញ្ចប់', symbol: 'Pack' },
  { name: 'ដប', symbol: 'Bottle' },
  { name: 'កំប៉ុង', symbol: 'Can' },
  { name: 'ប្រអប់', symbol: 'Box' },
  { name: 'គីឡូក្រាម', symbol: 'Kg' },
];

export const DEFAULT_WALKIN_CUSTOMER = {
  name: 'អតិថិជនទូទៅ (Walk-in Customer)',
  phone: '012000000',
  address: 'ភ្នំពេញ (Phnom Penh)',
  notes: 'អតិថិជនទូទៅលក់រាយប្រចាំថ្ងៃ',
  is_default: true,
};

export const DEFAULT_SAMPLE_PRODUCTS = [
  {
    name: 'កាហ្វេទឹកដោះគោ (Iced Latte)',
    category: 'ភេសជ្ជៈ',
    unit: 'កំប៉ុង',
    cost_price: 1.00,
    selling_price: 2.00,
    current_stock: 50,
    min_stock_alert: 10,
    sku: 'SKU-COFFEE-01',
    barcode: '8850001',
    description: 'កាហ្វេឈ្ងុយឆ្ងាញ់',
  },
  {
    name: 'ទឹកបរិសុទ្ធ 500ml',
    category: 'ភេសជ្ជៈ',
    unit: 'ដប',
    cost_price: 0.15,
    selling_price: 0.50,
    current_stock: 100,
    min_stock_alert: 20,
    sku: 'SKU-WATER-500',
    barcode: '8850002',
    description: 'ទឹកបរិសុទ្ធត្រជាក់',
  },
  {
    name: 'នំស្រួយស្រូវសាលី',
    category: 'អាហារ',
    unit: 'កញ្ចប់',
    cost_price: 0.80,
    selling_price: 1.50,
    current_stock: 30,
    min_stock_alert: 5,
    sku: 'SKU-SNACK-01',
    barcode: '8850003',
    description: 'នំស្រួយឆ្ងាញ់សម្រាប់អាហារសម្រន់',
  },
];
