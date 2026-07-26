import { StockMovementType, MovementSource } from '../types';

export const MOVEMENT_TYPES: StockMovementType[] = [
  'stock_in',
  'sale',
  'adjustment',
  'damage',
  'expired',
];

export const KHMER_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  stock_in: 'នាំចូលស្តុក',
  sale: 'លក់',
  adjustment: 'កែតម្រូវស្តុក',
  damage: 'ខូចខាត',
  expired: 'ផុតកំណត់',
};

export const KHMER_MOVEMENT_DESCRIPTIONS: Record<StockMovementType, string> = {
  stock_in: 'បន្ថែមចំនួនស្តុកថ្មីចូលក្នុងឃ្លាំង',
  sale: 'កាត់ស្តុកចេញតាមរយៈការលក់ទំនិញ',
  adjustment: 'កែតម្រូវទិន្នន័យស្តុកឲ្យត្រូវនឹងស្តុកជាក់ស្តែង',
  damage: 'កាត់ស្តុកចេញដោយសារទំនិញខូចខាត',
  expired: 'កាត់ស្តុកចេញដោយសារទំនិញផុតកាលបរិច្ឆេទ',
};

export const KHMER_SOURCE_LABELS: Record<MovementSource, string> = {
  manual: 'បញ្ចូលដោយផ្ទាល់',
  pos: 'ប្រព័ន្ធលក់ (POS)',
  purchase: 'ការបញ្ជាទិញ (Purchase)',
  system: 'ប្រព័ន្ធស្វ័យប្រវត្តិ',
  adjustment: 'ការកែតម្រូវ',
};

export const KHMER_MOVEMENT_ERRORS = {
  INVALID_QUANTITY: 'បរិមាណត្រូវតែជាចំនួនវិជ្ជមានធំជាង ០',
  MISSING_QUANTITY: 'សូមបញ្ចូលចំនួនបរិមាណស្តុក',
  INSUFFICIENT_STOCK: 'ចំនួនស្តុកមិនគ្រប់គ្រាន់សម្រាប់ប្រតិបត្តិការនេះឡើយ',
  MISSING_REASON: 'សូមជ្រើសរើស ឬបញ្ចូលមូលហេតុនៃការកែតម្រូវស្តុក',
  ARCHIVED_PRODUCT: 'មិនអាចធ្វើប្រតិបត្តិការស្តុកលើទំនិញដែលបានរក្សាទុកក្នុងប័ណ្ណសារបានឡើយ',
  PRODUCT_NOT_FOUND: 'រកមិនឃើញទិន្នន័យទំនិញនៅក្នុងប្រព័ន្ធឡើយ',
  NETWORK_FAILURE: 'មានបញ្ហាតភ្ជាប់បណ្តាញ សូមព្យាយាមម្តងទៀត',
  DUPLICATE_SUBMIT: 'ប្រតិបត្តិការកំពុងដំណើរការ សូមរង់ចាំមួយភ្លែត',
  UNEXPECTED_ERROR: 'មានកំហុសមិនរំពឹងទុកបានកើតឡើង',
  MAX_QUANTITY_EXCEEDED: 'បរិមាណស្តុកបញ្ចូលលើសពីកម្រិតកំណត់អតិបរមា (១,០០០,០០០)',
};

export const KHMER_MOVEMENT_SUCCESS = {
  MOVEMENT_CREATED: 'កត់ត្រាប្រតិបត្តិការស្តុកបានជោគជ័យ',
  STOCK_UPDATED: 'បច្ចុប្បន្នភាពស្តុកទំនិញត្រូវបានធ្វើបច្ចុប្បន្នភាព',
};

export const DEFAULT_ADJUSTMENT_REASONS: string[] = [
  'រាប់ស្តុកជាក់ស្តែង (Physical Count)',
  'ទំនិញបាត់បង់ (Lost Stock)',
  'កំហុសបញ្ចូលទិន្នន័យ (Data Entry Error)',
  'ការដោះដូរទំនិញ (Product Exchange)',
  'ផ្សេងៗ (Other)',
];

export const DEFAULT_DAMAGE_REASONS: string[] = [
  'ខូចខាតពេលដឹកជញ្ជូន (Transport Damage)',
  'ខូចខាតក្នុងឃ្លាំង (Warehouse Damage)',
  'ទំនិញមានវិបត្តិគុណភាព (Defective Product)',
  'ផ្សេងៗ (Other)',
];

export const DEFAULT_EXPIRED_REASONS: string[] = [
  'ផុតកាលបរិច្ឆេទប្រើប្រាស់ (Passed Expiry Date)',
  'ខូចគុណភាពតាមកាលវេលា (Deterioration)',
  'ផ្សេងៗ (Other)',
];

export const STATUS_COLORS: Record<StockMovementType, {
  bg: string;
  text: string;
  border: string;
  badge: string;
}> = {
  stock_in: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  sale: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
  },
  adjustment: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  damage: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
  },
  expired: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
  },
};

export const ICON_MAPPING: Record<StockMovementType, string> = {
  stock_in: 'ArrowDownLeft',
  sale: 'ShoppingCart',
  adjustment: 'SlidersHorizontal',
  damage: 'AlertTriangle',
  expired: 'CalendarX',
};

export const DEFAULT_CONFIG = {
  MAX_MOVEMENT_QUANTITY: 1_000_000,
  MIN_MOVEMENT_QUANTITY: 0.0001,
  DEFAULT_PAGE_SIZE: 20,
  HISTORY_FETCH_LIMIT: 100,
};
