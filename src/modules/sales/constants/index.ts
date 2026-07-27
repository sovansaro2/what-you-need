import { PaymentMethod, PaymentStatus, Customer } from '../types';

export const WALK_IN_CUSTOMER_NAME = 'អតិថិជនទូទៅ (Walk-in Customer)';
export const WALK_IN_CUSTOMER_ID = 'walk-in';

export const DEFAULT_WALK_IN_CUSTOMER: Customer = {
  id: WALK_IN_CUSTOMER_ID,
  business_id: '',
  name: WALK_IN_CUSTOMER_NAME,
  phone: null,
  email: null,
  address: null,
  type: 'walk_in',
};

export const PAYMENT_METHODS: Array<{ id: PaymentMethod; label: string; iconName: string }> = [
  { id: 'cash', label: 'សាច់ប្រាក់ (Cash)', iconName: 'Banknote' },
  { id: 'khqr', label: 'KHQR / បារកូដ (KHQR)', iconName: 'QrCode' },
  { id: 'bank_transfer', label: 'វេរប្រាក់តាមធនាគារ (Bank Transfer)', iconName: 'Building2' },
  { id: 'card', label: 'កាតធនាគារ (Card)', iconName: 'CreditCard' },
  { id: 'credit', label: 'ជំពាក់ (Credit / On Account)', iconName: 'Clock' },
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { label: string; color: string }> = {
  paid: { label: 'បង់រួច (Paid)', color: 'bg-emerald-100 text-emerald-800' },
  partial: { label: 'បង់ខ្លះ (Partial)', color: 'bg-amber-100 text-amber-800' },
  unpaid: { label: 'មិនទាន់បង់ (Unpaid)', color: 'bg-rose-100 text-rose-800' },
};

export const KHMER_SALES_MESSAGES = {
  EMPTY_CART: 'កន្ត្រកទំនិញទទេ សូមជ្រើសរើសទំនិញជាមុនសិន (Cart is empty. Please select products first)',
  INVALID_QUANTITY: 'បរិមាណទំនិញត្រូវតែធំជាង ០ (Quantity must be greater than zero)',
  INSUFFICIENT_STOCK: 'ស្តុកទំនិញមិនគ្រប់គ្រាន់ទេ (Insufficient stock available)',
  INVALID_PAID_AMOUNT: 'ចំនួនប្រាក់បង់មិនត្រឹមត្រូវ (Invalid payment amount)',
  SALE_SUCCESS: 'ការលក់ត្រូវបានរក្សាទុកដោយជោគជ័យ (Sale completed successfully)',
  SALE_FAILED: 'បរាជ័យក្នុងការកត់ត្រាការលក់ (Failed to record sale)',
  CUSTOMER_REQUIRED: 'សូមជ្រើសរើសអតិថិជន (Please select or create a customer)',
  PRODUCT_NOT_FOUND: 'រកមិនឃើញទំនិញ (Product not found)',
};
