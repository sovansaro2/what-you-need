import React, { useState } from 'react';
import { History, Filter, Inbox } from 'lucide-react';
import { Transaction, TransactionCategory, TransactionType, UpdateTransactionInput } from '../types';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  categories?: TransactionCategory[];
  loading?: boolean;
  onDelete?: (id: string) => Promise<boolean>;
  onEdit?: (id: string, input: UpdateTransactionInput) => Promise<Transaction | null>;
  onAddClick?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories = [],
  loading = false,
  onDelete,
  onEdit,
  onAddClick,
}) => {
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div id="transaction-list-card" className="bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl shadow-2xs space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4.5 h-4.5 text-indigo-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">ប្រវត្តិប្រតិបត្តិការ</h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
            {transactions.length}
          </span>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ទាំងអស់
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
              filterType === 'income'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ចំណូល
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
              filterType === 'expense'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ចំណាយ
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-12 text-center text-xs sm:text-sm font-medium text-slate-400">
          កំពុងផ្ទុកទិន្នន័យ...
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">មិនទាន់មានកំណត់ត្រា</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {filterType === 'all'
                ? 'ចាប់ផ្តើមកត់ត្រាចំណូល និងចំណាយរបស់អ្នក'
                : `គ្មានកំណត់ត្រា${filterType === 'income' ? 'ចំណូល' : 'ចំណាយ'}នៅក្នុងប្រវត្តិឡើយ`}
            </p>
          </div>
          {onAddClick && (
            <button
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-2xs cursor-pointer min-h-[44px]"
            >
              បន្ថែមកំណត់ត្រា
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              categories={categories}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
