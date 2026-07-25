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

const TX_STORAGE_PREFIX = 'wyn_transactions_';
const CAT_STORAGE_PREFIX = 'wyn_categories_';

const getLocalTransactions = (userId: string): Transaction[] => {
  try {
    const raw = localStorage.getItem(`${TX_STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalTransactions = (userId: string, txs: Transaction[]): void => {
  try {
    localStorage.setItem(`${TX_STORAGE_PREFIX}${userId}`, JSON.stringify(txs));
  } catch (err) {
    console.warn('Failed to save transactions to localStorage:', err);
  }
};

const getLocalCategories = (userId: string): TransactionCategory[] => {
  try {
    const raw = localStorage.getItem(`${CAT_STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalCategories = (userId: string, cats: TransactionCategory[]): void => {
  try {
    localStorage.setItem(`${CAT_STORAGE_PREFIX}${userId}`, JSON.stringify(cats));
  } catch (err) {
    console.warn('Failed to save categories to localStorage:', err);
  }
};

export const financeService = {
  /**
   * Fetch all transactions for the specified user ID, ordered by transaction_date desc.
   * Uses localStorage as fallback cache on network failure.
   */
  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!userId) return [];

    const cached = getLocalTransactions(userId);

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
        return cached;
      }

      const txList = (data as Transaction[]) || [];
      setLocalTransactions(userId, txList);
      return txList;
    } catch {
      return cached;
    }
  },


  /**
   * Insert a new transaction record for the user.
   */
  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const localId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newTx: Transaction = {
      id: localId,
      user_id: input.user_id,
      type: input.type,
      amount: input.amount,
      category_id: input.category_id || null,
      note: input.note || null,
      transaction_date: input.transaction_date,
      created_at: new Date().toISOString(),
    };

    // Update local cache first
    const current = getLocalTransactions(input.user_id);
    setLocalTransactions(input.user_id, [newTx, ...current]);

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

      if (!error && data) {
        // Replace temp item with server item
        const updated = getLocalTransactions(input.user_id).map((tx) =>
          tx.id === localId ? (data as Transaction) : tx
        );
        setLocalTransactions(input.user_id, updated);
        return data as Transaction;
      }
    } catch (err: any) {
      console.warn('financeService.createTransaction network save warning:', err?.message || err);
    }

    return newTx;
  },

  /**
   * Update an existing transaction record by ID.
   */
  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.type !== undefined) updatePayload.type = input.type;
    if (input.amount !== undefined) updatePayload.amount = input.amount;
    if (input.category_id !== undefined) updatePayload.category_id = input.category_id;
    if (input.note !== undefined) updatePayload.note = input.note;
    if (input.transaction_date !== undefined) updatePayload.transaction_date = input.transaction_date;

    let targetUserId = '';
    // Update local cache
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(TX_STORAGE_PREFIX)) {
        try {
          const list: Transaction[] = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = list.findIndex((t) => t.id === id);
          if (idx !== -1) {
            targetUserId = list[idx].user_id;
            list[idx] = { ...list[idx], ...input, updated_at: updatePayload.updated_at };
            localStorage.setItem(key, JSON.stringify(list));
            break;
          }
        } catch {}
      }
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (!error && data) {
        return data as Transaction;
      }
    } catch (err: any) {
      console.warn('financeService.updateTransaction network warning:', err?.message || err);
    }

    return {
      id,
      user_id: targetUserId,
      type: input.type || 'expense',
      amount: input.amount || 0,
      category_id: input.category_id || null,
      note: input.note || null,
      transaction_date: input.transaction_date || new Date().toISOString(),
    } as Transaction;
  },

  /**
   * Delete a transaction record by ID.
   */
  async deleteTransaction(id: string): Promise<boolean> {
    // Delete from local cache
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(TX_STORAGE_PREFIX)) {
        try {
          const list: Transaction[] = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = list.filter((t) => t.id !== id);
          if (filtered.length !== list.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {}
      }
    }

    try {
      await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
    } catch (err: any) {
      console.warn('financeService.deleteTransaction network warning:', err?.message || err);
    }

    return true;
  },

  /**
   * Ensure user has default categories created if they currently have no categories.
   */
  async ensureDefaultCategories(userId: string): Promise<TransactionCategory[]> {
    if (!userId) return [];

    let currentCats = getLocalCategories(userId);

    if (currentCats.length === 0) {
      currentCats = [
        ...DEFAULT_INCOME_CATEGORIES.map((name, index) => ({
          id: `cat_inc_${index}`,
          user_id: userId,
          name,
          type: 'income' as TransactionType,
          created_at: new Date().toISOString(),
        })),
        ...DEFAULT_EXPENSE_CATEGORIES.map((name, index) => ({
          id: `cat_exp_${index}`,
          user_id: userId,
          name,
          type: 'expense' as TransactionType,
          created_at: new Date().toISOString(),
        })),
      ];
      setLocalCategories(userId, currentCats);
    }

    try {
      const { data: existing } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (existing && existing.length > 0) {
        setLocalCategories(userId, existing as TransactionCategory[]);
        return existing as TransactionCategory[];
      }

      // Populate default categories to Supabase
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

      await supabase
        .from('categories')
        .upsert(defaultsToInsert, { onConflict: 'user_id, name', ignoreDuplicates: true });

      const { data: allCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (allCategories && allCategories.length > 0) {
        setLocalCategories(userId, allCategories as TransactionCategory[]);
        return allCategories as TransactionCategory[];
      }
    } catch (err: any) {
      console.warn('financeService.ensureDefaultCategories network warning:', err?.message || err);
    }

    return currentCats;
  },

  /**
   * Fetch all transaction categories for a user.
   */
  async getCategories(userId: string, type?: TransactionType): Promise<TransactionCategory[]> {
    if (!userId) return [];

    let cached = getLocalCategories(userId);
    if (cached.length === 0) {
      cached = await this.ensureDefaultCategories(userId);
    }

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

      if (!error && data && data.length > 0) {
        setLocalCategories(userId, data as TransactionCategory[]);
        return data as TransactionCategory[];
      }
    } catch (err: any) {
      console.warn('financeService.getCategories network warning:', err?.message || err);
    }

    if (type) {
      return cached.filter((c) => c.type === type);
    }
    return cached;
  },

  /**
   * Insert a new custom category for a user.
   */
  async createCategory(input: CreateCategoryInput): Promise<TransactionCategory> {
    const localCat: TransactionCategory = {
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: input.user_id,
      name: input.name,
      type: input.type,
      created_at: new Date().toISOString(),
    };

    const currentCats = getLocalCategories(input.user_id);
    setLocalCategories(input.user_id, [...currentCats, localCat]);

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

      if (!error && data) {
        return data as TransactionCategory;
      }
    } catch (err: any) {
      console.warn('financeService.createCategory network warning:', err?.message || err);
    }

    return localCat;
  },
};

