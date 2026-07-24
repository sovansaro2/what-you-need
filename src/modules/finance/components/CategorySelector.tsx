import React, { useState } from 'react';
import { Tag, Plus, Check } from 'lucide-react';
import { TransactionCategory, TransactionType } from '../types';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '../constants';

interface CategorySelectorProps {
  categories: TransactionCategory[];
  type: TransactionType;
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
  onAddCategory?: (name: string, type: TransactionType) => Promise<TransactionCategory | null>;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  type,
  selectedCategoryId,
  onChange,
  onAddCategory,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories matching current transaction type
  const filteredDbCategories = categories.filter((cat) => cat.type === type);

  // Default suggestions based on type
  const defaultSuggestions =
    type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  const handleCreateCategory = async (nameToCreate: string) => {
    if (!nameToCreate.trim() || !onAddCategory) return;
    setIsSubmitting(true);
    try {
      const created = await onAddCategory(nameToCreate.trim(), type);
      if (created) {
        onChange(created.id);
        setNewCategoryName('');
        setIsAddingNew(false);
      }
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="category-selector" className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-slate-500" /> ប្រភេទ
      </label>

      {/* Select Dropdown */}
      <div className="relative">
        <select
          value={selectedCategoryId}
          onChange={(e) => {
            if (e.target.value === '__add_new__') {
              setIsAddingNew(true);
            } else {
              setIsAddingNew(false);
              onChange(e.target.value);
            }
          }}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
        >
          <option value="">ជ្រើសរើសប្រភេទ (ជម្រើស)</option>
          {filteredDbCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          {onAddCategory && (
            <option value="__add_new__">+ បង្កើតប្រភេទថ្មី...</option>
          )}
        </select>
      </div>

      {/* Quick Category Chips / Default Suggestions if none selected */}
      {!selectedCategoryId && !isAddingNew && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {defaultSuggestions.map((sug) => {
            // Check if matching db category exists
            const existing = filteredDbCategories.find(
              (c) => c.name.toLowerCase() === sug.toLowerCase()
            );
            return (
              <button
                key={sug}
                type="button"
                onClick={async () => {
                  if (existing) {
                    onChange(existing.id);
                  } else if (onAddCategory) {
                    await handleCreateCategory(sug);
                  }
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 active:bg-indigo-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors border border-slate-200/80 cursor-pointer min-h-[36px] flex items-center"
              >
                + {sug}
              </button>
            );
          })}
        </div>
      )}

      {/* Add Custom Category Inline Input */}
      {isAddingNew && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder={`ឈ្មោះប្រភេទ${type === 'income' ? 'ចំណូល' : 'ចំណាយ'}ថ្មី...`}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            autoFocus
          />
          <button
            type="button"
            disabled={!newCategoryName.trim() || isSubmitting}
            onClick={() => handleCreateCategory(newCategoryName)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" /> រក្សាទុក
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingNew(false);
              setNewCategoryName('');
            }}
            className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium"
          >
            បោះបង់
          </button>
        </div>
      )}
    </div>
  );
};
