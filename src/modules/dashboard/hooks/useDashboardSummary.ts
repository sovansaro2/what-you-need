import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { financeService } from '@/modules/finance/services/financeService';
import { Transaction } from '@/modules/finance/types';

export interface DashboardSummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
}

export const useDashboardSummary = (): DashboardSummaryData => {
  const { user } = useAuth();
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactions = await financeService.getTransactions(user.id);

      let incomeSum = 0;
      let expenseSum = 0;

      transactions.forEach((tx) => {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') {
          incomeSum += amt;
        } else if (tx.type === 'expense') {
          expenseSum += amt;
        }
      });

      setTotalIncome(incomeSum);
      setTotalExpense(expenseSum);
      setBalance(incomeSum - expenseSum);
      setTransactionCount(transactions.length);
      setRecentTransactions(transactions.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to fetch dashboard summary:', err);
      setError(err.message || 'Error loading dashboard summary');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount,
    recentTransactions,
    loading,
    error,
    fetchSummary,
  };
};
