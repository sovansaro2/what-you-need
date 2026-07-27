import { dashboardRepository } from './dashboardRepository';
import { dashboardValidator } from './dashboardValidator';
import { dashboardMapper } from './dashboardMapper';
import { DashboardSummary } from '../types';
import { safeAsync } from '@/core/errors';

export const dashboardSummaryService = {
  /**
   * Main service call to get fully aggregated dashboard summary metrics.
   */
  async getSummary(businessId: string): Promise<DashboardSummary> {
    dashboardValidator.validateBusinessId(businessId);

    const [summary, err] = await safeAsync(async () => {
      // Parallel DB queries for finance, sales, and inventory
      const [financeTotals, salesTotals, inventoryTotals] = await Promise.all([
        dashboardRepository.getFinanceTotals(businessId),
        dashboardRepository.getSalesTotals(businessId),
        dashboardRepository.getInventoryTotals(businessId),
      ]);

      const rawSummary = dashboardMapper.mapToDashboardSummary(
        financeTotals,
        salesTotals,
        inventoryTotals
      );

      return dashboardValidator.sanitizeSummary(rawSummary);
    }, 'dashboardSummaryService.getSummary');

    if (err) {
      console.warn('dashboardSummaryService.getSummary error:', err);
      return {
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
    }

    return summary!;
  },
};
