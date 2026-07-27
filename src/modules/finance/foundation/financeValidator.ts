import { ValidationError } from '@/core/errors';
import { CreateTransactionInput, UpdateTransactionInput, CreateCategoryInput } from '../types';

export const financeValidator = {
  validateCreateTransaction(input: CreateTransactionInput): void {
    const bizId = input.business_id;
    if (!bizId || !bizId.trim()) {
      throw new ValidationError('business_id is required for creating a record.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
    if (!input.type || !['income', 'expense'].includes(input.type)) {
      throw new ValidationError('Valid transaction type (income or expense) is required.', 'ប្រភេទប្រតិបត្តិការហិរញ្ញវត្ថុមិនត្រឹមត្រូវ');
    }
    if (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0) {
      throw new ValidationError('Transaction amount must be a positive number.', 'ចំនួនទឹកប្រាក់ត្រូវតែធំជាង ០');
    }
    if (!input.transaction_date || !input.transaction_date.trim()) {
      throw new ValidationError('Transaction date is required.', 'កាលបរិច្ឆេទប្រតិបត្តិការត្រូវបានទាមទារ');
    }
  },

  validateUpdateTransaction(input: UpdateTransactionInput): void {
    if (input.type && !['income', 'expense'].includes(input.type)) {
      throw new ValidationError('Valid transaction type (income or expense) is required.', 'ប្រភេទប្រតិបត្តិការហិរញ្ញវត្ថុមិនត្រឹមត្រូវ');
    }
    if (input.amount !== undefined && (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0)) {
      throw new ValidationError('Transaction amount must be a positive number.', 'ចំនួនទឹកប្រាក់ត្រូវតែធំជាង ០');
    }
  },

  validateCreateCategory(input: CreateCategoryInput): void {
    const bizId = input.business_id;
    if (!bizId || !bizId.trim()) {
      throw new ValidationError('business_id is required for creating a category.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
    if (!input.name || !input.name.trim()) {
      throw new ValidationError('Category name is required.', 'ឈ្មោះប្រភេទត្រូវបានទាមទារ');
    }
    if (!input.type || !['income', 'expense'].includes(input.type)) {
      throw new ValidationError('Valid category type (income or expense) is required.', 'ប្រភេទជម្រើសមិនត្រឹមត្រូវ');
    }
  },
};

