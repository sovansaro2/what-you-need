import { ValidationError } from '@/core/errors';
import { DashboardSummary } from '../types';

export const dashboardValidator = {
  validateBusinessId(businessId: string): void {
    if (!businessId || !businessId.trim()) {
      throw new ValidationError('business_id is required for dashboard metrics aggregation.', 'សូមផ្តល់អត្តសញ្ញាណអាជីវកម្ម');
    }
  },

  sanitizeSummary(summary: DashboardSummary): DashboardSummary {
    return {
      ...summary,
      totalIncome: Number.isNaN(summary.totalIncome) ? 0 : Math.max(0, summary.totalIncome),
      totalExpense: Number.isNaN(summary.totalExpense) ? 0 : Math.max(0, summary.totalExpense),
      netProfit: Number.isNaN(summary.netProfit) ? 0 : summary.netProfit,
      totalRevenue: Number.isNaN(summary.totalRevenue) ? 0 : Math.max(0, summary.totalRevenue),
      totalSalesCount: Number.isNaN(summary.totalSalesCount) ? 0 : Math.max(0, summary.totalSalesCount),
      totalProductsCount: Number.isNaN(summary.totalProductsCount) ? 0 : Math.max(0, summary.totalProductsCount),
      inventoryValue: Number.isNaN(summary.inventoryValue) ? 0 : Math.max(0, summary.inventoryValue),
      lowStockCount: Number.isNaN(summary.lowStockCount) ? 0 : Math.max(0, summary.lowStockCount),
      transactionCount: Number.isNaN(summary.transactionCount) ? 0 : Math.max(0, summary.transactionCount),
      recentSales: Array.isArray(summary.recentSales) ? summary.recentSales : [],
      recentTransactions: Array.isArray(summary.recentTransactions) ? summary.recentTransactions : [],
      recentActivities: Array.isArray(summary.recentActivities) ? summary.recentActivities : [],
    };
  },
};
