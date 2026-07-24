import React, { useState, useRef } from 'react';
import { DollarSign, ArrowLeft, RefreshCw, PlusCircle, MinusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from './hooks/useTransactions';
import { FinanceSummary } from './components/FinanceSummary';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { TransactionType } from './types';

export const Finance: React.FC = () => {
  const navigate = useNavigate();
  const {
    transactions,
    categories,
    loading,
    error,
    addTransaction,
    editTransaction,
    removeTransaction,
    addCategory,
    fetchTransactions,
  } = useTransactions();

  const [activeFormType, setActiveFormType] = useState<TransactionType>('income');
  const formRef = useRef<HTMLDivElement>(null);

  const handleQuickAdd = (type: TransactionType) => {
    setActiveFormType(type);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const amountInput = document.getElementById('amount-input');
    if (amountInput) {
      setTimeout(() => amountInput.focus(), 300);
    }
  };

  return (
    <div id="finance-page" className="space-y-4">
      {/* Page Header */}
      <div id="finance-header" className="bg-white p-4 border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/features')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="ត្រឡប់ទៅមុខងារ"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 id="finance-title" className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> ចំណូល និង ចំណាយ
            </h2>
            <p id="finance-subtitle" className="text-xs text-slate-500 mt-0.5">
              កត់ត្រាចំណូលសាច់ប្រាក់ ចំណាយប្រតិបត្តិការ និងតាមដានសមតុល្យប្រាក់សុទ្ធ។
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchTransactions()}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-40 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="ធ្វើបច្ចុប្បន្នភាព"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* 1. Finance Summary */}
      <FinanceSummary transactions={transactions} loading={loading} />

      {/* Task 1 — Quick Action Buttons */}
      <div id="finance-quick-actions" className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleQuickAdd('income')}
          className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[50px] text-sm sm:text-base"
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          <span>បន្ថែមចំណូល</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickAdd('expense')}
          className="py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[50px] text-sm sm:text-base"
        >
          <MinusCircle className="w-5 h-5 shrink-0" />
          <span>បន្ថែមចំណាយ</span>
        </button>
      </div>

      {/* 2. Add Transaction Form */}
      <div ref={formRef}>
        <TransactionForm
          categories={categories}
          activeType={activeFormType}
          onAddTransaction={addTransaction}
          onAddCategory={(name, type) => addCategory(name, type)}
        />
      </div>

      {/* 3. Transaction History */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        loading={loading}
        onDelete={removeTransaction}
        onEdit={editTransaction}
        onAddClick={() => handleQuickAdd('income')}
      />
    </div>
  );
};

