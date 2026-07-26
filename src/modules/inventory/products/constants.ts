export const KHMER_PRODUCT_MESSAGES = {
  NAME_REQUIRED: 'សូមបញ្ចូលឈ្មោះទំនិញ',
  UNIT_REQUIRED: 'សូមជ្រើសរើសខ្នាតទំនិញ',
  CATEGORY_REQUIRED: 'សូមជ្រើសរើសប្រភេទទំនិញ',
  COST_PRICE_INVALID: 'តម្លៃដើមត្រូវតែធំជាង ឬស្មើ ០',
  SELLING_PRICE_INVALID: 'តម្លៃលក់ត្រូវតែធំជាង ឬស្មើ ០',
  SKU_DUPLICATE: 'កូដសម្គាល់ (SKU) នេះមានរួចហើយនៅក្នុងប្រព័ន្ធ',
  MIN_STOCK_INVALID: 'កម្រិតស្តុកទាបបំផុតត្រូវតែធំជាង ឬស្មើ ០',
  CREATE_SUCCESS: 'បង្កើតទំនិញថ្មីបានជោគជ័យ',
  UPDATE_SUCCESS: 'ធ្វើបច្ចុប្បន្នភាពទំនិញបានជោគជ័យ',
  ARCHIVE_SUCCESS: 'បានដាក់ទំនិញចូលក្នុងប័ណ្ណសារ',
  UNARCHIVE_SUCCESS: 'បានយកទំនិញចេញពីប័ណ្ណសារ',
  NOT_FOUND: 'រកមិនឃើញទំនិញឡើយ',
  STOCK_READ_ONLY: 'ចំនួនស្តុកអាចផ្លាស់ប្តូរបានតែតាមរយៈប្រតិបត្តិការស្តុកប៉ុណ្ណោះ',
};

export const DEFAULT_MIN_STOCK_ALERT = 5;

export const toKhmerNumeral = (num: number): string => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num
    .toString()
    .split('')
    .map((char) => (char >= '0' && char <= '9' ? khmerDigits[parseInt(char, 10)] : char))
    .join('');
};

export const PRODUCT_STATUS_CONFIG = {
  IN_STOCK: {
    label: 'មានក្នុងស្តុក',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  LOW_STOCK: {
    label: 'ស្តុកទាប',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  OUT_OF_STOCK: {
    label: 'អស់ពីស្តុក',
    colorClass: 'bg-red-50 text-red-700 border-red-200',
  },
  ARCHIVED: {
    label: 'ប័ណ្ណសារ',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};
