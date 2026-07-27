import { supabase } from '@/lib/supabase';
import {
  Transaction,
  TransactionCategory,
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateCategoryInput,
  TransactionType,
} from '../types';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../constants';
import {
  financeContext,
  financeValidator,
  financeMapper,
  financeEvents,
} from '../foundation';
import { safeAsync, DatabaseError, NotFoundError } from '@/core/errors';

export const financeService = {
  /**
   * Fetch all transactions (expenses & payments) for a business directly from Supabase DB.
   */
  async getTransactions(businessId: string): Promise<Transaction[]> {
    const validBusinessId = financeContext.resolveBusinessId(businessId);

    const [data, err] = await safeAsync(async () => {
      // Fetch expenses
      const { data: expensesData, error: expErr } = await supabase
        .from('expenses')
        .select('*')
        .eq('business_id', validBusinessId)
        .order('incurred_at', { ascending: false });

      // Fetch payments
      const { data: paymentsData, error: pmtErr } = await supabase
        .from('payments')
        .select('*')
        .eq('business_id', validBusinessId)
        .order('paid_at', { ascending: false });

      const results: Transaction[] = [];

      if (!expErr && expensesData) {
        expensesData.forEach((rec) => {
          results.push(financeMapper.mapDbToTransaction(rec, 'expense'));
        });
      }

      if (!pmtErr && paymentsData) {
        paymentsData.forEach((rec) => {
          results.push(financeMapper.mapDbToTransaction(rec, 'income'));
        });
      }

      // If both return empty or error, try fallback transactions query strictly with business_id
      if (results.length === 0) {
        const { data: txData } = await supabase
          .from('transactions')
          .select('*, category:categories(*)')
          .eq('business_id', validBusinessId)
          .order('transaction_date', { ascending: false });

        if (txData && txData.length > 0) {
          txData.forEach((rec) => {
            results.push(financeMapper.mapDbToTransaction(rec));
          });
        }
      }

      // Sort by transaction_date descending
      results.sort(
        (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
      );

      return results;
    }, 'financeService.getTransactions');

    if (err) throw err;
    return data || [];
  },

  /**
   * Insert a new expense or payment record for a business.
   */
  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const businessId = financeContext.resolveBusinessId(input.business_id);
    financeValidator.validateCreateTransaction({ ...input, business_id: businessId });

    const [data, err] = await safeAsync(async () => {
      if (input.type === 'expense') {
        const payload = financeMapper.mapExpenseToDbPayload(businessId, input);
        const { data: expData, error: expErr } = await supabase
          .from('expenses')
          .insert(payload)
          .select('*')
          .single();

        if (!expErr && expData) {
          const newTx = financeMapper.mapDbToTransaction(expData, 'expense');
          financeEvents.emitTransactionCreated(newTx, businessId);
          return newTx;
        }
      } else {
        const payload = financeMapper.mapPaymentToDbPayload(businessId, input);
        const { data: pmtData, error: pmtErr } = await supabase
          .from('payments')
          .insert(payload)
          .select('*')
          .single();

        if (!pmtErr && pmtData) {
          const newTx = financeMapper.mapDbToTransaction(pmtData, 'income');
          financeEvents.emitTransactionCreated(newTx, businessId);
          return newTx;
        }
      }

      // Fallback insertion into transactions table strictly scoped by business_id
      const fallbackPayload = {
        business_id: businessId,
        type: input.type,
        amount: Number(input.amount),
        category_id: input.category_id || null,
        note: input.note || null,
        transaction_date: input.transaction_date,
      };

      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .insert(fallbackPayload)
        .select('*, category:categories(*)')
        .single();

      if (txErr) {
        throw new DatabaseError(txErr, 'financeService.createTransaction');
      }

      const newTx = financeMapper.mapDbToTransaction(txData);
      financeEvents.emitTransactionCreated(newTx, businessId);
      return newTx;
    }, 'financeService.createTransaction');

    if (err) throw err;
    return data!;
  },

  /**
   * Update an existing transaction record by ID.
   */
  async updateTransaction(id: string, input: UpdateTransactionInput, businessId?: string): Promise<Transaction> {
    const validBusinessId = businessId ? financeContext.resolveBusinessId(businessId) : undefined;
    financeValidator.validateUpdateTransaction(input);

    const [data, err] = await safeAsync(async () => {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.amount !== undefined) updatePayload.amount = Number(input.amount);
      if (input.note !== undefined) {
        updatePayload.notes = input.note || null;
        updatePayload.title = input.note || 'Expense';
      }
      if (input.transaction_date !== undefined) {
        updatePayload.incurred_at = input.transaction_date;
        updatePayload.paid_at = input.transaction_date;
      }

      // Try updating expenses table first
      if (validBusinessId) {
        const { data: expData } = await supabase
          .from('expenses')
          .update(updatePayload)
          .eq('id', id)
          .eq('business_id', validBusinessId)
          .select('*')
          .maybeSingle();

        if (expData) {
          const updatedTx = financeMapper.mapDbToTransaction(expData, 'expense');
          financeEvents.emitTransactionUpdated(updatedTx, validBusinessId);
          return updatedTx;
        }

        // Try updating payments table next
        const { data: pmtData } = await supabase
          .from('payments')
          .update(updatePayload)
          .eq('id', id)
          .eq('business_id', validBusinessId)
          .select('*')
          .maybeSingle();

        if (pmtData) {
          const updatedTx = financeMapper.mapDbToTransaction(pmtData, 'income');
          financeEvents.emitTransactionUpdated(updatedTx, validBusinessId);
          return updatedTx;
        }
      }

      // Fallback update on transactions table strictly with business_id
      let query = supabase.from('transactions').update({
        updated_at: new Date().toISOString(),
        amount: input.amount !== undefined ? Number(input.amount) : undefined,
        note: input.note || null,
        transaction_date: input.transaction_date,
      }).eq('id', id);

      if (validBusinessId) {
        query = query.eq('business_id', validBusinessId);
      }

      const { data: txData, error: txErr } = await query
        .select('*, category:categories(*)')
        .maybeSingle();

      if (txErr) {
        throw new DatabaseError(txErr, 'financeService.updateTransaction');
      }
      if (!txData) {
        throw new NotFoundError('Transaction', id);
      }

      const updatedTx = financeMapper.mapDbToTransaction(txData);
      financeEvents.emitTransactionUpdated(updatedTx, validBusinessId || '');
      return updatedTx;
    }, 'financeService.updateTransaction');

    if (err) throw err;
    return data!;
  },

  /**
   * Delete a transaction record by ID.
   */
  async deleteTransaction(id: string, businessId?: string): Promise<boolean> {
    const validBusinessId = businessId ? financeContext.resolveBusinessId(businessId) : undefined;

    const [, err] = await safeAsync(async () => {
      if (validBusinessId) {
        await supabase.from('expenses').delete().eq('id', id).eq('business_id', validBusinessId);
        await supabase.from('payments').delete().eq('id', id).eq('business_id', validBusinessId);

        let txQuery = supabase.from('transactions').delete().eq('id', id).eq('business_id', validBusinessId);
        await txQuery;
        financeEvents.emitTransactionDeleted(id, validBusinessId);
      } else {
        await supabase.from('expenses').delete().eq('id', id);
        await supabase.from('payments').delete().eq('id', id);
        await supabase.from('transactions').delete().eq('id', id);
      }

      return true;
    }, 'financeService.deleteTransaction');

    if (err) throw err;
    return true;
  },

  /**
   * Ensure default categories exist in Supabase for this business.
   */
  async ensureDefaultCategories(businessId: string): Promise<TransactionCategory[]> {
    const validBusinessId = financeContext.resolveBusinessId(businessId);

    const [data, err] = await safeAsync(async () => {
      let { data: existing, error: fetchErr } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', validBusinessId);

      if (fetchErr && fetchErr.message.includes('business_id')) {
        const { data: fallbackExisting } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', validBusinessId);
        existing = fallbackExisting;
        fetchErr = null;
      }

      if (fetchErr) {
        throw new DatabaseError(fetchErr, 'financeService.ensureDefaultCategories.fetch');
      }

      if (existing && existing.length > 0) {
        return existing.map((cat) => financeMapper.mapDbToCategory(cat));
      }

      // Populate default categories
      const defaultsToInsert = [
        ...DEFAULT_INCOME_CATEGORIES.map((name) => ({
          business_id: validBusinessId,
          user_id: validBusinessId,
          name,
          type: 'income' as TransactionType,
        })),
        ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
          business_id: validBusinessId,
          user_id: validBusinessId,
          name,
          type: 'expense' as TransactionType,
        })),
      ];

      const { error: insertErr } = await supabase
        .from('categories')
        .upsert(defaultsToInsert, { ignoreDuplicates: true });

      if (insertErr) {
        console.warn('Upsert default categories warning:', insertErr.message);
      }

      let { data: allCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', validBusinessId);

      if (!allCategories || allCategories.length === 0) {
        const { data: fallbackAll } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', validBusinessId);
        allCategories = fallbackAll;
      }

      return (allCategories || []).map((cat) => financeMapper.mapDbToCategory(cat));
    }, 'financeService.ensureDefaultCategories');

    if (err) throw err;
    return data || [];
  },

  /**
   * Fetch all categories for a business.
   */
  async getCategories(businessId: string, type?: TransactionType): Promise<TransactionCategory[]> {
    const validBusinessId = financeContext.resolveBusinessId(businessId);

    const [data, err] = await safeAsync(async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('business_id', validBusinessId)
        .order('name', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      let { data, error } = await query;

      if (error && error.message.includes('business_id')) {
        let fallbackQuery = supabase
          .from('categories')
          .select('*')
          .eq('user_id', validBusinessId)
          .order('name', { ascending: true });

        if (type) {
          fallbackQuery = fallbackQuery.eq('type', type);
        }

        const fallbackRes = await fallbackQuery;
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (error) {
        throw new DatabaseError(error, 'financeService.getCategories');
      }

      if (!data || data.length === 0) {
        return await this.ensureDefaultCategories(validBusinessId);
      }

      return data.map((cat) => financeMapper.mapDbToCategory(cat));
    }, 'financeService.getCategories');

    if (err) throw err;
    return data || [];
  },

  /**
   * Create a new custom category.
   */
  async createCategory(input: CreateCategoryInput): Promise<TransactionCategory> {
    const businessId = financeContext.resolveBusinessId(input.business_id);
    financeValidator.validateCreateCategory({ ...input, business_id: businessId });

    const [data, err] = await safeAsync(async () => {
      const payload = financeMapper.mapCategoryToDbPayload(businessId, input);

      const { data, error } = await supabase
        .from('categories')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        throw new DatabaseError(error, 'financeService.createCategory');
      }

      return financeMapper.mapDbToCategory(data);
    }, 'financeService.createCategory');

    if (err) throw err;
    return data!;
  },
};

