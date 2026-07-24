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

export const financeService = {
  /**
   * Fetch all transactions for the specified user ID, ordered by transaction_date desc.
   */
  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error.message);
        throw new Error(error.message);
      }

      return (data as Transaction[]) || [];
    } catch (err: any) {
      console.error('financeService.getTransactions error:', err);
      throw err;
    }
  },

  /**
   * Insert a new transaction record for the user.
   */
  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: input.user_id,
          type: input.type,
          amount: input.amount,
          category_id: input.category_id || null,
          note: input.note || null,
          transaction_date: input.transaction_date,
        })
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('Error creating transaction:', error.message);
        throw new Error(error.message);
      }

      return data as Transaction;
    } catch (err: any) {
      console.error('financeService.createTransaction error:', err);
      throw err;
    }
  },

  /**
   * Update an existing transaction record by ID.
   */
  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    try {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.type !== undefined) updatePayload.type = input.type;
      if (input.amount !== undefined) updatePayload.amount = input.amount;
      if (input.category_id !== undefined) updatePayload.category_id = input.category_id;
      if (input.note !== undefined) updatePayload.note = input.note;
      if (input.transaction_date !== undefined) updatePayload.transaction_date = input.transaction_date;

      const { data, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('Error updating transaction:', error.message);
        throw new Error(error.message);
      }

      return data as Transaction;
    } catch (err: any) {
      console.error('financeService.updateTransaction error:', err);
      throw err;
    }
  },

  /**
   * Delete a transaction record by ID.
   */
  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error.message);
        throw new Error(error.message);
      }

      return true;
    } catch (err: any) {
      console.error('financeService.deleteTransaction error:', err);
      throw err;
    }
  },

  /**
   * Ensure user has default categories created if they currently have no categories.
   */
  async ensureDefaultCategories(userId: string): Promise<TransactionCategory[]> {
    if (!userId) return [];

    try {
      // Check existing count first
      const { data: existing, error: checkError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (checkError) {
        console.error('Error checking categories count:', checkError.message);
        throw new Error(checkError.message);
      }

      if (existing && existing.length > 0) {
        return existing as TransactionCategory[];
      }

      // Populate default categories
      const defaultsToInsert = [
        ...DEFAULT_INCOME_CATEGORIES.map((name) => ({
          user_id: userId,
          name,
          type: 'income' as TransactionType,
        })),
        ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
          user_id: userId,
          name,
          type: 'expense' as TransactionType,
        })),
      ];

      const { data: inserted, error: insertError } = await supabase
        .from('categories')
        .insert(defaultsToInsert)
        .select('*');

      if (insertError) {
        console.error('Error seeding default categories:', insertError.message);
        const { data: fallback } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', userId);
        return (fallback as TransactionCategory[]) || [];
      }

      return (inserted as TransactionCategory[]) || [];
    } catch (err: any) {
      console.error('financeService.ensureDefaultCategories error:', err);
      return [];
    }
  },

  /**
   * Fetch all transaction categories for a user (or shared categories if permitted).
   * Automatically initializes default categories if user has 0 categories.
   */
  async getCategories(userId: string, type?: TransactionType): Promise<TransactionCategory[]> {
    if (!userId) return [];

    try {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error.message);
        throw new Error(error.message);
      }

      let catList = (data as TransactionCategory[]) || [];

      // If user has no categories at all, populate default categories
      if (catList.length === 0 && !type) {
        catList = await this.ensureDefaultCategories(userId);
      } else if (catList.length === 0 && type) {
        // If query was filtered by type and returned empty, check overall categories count
        const allCats = await this.ensureDefaultCategories(userId);
        catList = allCats.filter((c) => c.type === type);
      }

      return catList;
    } catch (err: any) {
      console.error('financeService.getCategories error:', err);
      throw err;
    }
  },

  /**
   * Insert a new custom category for a user.
   */
  async createCategory(input: CreateCategoryInput): Promise<TransactionCategory> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: input.user_id,
          name: input.name,
          type: input.type,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating category:', error.message);
        throw new Error(error.message);
      }

      return data as TransactionCategory;
    } catch (err: any) {
      console.error('financeService.createCategory error:', err);
      throw err;
    }
  },
};
