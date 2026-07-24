export const KHMER_COMMON_ACTIONS = {
  SAVE: 'រក្សាទុក',
  CANCEL: 'បោះបង់',
  DELETE: 'លុប',
  EDIT: 'កែប្រែ',
  ADD: 'បន្ថែម',
  BACK: 'ត្រឡប់ក្រោយ',
  SEARCH: 'ស្វែងរក',
  FILTER: 'តម្រង',
  REFRESH: 'ធ្វើបច្ចុប្បន្នភាព',
  CLOSE: 'បិទ',
  CONFIRM: 'បញ្ជាក់',
  LOADING: 'កំពុងដំណើរការ...',
  SUCCESS: 'ជោគជ័យ',
  ERROR: 'មានកំហុស',
} as const;

export const KHMER_FINANCE_TERMS = {
  INCOME: 'ចំណូល',
  EXPENSE: 'ចំណាយ',
  BALANCE: 'សមតុល្យ',
  TRANSACTION: 'ប្រតិបត្តិការ',
  CATEGORY: 'ប្រភេទ',
  AMOUNT: 'ចំនួនទឹកប្រាក់',
  DATE: 'កាលបរិច្ឆេទ',
  NOTE: 'កំណត់ចំណាំ',
  CURRENCY_RIEL: '៛',
  TOTAL_INCOME: 'ចំណូលសរុប',
  TOTAL_EXPENSE: 'ចំណាយសរុប',
} as const;

export const KHMER_SALES_TERMS = {
  PRODUCTS: 'គ្រប់គ្រងទំនិញ',
  PRODUCT_NAME: 'ឈ្មោះទំនិញ',
  STOCK: 'ស្តុក',
  CURRENT_STOCK: 'ស្តុកបច្ចុប្បន្ន',
  COST_PRICE: 'តម្លៃដើម',
  SELLING_PRICE: 'តម្លៃលក់',
  PROFIT: 'ប្រាក់ចំណេញ',
  UNIT: 'ខ្នាត / ឯកតា',
  SKU: 'កូដ SKU',
  BARCODE: 'បាកូដ',
  REORDER_LEVEL: 'កម្រិតរំលឹកស្តុកទាប',
  CATEGORY: 'ប្រភេទទំនិញ',
  DESCRIPTION: 'ការពិពណ៌នា',
  SALE_RECORD: 'កំណត់ត្រាលក់',
  SALE_DATE: 'កាលបរិច្ឆេទលក់',
  TOTAL_AMOUNT: 'សរុបទឹកប្រាក់',
  TOTAL_PROFIT: 'ចំណេញសរុប',
  STOCK_IN: 'នាំចូលស្តុក',
  STOCK_OUT: 'នាំចេញស្តុក',
  STOCK_ADJUSTMENT: 'កែសម្រួលស្តុក',
} as const;

export const KHMER_STATUS_TERMS = {
  ACTIVE: 'សកម្ម',
  INACTIVE: 'អសកម្ម',
  IN_STOCK: 'មានក្នុងស្តុក',
  LOW_STOCK: 'ស្តុកជិតអស់',
  OUT_OF_STOCK: 'អស់ពីស្តុក',
  PENDING: 'រង់ចាំ',
  COMPLETED: 'រួចរាល់',
} as const;

export const KHMER_LOADING_MESSAGES = [
  'កំពុងចាប់ផ្តើមប្រព័ន្ធ WYN...',
  'កំពុងរៀបចំទិន្នន័យអាជីវកម្ម...',
  'កំពុងផ្ទៀងផ្ទាត់សិទ្ធិ និងគណនី...',
  'កំពុងភ្ជាប់ទៅកាន់ទិន្នន័យស្តុក និងហិរញ្ញវត្ថុ...',
  'កំពុងទាញយកព័ត៌មានបច្ចុប្បន្នភាព...',
] as const;

export const KHMER_NETWORK_TERMS = {
  OFFLINE_TITLE: 'គ្មានការភ្ជាប់អ៊ីនធឺណិត',
  OFFLINE_DESC: 'សូមពិនិត្យមើលការភ្ជាប់ Wi-Fi ឬទិន្នន័យចល័តរបស់អ្នក រួចព្យាយាមម្តងទៀត។',
  RETRY: 'ព្យាយាមម្តងទៀត',
  CHECKING_CONNECTION: 'កំពុងពិនិត្យការភ្ជាប់...',
  ONLINE_RESTORED: 'បានភ្ជាប់អ៊ីនធឺណិតឡើងវិញ',
} as const;

export const KHMER_VALIDATION = {
  REQUIRED: 'សូមបំពេញព័ត៌មាននេះ',
  REQUIRED_NAME: 'សូមបញ្ចូលឈ្មោះ',
  INVALID_NUMBER: 'លេខមិនត្រឹមត្រូវ',
  NEGATIVE_NOT_ALLOWED: 'តម្លៃមិនអាចអវិជ្ជមានបានទេ',
  ITEM_NOT_FOUND: 'រកមិនឃើញទិន្នន័យ',
  CONFIRM_DELETE: 'តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?',
} as const;
