import { Transaction, TransactionCategory } from '../types';

export const financeMapper = {
  /**
   * Maps a DB record from public.categories or public.expense_categories to TransactionCategory model
   */
  mapDbToCategory(record: any): TransactionCategory {
    const bizId = record.business_id || '';
    return {
      id: record.id,
      business_id: bizId,
      name: record.name || '',
      type: record.type || 'expense',
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  },

  /**
   * Maps a DB record from public.expenses or public.payments (or public.transactions) to Transaction model
   */
  mapDbToTransaction(record: any, forceType?: 'income' | 'expense'): Transaction {
    const categoryRecord = record.category || record.categories || null;
    const category = categoryRecord ? this.mapDbToCategory(categoryRecord) : null;
    const bizId = record.business_id || '';
    const type = forceType || record.type || (record.expense_number || record.incurred_at ? 'expense' : 'income');

    return {
      id: record.id,
      business_id: bizId,
      type,
      amount: Number(record.amount) || 0,
      category_id: record.category_id || null,
      note: record.notes || record.note || record.title || null,
      transaction_date: record.incurred_at || record.paid_at || record.transaction_date || record.created_at || new Date().toISOString(),
      created_at: record.created_at,
      updated_at: record.updated_at,
      category,
    };
  },

  /**
   * Maps Expense model/input to DB insertion payload for public.expenses
   */
  mapExpenseToDbPayload(businessId: string, input: any) {
    return {
      business_id: businessId,
      expense_number: `EXP-${Date.now()}`,
      title: input.note?.trim() || 'Expense',
      amount: Number(input.amount),
      currency: 'KHR',
      payment_method: 'cash',
      category_id: input.category_id || null,
      notes: input.note || null,
      incurred_at: input.transaction_date || new Date().toISOString(),
    };
  },

  /**
   * Maps Payment model/input to DB insertion payload for public.payments
   */
  mapPaymentToDbPayload(businessId: string, input: any) {
    return {
      business_id: businessId,
      payment_number: `PAY-${Date.now()}`,
      payment_method: 'cash',
      amount: Number(input.amount),
      currency: 'KHR',
      status: 'completed',
      notes: input.note || null,
      paid_at: input.transaction_date || new Date().toISOString(),
    };
  },

  /**
   * Maps Category model/input to DB insertion payload for public.categories
   */
  mapCategoryToDbPayload(businessId: string, input: any) {
    return {
      business_id: businessId,
      name: input.name?.trim(),
      type: input.type,
    };
  },
};

