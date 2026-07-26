export interface DefaultUnitSeed {
  name: string;
  symbol: string;
  description: string;
}

export const DEFAULT_KHMER_UNITS: DefaultUnitSeed[] = [
  { name: 'ដប', symbol: 'ដប', description: 'ខ្នាតសម្រាប់វត្ថុរាវក្នុងដប (Bottle)' },
  { name: 'កំប៉ុង', symbol: 'កំប៉ុង', description: 'ខ្នាតសម្រាប់ភេសជ្ជៈ ឬអាហារកំប៉ុង (Can)' },
  { name: 'កញ្ចប់', symbol: 'កញ្ចប់', description: 'ខ្នាតសម្រាប់ទំនិញច្រកកញ្ចប់ (Pack / Package)' },
  { name: 'ប្រអប់', symbol: 'ប្រអប់', description: 'ខ្នាតសម្រាប់ទំនិញក្នុងប្រអប់ (Box)' },
  { name: 'គីឡូក្រាម', symbol: 'kg', description: 'ខ្នាតទម្ងន់គីឡូក្រាម (Kilogram / kg)' },
  { name: 'ក្រាម', symbol: 'g', description: 'ខ្នាតទម្ងន់ក្រាម (Gram / g)' },
  { name: 'លីត្រ', symbol: 'L', description: 'ខ្នាតមាឌរាវលីត្រ (Liter / L)' },
  { name: 'ដើម', symbol: 'ដើម', description: 'ខ្នាតសម្រាប់ទំនិញរាប់ដើម (Piece / Pcs)' },
  { name: 'គ្រាប់', symbol: 'គ្រាប់', description: 'ខ្នាតសម្រាប់ទំនិញរាប់គ្រាប់ (Pcs)' },
  { name: 'ក្បាល', symbol: 'ក្បាល', description: 'ខ្នាតសម្រាប់សត្វ ឬទំនិញរាប់ក្បាល (Unit)' },
  { name: 'គ្រឿង', symbol: 'គ្រឿង', description: 'ខ្នាតសម្រាប់ឧបករណ៍ ឬទំនិញរាប់គ្រឿង (Set / Pcs)' },
];

export const toKhmerNumeral = (num: number): string => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num
    .toString()
    .split('')
    .map((char) => (char >= '0' && char <= '9' ? khmerDigits[parseInt(char, 10)] : char))
    .join('');
};

export const KHMER_MESSAGES = {
  NAME_REQUIRED: 'សូមបញ្ចូលឈ្មោះខ្នាតទំនិញ',
  NAME_DUPLICATE: 'ឈ្មោះខ្នាតនេះមានរួចហើយនៅក្នុងប្រព័ន្ធ',
  SYSTEM_UNIT_NO_DELETE: 'ខ្នាតប្រព័ន្ធមិនអាចលុប ឬដាក់ចូលប័ណ្ណសារបានទេ',
  UNIT_IN_USE: 'ខ្នាតនេះកំពុងត្រូវបានប្រើប្រាស់ដោយទំនិញ មិនអាចដាក់ចូលប័ណ្ណសារបានទេ',
  SAVE_SUCCESS: 'បានរក្សាទុកខ្នាតទំនិញដោយជោគជ័យ',
  ARCHIVE_SUCCESS: 'បានដាក់ខ្នាតទំនិញចូលប័ណ្ណសារដោយជោគជ័យ',
  UNARCHIVE_SUCCESS: 'បានយកខ្នាតទំនិញចេញពីប័ណ្ណសារដោយជោគជ័យ',
  CONFIRM_ARCHIVE_TITLE: 'បញ្ជាក់ការដាក់ចូលប័ណ្ណសារ',
  CONFIRM_ARCHIVE_BODY: 'តើអ្នកពិតជាចង់ដាក់ខ្នាតទំនិញនេះចូលប័ណ្ណសារមែនទេ? ខ្នាតនេះនឹងមិនបង្ហាញក្នុងបញ្ជីជ្រើសរើសទំនិញថ្មីទៀតឡើយ។',
  CONFIRM_DISCARD_TITLE: 'បោះបង់ការផ្លាស់ប្តូរ?',
  CONFIRM_DISCARD_BODY: 'តើអ្នកពិតជាចង់ចាកចេញមែនទេ? ទិន្នន័យដែលបានបញ្ចូលនឹងត្រូវបាត់បង់។',
};
