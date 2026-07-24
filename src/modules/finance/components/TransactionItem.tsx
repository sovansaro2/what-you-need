import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, Calendar, Pencil, Check, X } from 'lucide-react';
import { Transaction, TransactionCategory, UpdateTransactionInput } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
  categories?: TransactionCategory[];
  onDelete?: (id: string) => Promise<boolean>;
  onEdit?: (id: string, input: UpdateTransactionInput) => Promise<Transaction | null>;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  categories = [],
  onDelete,
  onEdit,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState<string>(transaction.amount.toString());
  const [editNote, setEditNote] = useState<string>(transaction.note || '');
  const [editDate, setEditDate] = useState<string>(transaction.transaction_date || '');
  const [editCategoryId, setEditCategoryId] = useState<string>(transaction.category_id || '');

  const isIncome = transaction.type === 'income';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm('តើអ្នកប្រាកដជាចង់លុបបាត់កំណត់ត្រានេះមែនទេ?')) {
      setIsDeleting(true);
      try {
        await onDelete(transaction.id);
      } catch (err) {
        console.error('Failed to delete transaction:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onEdit) return;

    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('សូមបញ្ចូលចំនួនប្រាក់ដែលត្រឹមត្រូវ');
      return;
    }

    setIsSaving(true);
    try {
      await onEdit(transaction.id, {
        amount: parsedAmount,
        note: editNote.trim() || null,
        transaction_date: editDate,
        category_id: editCategoryId || null,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to edit transaction:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    const availableCategories = categories.filter((c) => c.type === transaction.type);

    return (
      <form
        onSubmit={handleSaveEdit}
        className="p-3.5 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-3"
      >
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-indigo-100 pb-2">
          <span>កែប្រែកំណត់ត្រា ({isIncome ? 'ចំណូល' : 'ចំណាយ'})</span>
          <div className="flex items-center gap-1">
            <button
              type="submit"
              disabled={isSaving}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> {isSaving ? 'កំពុងរក្សា...' : 'រក្សាទុក'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> បោះបង់
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">ចំនួនប្រាក់ ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">កាលបរិច្ឆេទ</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">ប្រភេទ/ប្រភព</label>
            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">-- ជ្រើសរើសប្រភេទ --</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">កំណត់ចំណាំ</label>
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="កំណត់ចំណាំបន្ថែម..."
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </form>
    );
  }

  return (
    <div
      id={`transaction-item-${transaction.id}`}
      className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Type Icon */}
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            isIncome
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }`}
        >
          {isIncome ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 truncate">
              {transaction.category?.name || (isIncome ? 'ចំណូលទូទៅ' : 'ចំណាយទូទៅ')}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase border ${
                isIncome
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isIncome ? 'ចំណូល' : 'ចំណាយ'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatDate(transaction.transaction_date)}
            </span>
            {transaction.note && (
              <>
                <span>•</span>
                <span className="truncate italic max-w-[160px] sm:max-w-xs">
                  "{transaction.note}"
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount, Edit & Delete Action */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span
          className={`text-xs sm:text-sm font-extrabold ${
            isIncome ? 'text-emerald-600' : 'text-slate-900'
          }`}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit transaction"
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete transaction"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-80 group-hover:opacity-100 disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

