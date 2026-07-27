import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  dashboardSummaryService,
  dashboardMapper,
  dashboardEvents,
} from '../foundation';
import { DashboardSummary, SummaryMetric, RecentActivityItem } from '../types';
import { formatUserErrorMessage } from '@/core/errors';

export interface DashboardSummaryData {
  summary: DashboardSummary;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  netProfit: number;
  totalRevenue: number;
  totalSalesCount: number;
  totalProductsCount: number;
  inventoryValue: number;
  lowStockCount: number;
  transactionCount: number;
  recentTransactions: any[];
  recentActivities: RecentActivityItem[];
  summaryMetrics: SummaryMetric[];
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
}

const initialSummary: DashboardSummary = {
  totalIncome: 0,
  totalExpense: 0,
  netProfit: 0,
  totalRevenue: 0,
  totalSalesCount: 0,
  totalProductsCount: 0,
  inventoryValue: 0,
  lowStockCount: 0,
  transactionCount: 0,
  recentSales: [],
  recentTransactions: [],
  recentActivities: [],
};

export const useDashboardSummary = (): DashboardSummaryData => {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const businessId = profile?.business_id || user?.id;

  const fetchSummary = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await dashboardSummaryService.getSummary(businessId);
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard summary:', err);
      setError(formatUserErrorMessage(err, 'Failed to load dashboard summary.'));
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchSummary();

    // Subscribe to event bus updates (sale:created, finance:*, stock:*, product:*)
    const unsubscribe = dashboardEvents.subscribeToDashboardEvents(() => {
      fetchSummary();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchSummary]);

  const summaryMetrics = dashboardMapper.mapToSummaryMetrics(summary, loading);

  return {
    summary,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    balance: summary.netProfit,
    netProfit: summary.netProfit,
    totalRevenue: summary.totalRevenue,
    totalSalesCount: summary.totalSalesCount,
    totalProductsCount: summary.totalProductsCount,
    inventoryValue: summary.inventoryValue,
    lowStockCount: summary.lowStockCount,
    transactionCount: summary.transactionCount,
    recentTransactions: summary.recentTransactions,
    recentActivities: summary.recentActivities,
    summaryMetrics,
    loading,
    error,
    fetchSummary,
  };
};
