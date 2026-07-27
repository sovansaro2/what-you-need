import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Calendar, FileText, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TransactionCategory, TransactionType, CreateTransactionInput } from '../types';
import { CategorySelector } from './CategorySelector';

interface TransactionFormProps {
  categories: TransactionCategory[];
  onAddTransaction: (input: Omit<CreateTransactionInput, 'business_id'>) => Promise<any>;
  onAddCategory?: (name: string, type: TransactionType) => Promise<TransactionCategory | null>;
  activeType?: TransactionType;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  onAddTransaction,
  onAddCategory,
  activeType,
}) => {
  const [type, setType] = useState<TransactionType>(activeType || 'income');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeType) {
      setType(activeType);
      setCategoryId('');
    }
  }, [activeType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('សូមបញ្ចូលចំនួនប្រាក់ដែលត្រឹមត្រូវ (ធំជាង 0)។');
      return;
    }

    if (!transactionDate) {
      setFormError('សូមជ្រើសរើសកាលបរិច្ឆេទឱ្យបានត្រឹមត្រូវ។');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onAddTransaction({
        type,
        amount: parsedAmount,
        category_id: categoryId || null,
        note: note.trim() || null,
        transaction_date: transactionDate,
      });

      if (result) {
        setAmount('');
        setCategoryId('');
        setNote('');
        setSuccessMessage(`បានរក្សាទុកកំណត់ត្រា${type === 'income' ? 'ចំណូល' : 'ចំណាយ'}ដោយជោគជ័យ!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setFormError('មិនអាចរក្សាទុកកំណត់ត្រាបានទេ។ សូមព្យាយាមម្ដងទៀត។');
      }
    } catch (err: any) {
      setFormError(err.message || 'មានបញ្ហាមិនរំពឹងទុកបានកើតឡើង។');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="transaction-form-card" className="bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-indigo-600" /> បន្ថែមកំណត់ត្រា
        </h3>
        <span className="text-xs font-medium text-slate-500">កត់ត្រាចំណូល ឬចំណាយ</span>
      </div>

      {formError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Segment Switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl min-h-[48px]">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('');
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              type === 'income'
                ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + ចំណូល
          </button>
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryId('');
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              type === 'expense'
                ? 'bg-white text-rose-700 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            - ចំណាយ
          </button>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" /> ចំនួនប្រាក់ ($) <span className="text-rose-500">*</span>
            </label>
            <input
              ref={amountInputRef}
              id="amount-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
              required
            />
          </div>

          {/* Transaction Date Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> កាលបរិច្ឆេទ <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
              required
            />
          </div>
        </div>

        {/* Category Selector */}
        <CategorySelector
          categories={categories}
          type={type}
          selectedCategoryId={categoryId}
          onChange={(catId) => setCategoryId(catId)}
          onAddCategory={onAddCategory}
        />

        {/* Note / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> កំណត់ចំណាំ (ជម្រើស)
          </label>
          <input
            type="text"
            placeholder="ឧទាហរណ៍៖ លក់ទំនិញ, ទិញសម្ភារការិយាល័យ..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 text-sm font-bold text-white rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 min-h-[48px] ${
            type === 'income'
              ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
              : 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700'
          } disabled:opacity-50 cursor-pointer`}
        >
          {isSubmitting ? (
            'កំពុងរក្សាទុក...'
          ) : (
            <>
              <Plus className="w-4 h-4" /> រក្សាទុក{type === 'income' ? 'ចំណូល' : 'ចំណាយ'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

