import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Transaction } from '../types';

interface FinanceSummaryProps {
  transactions: Transaction[];
  loading?: boolean;
}

export const FinanceSummary: React.FC<FinanceSummaryProps> = ({ transactions, loading = false }) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div id="finance-summary" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Total Income */}
      <div id="summary-income-card" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">ចំណូលសរុប</p>
          <p className="text-lg font-bold text-emerald-600 mt-1">
            {loading ? '...' : formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Total Expense */}
      <div id="summary-expense-card" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">ចំណាយសរុប</p>
          <p className="text-lg font-bold text-rose-600 mt-1">
            {loading ? '...' : formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
          <TrendingDown className="w-5 h-5" />
        </div>
      </div>

      {/* Net Balance */}
      <div id="summary-balance-card" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between sm:col-span-1 col-span-1">
        <div>
          <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">សមតុល្យប្រាក់សុទ្ធ</p>
          <p className={`text-lg font-bold mt-1 ${netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {loading ? '...' : formatCurrency(netBalance)}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${netBalance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
          <Wallet className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
