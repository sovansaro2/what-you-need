import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { financeService } from '../services/financeService';
import { formatUserErrorMessage } from '@/core/errors';
import {
  Transaction,
  TransactionCategory,
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateCategoryInput,
  TransactionType,
} from '../types';

export const useTransactions = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const businessId = profile?.business_id || user?.id;

  /**
   * Fetch business transactions from Supabase
   */
  const fetchTransactions = useCallback(async () => {
    if (!businessId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await financeService.getTransactions(businessId);
      setTransactions(data);
    } catch (err: any) {
      setError(formatUserErrorMessage(err, 'Failed to fetch transactions.'));
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  /**
   * Fetch categories for business
   */
  const fetchCategories = useCallback(async (type?: TransactionType) => {
    if (!businessId) return;
    try {
      const data = await financeService.getCategories(businessId, type);
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories in hook:', err);
    }
  }, [businessId]);

  /**
   * Add a new transaction
   */
  const addTransaction = async (
    input: Omit<CreateTransactionInput, 'business_id'>
  ): Promise<Transaction | null> => {
    if (!businessId) {
      setError('User is not authenticated.');
      return null;
    }

    setError(null);
    try {
      const newTx = await financeService.createTransaction({
        ...input,
        business_id: businessId,
      });
      setTransactions((prev) => [newTx, ...prev]);
      return newTx;
    } catch (err: any) {
      setError(formatUserErrorMessage(err, 'Failed to create transaction.'));
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
    if (!businessId) {
      setError('User is not authenticated.');
      return null;
    }

    setError(null);
    try {
      const updatedTx = await financeService.updateTransaction(id, input, businessId);
      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? updatedTx : item))
      );
      return updatedTx;
    } catch (err: any) {
      setError(formatUserErrorMessage(err, 'Failed to update transaction.'));
      return null;
    }
  };

  /**
   * Delete a transaction
   */
  const removeTransaction = async (id: string): Promise<boolean> => {
    if (!businessId) {
      setError('User is not authenticated.');
      return false;
    }

    setError(null);
    try {
      await financeService.deleteTransaction(id, businessId);
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err: any) {
      setError(formatUserErrorMessage(err, 'Failed to delete transaction.'));
      return false;
    }
  };

  /**
   * Add a custom category
   */
  const addCategory = async (
    inputOrName: Omit<CreateCategoryInput, 'business_id'> | string,
    categoryType?: TransactionType
  ): Promise<TransactionCategory | null> => {
    if (!businessId) {
      setError('User is not authenticated.');
      return null;
    }

    const payload: Omit<CreateCategoryInput, 'business_id'> =
      typeof inputOrName === 'string'
        ? { name: inputOrName, type: categoryType || 'income' }
        : inputOrName;

    try {
      const newCat = await financeService.createCategory({
        ...payload,
        business_id: businessId,
      });
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } catch (err: any) {
      setError(formatUserErrorMessage(err, 'Failed to create category.'));
      return null;
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchTransactions();
      fetchCategories();
    } else {
      setTransactions([]);
      setCategories([]);
      setLoading(false);
    }
  }, [businessId, fetchTransactions, fetchCategories]);

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
