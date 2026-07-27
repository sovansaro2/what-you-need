import { ArrowUpRight, ArrowDownRight, Wallet, ShoppingBag, Package } from 'lucide-react';
import {
  RawFinanceTotals,
  RawSalesTotals,
  RawInventoryTotals,
  DashboardSummary,
  RecentActivityItem,
  SummaryMetric,
} from '../types';
import { formatCurrency } from '@/utils/formatters';

export const dashboardMapper = {
  /**
   * Maps raw domain totals into unified RecentActivityItem list.
   */
  mapToRecentActivities(recentSales: any[], recentTransactions: any[]): RecentActivityItem[] {
    const saleActivities: RecentActivityItem[] = recentSales.map((s) => ({
      id: `sale-${s.id}`,
      title: `ការលក់ ${s.sale_number || ''}`.trim(),
      subtitle: 'ប្រតិបត្តិការលក់ (POS)',
      amount: `+${formatCurrency(s.total_amount || 0)}`,
      date: s.sold_at || 'ថ្មីៗ',
      type: 'sale',
    }));

    const txActivities: RecentActivityItem[] = recentTransactions.map((tx) => ({
      id: `tx-${tx.id}`,
      title: tx.note || (tx.type === 'income' ? 'កំណត់ត្រាចំណូល' : 'កំណត់ត្រាចំណាយ'),
      subtitle: tx.type === 'income' ? 'ចំណូលសាច់ប្រាក់' : 'ចំណាយសាច់ប្រាក់',
      amount: `${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount || 0)}`,
      date: tx.transaction_date || tx.created_at || 'ថ្មីៗ',
      type: tx.type as 'income' | 'expense',
    }));

    const combined = [...saleActivities, ...txActivities];
    // Sort descending by date
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined.slice(0, 7);
  },

  /**
   * Maps raw totals from Finance, Sales, and Inventory into DashboardSummary
   */
  mapToDashboardSummary(
    finance: RawFinanceTotals,
    sales: RawSalesTotals,
    inventory: RawInventoryTotals
  ): DashboardSummary {
    const totalRevenue = sales.totalSalesRevenue + finance.totalIncome;
    const netProfit = totalRevenue - finance.totalExpense;
    const recentActivities = this.mapToRecentActivities(sales.recentSales, finance.recentTransactions);

    return {
      totalIncome: finance.totalIncome,
      totalExpense: finance.totalExpense,
      netProfit,
      totalRevenue,
      totalSalesCount: sales.totalSalesCount,
      totalProductsCount: inventory.totalProductsCount,
      inventoryValue: inventory.inventoryValue,
      lowStockCount: inventory.lowStockCount,
      transactionCount: finance.transactionCount,
      recentSales: sales.recentSales,
      recentTransactions: finance.recentTransactions,
      recentActivities,
    };
  },

  /**
   * Converts DashboardSummary into SummaryMetric cards for UI display.
   */
  mapToSummaryMetrics(summary: DashboardSummary, loading: boolean = false): SummaryMetric[] {
    return [
      {
        id: 'metric-income',
        label: 'ចំណូលសរុប (Sales + Income)',
        value: loading ? '...' : formatCurrency(summary.totalRevenue),
        isPositive: true,
        type: 'income',
        icon: ArrowUpRight,
      },
      {
        id: 'metric-expense',
        label: 'ចំណាយសរុប',
        value: loading ? '...' : formatCurrency(summary.totalExpense),
        isPositive: false,
        type: 'expense',
        icon: ArrowDownRight,
      },
      {
        id: 'metric-profit',
        label: 'ប្រាក់ចំណេញសុទ្ធ',
        value: loading ? '...' : formatCurrency(summary.netProfit),
        isPositive: summary.netProfit >= 0,
        type: 'profit',
        icon: Wallet,
      },
      {
        id: 'metric-inventory',
        label: 'តម្លៃស្តុក / ទំនិញទាប',
        value: loading ? '...' : `${formatCurrency(summary.inventoryValue)} (${summary.lowStockCount} ទាប)`,
        isPositive: summary.lowStockCount === 0,
        type: 'inventory',
        icon: Package,
      },
      {
        id: 'metric-sales',
        label: 'ចំនួនការលក់',
        value: loading ? '...' : `${summary.totalSalesCount} ប្រតិបត្តិការ`,
        isPositive: true,
        type: 'sales',
        icon: ShoppingBag,
      },
    ];
  },
};
