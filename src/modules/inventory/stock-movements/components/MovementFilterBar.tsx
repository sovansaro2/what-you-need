import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { StockMovementType } from '../types';

export type DatePreset = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

export interface MovementFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  movementType: StockMovementType | 'all';
  onMovementTypeChange: (type: StockMovementType | 'all') => void;
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  startDate?: string;
  endDate?: string;
  onCustomDateChange: (start: string, end: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const MovementFilterBar: React.FC<MovementFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  movementType,
  onMovementTypeChange,
  datePreset,
  onDatePresetChange,
  startDate = '',
  endDate = '',
  onCustomDateChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const movementTypeOptions: { value: StockMovementType | 'all'; label: string }[] = [
    { value: 'all', label: 'ទាំងអស់' },
    { value: 'stock_in', label: 'បញ្ចូលស្តុក' },
    { value: 'sale', label: 'លក់ចេញ' },
    { value: 'adjustment', label: 'កែសម្រួល' },
    { value: 'damage', label: 'ខូចខាត' },
    { value: 'expired', label: 'ហួសកាលកំណត់' },
  ];

  const datePresetOptions: { value: DatePreset; label: string }[] = [
    { value: 'all', label: 'គ្រប់ពេល' },
    { value: 'today', label: 'ថ្ងៃនេះ' },
    { value: 'yesterday', label: 'ម្សិលមិញ' },
    { value: 'last7', label: '៧ ថ្ងៃចុងក្រោយ' },
    { value: 'last30', label: '៣០ ថ្ងៃចុងក្រោយ' },
    { value: 'custom', label: 'ជ្រើសរើសថ្ងៃ' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-3 my-3">
      {/* Search Input and Primary Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ, ប្រភេទ, លេខយោង, មូលហេតុ, ឬ ID..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Advanced Filters */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors min-h-[44px] active:scale-98 ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>តម្រង</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>

          {/* Sort Order Toggle */}
          <button
            onClick={() => onSortOrderChange(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium transition-colors min-h-[44px] active:scale-98"
            title={sortOrder === 'desc' ? 'ប្តូរទៅចាស់បំផុត' : 'ប្តូរទៅថ្មីបំផុត'}
          >
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <span className="hidden xs:inline">
              {sortOrder === 'desc' ? 'ថ្មីបំផុត' : 'ចាស់បំផុត'}
            </span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-98"
              title="កំណត់តម្រងឡើងវិញ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Movement Type Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
        <span className="text-xs font-medium text-slate-500 shrink-0 mr-1 hidden sm:inline">
          ប្រភេទ:
        </span>
        {movementTypeOptions.map((opt) => {
          const isSelected = movementType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onMovementTypeChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Panel (Date Presets & Custom Range) */}
      {(showAdvanced || datePreset !== 'all') && (
        <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
          {/* Date Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>កាលបរិច្ឆេទ (Date Filter)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {datePresetOptions.map((opt) => {
                const isSelected = datePreset === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onDatePresetChange(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-95 ${
                      isSelected
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Inputs */}
          {datePreset === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  ចាប់ពីថ្ងៃ
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onCustomDateChange(e.target.value, endDate)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  ដល់ថ្ងៃ
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onCustomDateChange(startDate, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
