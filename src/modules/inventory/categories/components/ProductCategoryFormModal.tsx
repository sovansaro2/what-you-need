import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles, Palette } from 'lucide-react';
import { ProductCategory, CreateProductCategoryInput, UpdateProductCategoryInput } from '../types';
import { CATEGORY_COLOR_OPTIONS, KHMER_CATEGORY_MESSAGES } from '../constants';

interface ProductCategoryFormModalProps {
  isOpen: boolean;
  category?: ProductCategory | null; // If provided, edit mode
  onClose: () => void;
  onSubmit: (input: CreateProductCategoryInput | UpdateProductCategoryInput) => Promise<void>;
}

export const ProductCategoryFormModal: React.FC<ProductCategoryFormModalProps> = ({
  isOpen,
  category,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(category);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setColor(category.color || '#6366f1');
    } else {
      setName('');
      setDescription('');
      setColor('#6366f1');
    }
    setFormError(null);
    setShowUnsavedConfirm(false);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const isDirty = category
    ? name !== (category.name || '') ||
      description !== (category.description || '') ||
      color !== (category.color || '#6366f1')
    : name.trim() !== '' || description.trim() !== '';

  const handleAttemptClose = () => {
    if (isDirty && !isSubmitting) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError(KHMER_CATEGORY_MESSAGES.NAME_REQUIRED);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        color,
      });
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'មានបញ្ហាក្នុងការរក្សាទុកប្រភេទទំនិញ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Form Modal Overlay */}
      <div
        id="category-form-modal-overlay"
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div
          id="category-form-modal-card"
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-8 animate-in fade-in zoom-in-95"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 border border-indigo-200/60 rounded-xl text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEdit ? 'កែប្រែប្រភេទទំនិញ' : 'បន្ថែមប្រភេទទំនិញថ្មី'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEdit ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មានប្រភេទទំនិញ' : 'បង្កើតប្រភេទសម្រាប់បែងចែកក្រុមទំនិញ'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Category Name */}
            <div className="space-y-1.5">
              <label htmlFor="category-name" className="block text-xs font-bold text-slate-700">
                ឈ្មោះប្រភេទទំនិញ <span className="text-red-500">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ឧទាហរណ៍៖ ភេសជ្ជៈ, គ្រឿងទេស, អាហារ..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
                required
                autoFocus
              />
            </div>

            {/* Category Color Palette */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>ពណ៌សម្គាល់ប្រភេទ</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORY_COLOR_OPTIONS.map((opt) => {
                  const isSelected = color === opt.hex;
                  return (
                    <button
                      key={opt.hex}
                      type="button"
                      onClick={() => setColor(opt.hex)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer min-h-[36px] min-w-[36px] ${
                        isSelected ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: opt.hex }}
                      title={opt.name}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="category-description" className="block text-xs font-bold text-slate-700">
                ការពិពណ៌នាបន្ថែម (ជម្រើស)
              </label>
              <textarea
                id="category-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="រៀបរាប់ព័ត៌មានសង្ខេបអំពីក្រុមប្រភេទទំនិញនេះ..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
              />
            </div>

            {/* Form Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleAttemptClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 min-h-[44px] cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      {showUnsavedConfirm && (
        <div
          id="unsaved-category-changes-overlay"
          className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-xs w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="space-y-1.5 text-center">
              <h4 className="text-sm font-bold text-slate-900">{KHMER_CATEGORY_MESSAGES.UNSAVED_CHANGES_TITLE}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{KHMER_CATEGORY_MESSAGES.UNSAVED_CHANGES_BODY}</p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUnsavedConfirm(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl min-h-[44px] cursor-pointer"
              >
                បន្តកែប្រែ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  onClose();
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl min-h-[44px] cursor-pointer"
              >
                ចាកចេញ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
