import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ProductUnit, CreateProductUnitInput } from '../types';
import { KHMER_MESSAGES } from '../constants';

interface ProductUnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductUnitInput) => Promise<{ success: boolean; error?: string }>;
  initialData?: ProductUnit | null;
}

export const ProductUnitFormModal: React.FC<ProductUnitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSymbol(initialData.symbol || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setSymbol('');
      setDescription('');
    }
    setError(null);
    setShowDiscardConfirm(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isFormDirty = () => {
    if (initialData) {
      return (
        name.trim() !== (initialData.name || '').trim() ||
        symbol.trim() !== (initialData.symbol || '').trim() ||
        description.trim() !== (initialData.description || '').trim()
      );
    }
    return name.trim().length > 0 || symbol.trim().length > 0 || description.trim().length > 0;
  };

  const handleAttemptClose = () => {
    if (isFormDirty() && !submitting) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(KHMER_MESSAGES.NAME_REQUIRED);
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await onSubmit({
      name: name.trim(),
      symbol: symbol.trim() || undefined,
      description: description.trim() || undefined,
    });

    setSubmitting(false);

    if (res.success) {
      onClose();
    } else if (res.error) {
      setError(res.error);
    }
  };

  return (
    <div
      id="product-unit-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="product-unit-modal-container"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div id="product-unit-modal-header" className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? 'កែប្រែខ្នាតទំនិញ' : 'បន្ថែមខ្នាតទំនិញថ្មី'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {initialData ? 'កែប្រែព័ត៌មានខ្នាតដែលមានស្រាប់' : 'បញ្ចូលព័ត៌មានខ្នាតសម្រាប់រាប់ទំនិញ'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="បិទ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} id="product-unit-form" className="p-5 space-y-4">
          {error && (
            <div id="product-unit-error-banner" className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Unit Name (Required) */}
          <div className="space-y-1.5">
            <label htmlFor="unit-name-input" className="block text-xs font-semibold text-slate-700">
              ឈ្មោះខ្នាតទំនិញ <span className="text-red-500">*</span>
            </label>
            <input
              id="unit-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="ឧទាហរណ៍៖ ដប, ប្រអប់, គីឡូក្រាម..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
              autoFocus
            />
          </div>

          {/* Symbol / Abbreviation */}
          <div className="space-y-1.5">
            <label htmlFor="unit-symbol-input" className="block text-xs font-semibold text-slate-700">
              និមិត្តសញ្ញាកាត់ ( Symbol )
            </label>
            <input
              id="unit-symbol-input"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="ឧទាហរណ៍៖ kg, L, pcs..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="unit-desc-input" className="block text-xs font-semibold text-slate-700">
              ការពិពណ៌នាបន្ថែម
            </label>
            <textarea
              id="unit-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ឧទាហរណ៍៖ ប្រើប្រាស់សម្រាប់ទំនិញច្រកក្នុងដបតូច..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none min-h-[60px]"
            />
          </div>

          {/* Footer Actions */}
          <div id="product-unit-modal-footer" className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleAttemptClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer min-h-[44px]"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}</span>
            </button>
          </div>
        </form>

        {/* Unsaved Changes Confirmation Dialog */}
        {showDiscardConfirm && (
          <div
            id="discard-confirm-overlay"
            className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              id="discard-confirm-modal"
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center gap-3 text-amber-600">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{KHMER_MESSAGES.CONFIRM_DISCARD_TITLE}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{KHMER_MESSAGES.CONFIRM_DISCARD_BODY}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] cursor-pointer"
                >
                  បន្តកែប្រែ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors min-h-[44px] cursor-pointer"
                >
                  ចាកចេញ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
