import { supabase } from '@/lib/supabase';
import { businessContext } from '@/modules/inventory/foundation';
import { RawFinanceTotals, RawSalesTotals, RawInventoryTotals } from '../types';

export const dashboardRepository = {
  /**
   * Aggregate Finance totals directly from Supabase DB using live financial schema (expenses, payments).
   */
  async getFinanceTotals(businessId: string): Promise<RawFinanceTotals> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    try {
      // Query live expenses table
      const { data: expData, error: expErr } = await supabase
        .from('expenses')
        .select('id, amount, title, notes, incurred_at, created_at')
        .eq('business_id', validBusinessId)
        .is('deleted_at', null)
        .order('incurred_at', { ascending: false });

      // Query live payments table (income)
      const { data: pmtData, error: pmtErr } = await supabase
        .from('payments')
        .select('id, amount, payment_number, notes, paid_at, created_at, status')
        .eq('business_id', validBusinessId)
        .order('paid_at', { ascending: false });

      if (expErr && pmtErr) {
        console.warn('DashboardRepository.getFinanceTotals DB error:', expErr?.message || pmtErr?.message);
        return {
          totalIncome: 0,
          totalExpense: 0,
          netProfit: 0,
          transactionCount: 0,
          recentTransactions: [],
        };
      }

      let totalExpense = 0;
      const recentTx: any[] = [];
      const expenses = expData || [];

      expenses.forEach((exp) => {
        const amt = Number(exp.amount) || 0;
        totalExpense += amt;
        recentTx.push({
          id: exp.id,
          type: 'expense',
          amount: amt,
          note: exp.title || exp.notes || 'ចំណាយ',
          transaction_date: exp.incurred_at || exp.created_at,
        });
      });

      let totalIncome = 0;
      const payments = pmtData || [];

      payments.forEach((pmt) => {
        const amt = Number(pmt.amount) || 0;
        if (pmt.status === 'completed' || !pmt.status) {
          totalIncome += amt;
        }
        recentTx.push({
          id: pmt.id,
          type: 'income',
          amount: amt,
          note: pmt.notes || (pmt.payment_number ? `ទូទាត់ ${pmt.payment_number}` : 'ចំណូល'),
          transaction_date: pmt.paid_at || pmt.created_at,
        });
      });

      recentTx.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

      return {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        transactionCount: expenses.length + payments.length,
        recentTransactions: recentTx.slice(0, 5),
      };
    } catch (err) {
      console.warn('DashboardRepository.getFinanceTotals error:', err);
      return {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        transactionCount: 0,
        recentTransactions: [],
      };
    }
  },

  /**
   * Aggregate Sales totals directly from Supabase DB using business_id tenant isolation ONLY.
   */
  async getSalesTotals(businessId: string): Promise<RawSalesTotals> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('id, sale_number, total_amount, status, sold_at')
        .is('deleted_at', null)
        .eq('business_id', validBusinessId)
        .order('sold_at', { ascending: false });

      if (error) {
        console.warn('DashboardRepository.getSalesTotals DB error:', error.message);
        return {
          totalSalesCount: 0,
          totalSalesRevenue: 0,
          recentSales: [],
        };
      }

      const sales = data || [];
      let totalSalesRevenue = 0;

      sales.forEach((s) => {
        if (s.status === 'completed' || !s.status) {
          totalSalesRevenue += Number(s.total_amount) || 0;
        }
      });

      return {
        totalSalesCount: sales.length,
        totalSalesRevenue,
        recentSales: sales.slice(0, 5),
      };
    } catch (err) {
      console.warn('DashboardRepository.getSalesTotals error:', err);
      return {
        totalSalesCount: 0,
        totalSalesRevenue: 0,
        recentSales: [],
      };
    }
  },

  /**
   * Aggregate Inventory/Products totals directly from Supabase DB using business_id tenant isolation ONLY.
   */
  async getInventoryTotals(businessId: string): Promise<RawInventoryTotals> {
    const validBusinessId = businessContext.resolveBusinessId(businessId);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, current_stock, cost_price, min_stock_alert')
        .is('deleted_at', null)
        .eq('business_id', validBusinessId);

      if (error) {
        console.warn('DashboardRepository.getInventoryTotals DB error:', error.message);
        return {
          totalProductsCount: 0,
          inventoryValue: 0,
          lowStockCount: 0,
        };
      }

      const products = data || [];
      let inventoryValue = 0;
      let lowStockCount = 0;

      products.forEach((p) => {
        const stock = Number(p.current_stock) || 0;
        const cost = Number(p.cost_price) || 0;
        const minAlert = Number(p.min_stock_alert) || 5;

        inventoryValue += stock * cost;
        if (stock <= minAlert) {
          lowStockCount++;
        }
      });

      return {
        totalProductsCount: products.length,
        inventoryValue,
        lowStockCount,
      };
    } catch (err) {
      console.warn('DashboardRepository.getInventoryTotals error:', err);
      return {
        totalProductsCount: 0,
        inventoryValue: 0,
        lowStockCount: 0,
      };
    }
  },
};
