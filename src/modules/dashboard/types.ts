import { LucideIcon } from 'lucide-react';

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  type: 'income' | 'expense' | 'profit' | 'inventory' | 'sales';
  icon: LucideIcon;
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color: string;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount?: string;
  date: string;
  type: 'income' | 'expense' | 'sale' | 'inventory';
}

export interface RawFinanceTotals {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  recentTransactions: any[];
}

export interface RawSalesTotals {
  totalSalesCount: number;
  totalSalesRevenue: number;
  recentSales: any[];
}

export interface RawInventoryTotals {
  totalProductsCount: number;
  inventoryValue: number;
  lowStockCount: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  totalRevenue: number;
  totalSalesCount: number;
  totalProductsCount: number;
  inventoryValue: number;
  lowStockCount: number;
  transactionCount: number;
  recentSales: any[];
  recentTransactions: any[];
  recentActivities: RecentActivityItem[];
}
