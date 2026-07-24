import { TransactionType } from './types';

export const TRANSACTION_TYPES: { label: string; value: TransactionType }[] = [
  { label: 'ចំណូល', value: 'income' },
  { label: 'ចំណាយ', value: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  'លក់ទំនិញ',
  'សេវាកម្ម',
  'ប្រាក់ខែ',
  'ផ្សេងៗ',
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'ទិញទំនិញ',
  'ដឹកជញ្ជូន',
  'អាហារ',
  'ថ្លៃផ្ទះ',
  'ផ្សេងៗ',
];
