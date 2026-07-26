import React, { useState } from 'react';
import { Tag, Plus, Search, Check, ChevronDown } from 'lucide-react';
import { ProductCategory } from '../types';
import { useProductCategories } from '../hooks/useProductCategories';
import { ProductCategoryFormModal } from './ProductCategoryFormModal';

export interface ProductCategorySelectProps {
  value: string;
  onChange: (value: string, categoryId?: string) => void;
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const ProductCategorySelect: React.FC<ProductCategorySelectProps> = ({
  value,
  onChange,
  label,
  error,
  className = '',
  placeholder = 'ជ្រើសរើសប្រភេទទំនិញ...',
  required = false,
  disabled = false,
}) => {
  const { categories, loading, createCategory } = useProductCategories('active');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedCategory = categories.find(
    (c) => c.id === value || c.name === value
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (category: ProductCategory) => {
    onChange(category.name, category.id);
    setIsOpen(false);
  };

  const handleModalSubmit = async (input: any) => {
    const created = await createCategory(input);
    onChange(created.name, created.id);
    setIsModalOpen(false);
  };

  return (
    <div className={`space-y-1.5 relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Select Box Button */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl flex items-center justify-between text-left transition-all min-h-[44px] cursor-pointer disabled:opacity-50 ${
          error
            ? 'border-red-300 ring-2 ring-red-500/10'
            : isOpen
            ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-white'
            : 'border-slate-200 hover:border-slate-300 focus:bg-white'
        }`}
      >
        <span className={selectedCategory || value ? 'font-medium text-slate-900' : 'text-slate-400'}>
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{selectedCategory.name}</span>
            </span>
          ) : value ? (
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{value}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-100 max-h-64 flex flex-col">
            {/* Search */}
            <div className="p-2 border-b border-slate-100 relative bg-slate-50/60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ស្វែងរកប្រភេទទំនិញ..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
              {filteredCategories.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">គ្មានប្រភេទទំនិញត្រូវបានរកឃើញទេ</div>
              ) : (
                filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3 py-2 text-xs rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer min-h-[40px] ${
                      selectedCategory?.id === c.id || value === c.name
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.name}</span>
                      {c.is_default && <span className="text-[10px] text-slate-400">(ប្រព័ន្ធ)</span>}
                    </div>
                    {(selectedCategory?.id === c.id || value === c.name) && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Quick Add Button Footer */}
            <div className="p-1.5 border-t border-slate-100 bg-slate-50/80">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full py-2 px-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ បន្ថែមប្រភេទទំនិញថ្មី</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick Add Modal */}
      <ProductCategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

