import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Check, ChevronDown } from 'lucide-react';
import { ProductUnit } from '../types';
import { useProductUnits } from '../hooks/useProductUnits';
import { ProductUnitFormModal } from './ProductUnitFormModal';

export interface ProductUnitSelectProps {
  value?: string;
  onChange: (unitId: string, unit: ProductUnit | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export const ProductUnitSelect: React.FC<ProductUnitSelectProps> = ({
  value,
  onChange,
  label = 'ខ្នាតទំនិញ',
  placeholder = 'ជ្រើសរើសខ្នាតទំនិញ...',
  required = false,
  error,
  disabled = false,
}) => {
  const { units, loading, addUnit } = useProductUnits('active');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedUnit = units.find((u) => u.id === value || u.name === value);

  const filteredUnits = units.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.symbol && u.symbol.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (unit: ProductUnit) => {
    onChange(unit.id, unit);
    setIsOpen(false);
  };

  const handleCreateNew = async (input: any) => {
    const res = await addUnit(input);
    if (res.success && res.data) {
      onChange(res.data.id, res.data);
      setIsAddModalOpen(false);
    }
    return res;
  };

  return (
    <div id="product-unit-select-container" className="space-y-1.5 relative">
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
        <span className={selectedUnit ? 'font-medium text-slate-900' : 'text-slate-400'}>
          {selectedUnit ? (
            <span className="flex items-center gap-2">
              <span>{selectedUnit.name}</span>
              {selectedUnit.symbol && (
                <span className="text-[11px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">
                  {selectedUnit.symbol}
                </span>
              )}
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
                placeholder="ស្វែងរកខ្នាត..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
              {filteredUnits.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">គ្មានខ្នាតទំនិញត្រូវបានរកឃើញទេ</div>
              ) : (
                filteredUnits.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(u)}
                    className={`w-full px-3 py-2 text-xs rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer min-h-[40px] ${
                      selectedUnit?.id === u.id
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.name}</span>
                      {u.symbol && <span className="text-[10px] text-slate-500">({u.symbol})</span>}
                    </div>
                    {selectedUnit?.id === u.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
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
                  setIsAddModalOpen(true);
                }}
                className="w-full py-2 px-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ បន្ថែមខ្នាតថ្មី</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick Add Modal */}
      <ProductUnitFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateNew}
      />
    </div>
  );
};
