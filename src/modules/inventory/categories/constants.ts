export interface DefaultCategorySeed {
  name: string;
  description: string;
  color: string;
  is_default: boolean;
}

export const DEFAULT_KHMER_CATEGORIES: DefaultCategorySeed[] = [
  {
    name: 'ទូទៅ',
    description: 'ប្រភេទប្រព័ន្ធទូទៅសម្រាប់ទំនិញដែលគ្មានប្រភេទជាក់លាក់',
    color: '#6366f1',
    is_default: true,
  },
  {
    name: 'ភេសជ្ជៈ',
    description: 'ប្រភេទសម្រាប់ទឹកផឹក, ភេសជ្ជៈ, កាហ្វេ, តែ និងគ្រឿងកំប៉ុង',
    color: '#06b6d4',
    is_default: false,
  },
  {
    name: 'អាហារ និងនំ',
    description: 'ប្រភេទសម្រាប់អាហារ, នំចំណី, និងចំណីអាហារផ្សេងៗ',
    color: '#f59e0b',
    is_default: false,
  },
  {
    name: 'គ្រឿងទេស',
    description: 'ប្រភេទសម្រាប់គ្រឿងទេសផ្សំអាហារ និងគ្រឿងបំពង',
    color: '#10b981',
    is_default: false,
  },
  {
    name: 'សម្ភារប្រើប្រាស់',
    description: 'ប្រភេទសម្រាប់សម្ភារប្រើប្រាស់ប្រចាំថ្ងៃ និងគ្រឿងផ្ទះបាយ',
    color: '#8b5cf6',
    is_default: false,
  },
];

export const CATEGORY_COLOR_OPTIONS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Slate', hex: '#64748b' },
];

export const toKhmerNumeral = (num: number): string => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num
    .toString()
    .split('')
    .map((char) => (char >= '0' && char <= '9' ? khmerDigits[parseInt(char, 10)] : char))
    .join('');
};

export const KHMER_CATEGORY_MESSAGES = {
  NAME_REQUIRED: 'សូមបញ្ចូលឈ្មោះប្រភេទទំនិញ',
  NAME_DUPLICATE: 'ឈ្មោះប្រភេទនេះមានរួចហើយនៅក្នុងប្រព័ន្ធ',
  CANNOT_ARCHIVE_DEFAULT: 'ប្រភេទប្រព័ន្ធ "ទូទៅ" មិនអាចដាក់ចូលក្នុងប័ណ្ណសារបានទេ',
  CANNOT_ARCHIVE_IN_USE: 'មិនអាចប័ណ្ណសារប្រភេទដែលកំពុងប្រើប្រាស់ក្នុងទំនិញបានទេ',
  CREATE_SUCCESS: 'បង្កើតប្រភេទទំនិញបានជោគជ័យ',
  UPDATE_SUCCESS: 'កែប្រែប្រភេទទំនិញបានជោគជ័យ',
  ARCHIVE_SUCCESS: 'បានដាក់ប្រភេទទំនិញចូលក្នុងប័ណ្ណសារ',
  UNARCHIVE_SUCCESS: 'បានយកប្រភេទទំនិញចេញពីប័ណ្ណសារ',
  CONFIRM_ARCHIVE_TITLE: 'តើអ្នកពិតជាចង់ប័ណ្ណសារប្រភេទទំនិញនេះមែនទេ?',
  CONFIRM_ARCHIVE_BODY:
    'ប្រភេទនេះនឹងត្រូវលាក់ពីបញ្ជីជ្រើសរើសទំនិញ ប៉ុន្តែទំនិញដែលមានស្រាប់នឹងនៅរក្សាទំនាក់ទំនងដដែល។',
  UNSAVED_CHANGES_TITLE: 'មានការផ្លាស់ប្តូរមិនទាន់បានរក្សាទុក',
  UNSAVED_CHANGES_BODY: 'តើអ្នកពិតជាចង់ចាកចេញដោយមិនបានរក្សាទុកការផ្លាស់ប្តូរមែនទេ?',
};
