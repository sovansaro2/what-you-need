import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { financeService } from '../services/financeService';
import {
  Transaction,
  TransactionCategory,
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateCategoryInput,
  TransactionType,
} from '../types';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  /**
   * Fetch user's transactions from Supabase
   */
  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await financeService.getTransactions(userId);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetch categories for user
   */
  const fetchCategories = useCallback(async (type?: TransactionType) => {
    if (!userId) return;
    try {
      const data = await financeService.getCategories(userId, type);
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories in hook:', err);
    }
  }, [userId]);

  /**
   * Add a new transaction
   */
  const addTransaction = async (
    input: Omit<CreateTransactionInput, 'user_id'>
  ): Promise<Transaction | null> => {
    if (!userId) {
      setError('User is not authenticated.');
      return null;
    }

    setError(null);
    try {
      const newTx = await financeService.createTransaction({
        ...input,
        user_id: userId,
      });
      setTransactions((prev) => [newTx, ...prev]);
      return newTx;
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction.');
      return null;
    }
  };

  /**
   * Update an existing transaction
   */
  const editTransaction = async (
    id: string,
    input: UpdateTransactionInput
  ): Promise<Transaction | null> => {
    if (!userId) {
      setError('User is not authenticated.');
      return null;
    }

    setError(null);
    try {
      const updatedTx = await financeService.updateTransaction(id, input);
      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? updatedTx : item))
      );
      return updatedTx;
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction.');
      return null;
    }
  };

  /**
   * Delete a transaction
   */
  const removeTransaction = async (id: string): Promise<boolean> => {
    if (!userId) {
      setError('User is not authenticated.');
      return false;
    }

    setError(null);
    try {
      await financeService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction.');
      return false;
    }
  };

  /**
   * Add a custom category
   */
  const addCategory = async (
    inputOrName: Omit<CreateCategoryInput, 'user_id'> | string,
    categoryType?: TransactionType
  ): Promise<TransactionCategory | null> => {
    if (!userId) {
      setError('User is not authenticated.');
      return null;
    }

    const payload: Omit<CreateCategoryInput, 'user_id'> =
      typeof inputOrName === 'string'
        ? { name: inputOrName, type: categoryType || 'income' }
        : inputOrName;

    try {
      const newCat = await financeService.createCategory({
        ...payload,
        user_id: userId,
      });
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } catch (err: any) {
      setError(err.message || 'Failed to create category.');
      return null;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTransactions();
      fetchCategories();
    } else {
      setTransactions([]);
      setCategories([]);
      setLoading(false);
    }
  }, [userId, fetchTransactions, fetchCategories]);

  return {
    transactions,
    categories,
    loading,
    error,
    fetchTransactions,
    fetchCategories,
    addTransaction,
    editTransaction,
    removeTransaction,
    addCategory,
  };
};
