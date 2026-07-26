import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Package,
  AlertCircle,
  Tag,
  RefreshCw,
  X,
} from 'lucide-react';
import { InventoryProduct, ProductStockStatus, ProductFilter } from '../types';
import { ProductCard } from './ProductCard';
import { useProductCategories } from '@/modules/inventory/categories/hooks/useProductCategories';
import { toKhmerNumeral } from '../constants';

interface ProductListProps {
  products: InventoryProduct[];
  loading: boolean;
  error?: string | null;
  filter: ProductFilter;
  onFilterChange: (newFilter: ProductFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh?: () => void;
  onProductClick?: (product: InventoryProduct) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  error,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  onProductClick,
}) => {
  const { categories: activeCategories } = useProductCategories('active');

  // Debounced search state for smooth user input
  const [inputSearch, setInputSearch] = useState(searchQuery);

  useEffect(() => {
    setInputSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputSearch !== searchQuery) {
        onSearchChange(inputSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputSearch, searchQuery, onSearchChange]);

  const handleStatusTabChange = (status: ProductStockStatus) => {
    onFilterChange({
      ...filter,
      status,
    });
  };

  const handleCategorySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filter,
      category: e.target.value,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'name_asc') {
      onFilterChange({ ...filter, sortBy: 'name', sortOrder: 'asc' });
    } else if (val === 'created_desc') {
      onFilterChange({ ...filter, sortBy: 'created_at', sortOrder: 'desc' });
    } else if (val === 'created_asc') {
      onFilterChange({ ...filter, sortBy: 'created_at', sortOrder: 'asc' });
    } else if (val === 'price_desc') {
      onFilterChange({ ...filter, sortBy: 'selling_price', sortOrder: 'desc' });
    } else if (val === 'price_asc') {
      onFilterChange({ ...filter, sortBy: 'selling_price', sortOrder: 'asc' });
    } else if (val === 'stock_desc') {
      onFilterChange({ ...filter, sortBy: 'current_stock', sortOrder: 'desc' });
    } else if (val === 'stock_asc') {
      onFilterChange({ ...filter, sortBy: 'current_stock', sortOrder: 'asc' });
    }
  };

  const currentSortKey = useMemo(() => {
    const sortBy = filter.sortBy || 'created_at';
    const sortOrder = filter.sortOrder || 'desc';

    if (sortBy === 'name') return 'name_asc';
    if (sortBy === 'selling_price') return sortOrder === 'desc' ? 'price_desc' : 'price_asc';
    if (sortBy === 'current_stock') return sortOrder === 'desc' ? 'stock_desc' : 'stock_asc';
    return sortOrder === 'asc' ? 'created_asc' : 'created_desc';
  }, [filter.sortBy, filter.sortOrder]);

  const clearFilters = () => {
    setInputSearch('');
    onSearchChange('');
    onFilterChange({
      status: 'all',
      category: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const isFiltered = Boolean(
    inputSearch.trim() || (filter.status && filter.status !== 'all') || filter.category
  );

  return (
    <div id="product-list-container" className="space-y-4">
      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-colors min-h-[36px] cursor-pointer"
            >
              ព្យាយាមម្តងទៀត
            </button>
          )}
        </div>
      )}

      {/* Control Bar: Search & Selectors */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ, SKU, កូដបារ (Barcode)..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
          />
          {inputSearch && (
            <button
              type="button"
              onClick={() => {
                setInputSearch('');
                onSearchChange('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters and Sorting Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={filter.category || ''}
              onChange={handleCategorySelectChange}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px] cursor-pointer appearance-none text-slate-700 font-medium"
            >
              <option value="">ប្រភេទទំនិញទាំងអស់</option>
              {activeCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={currentSortKey}
              onChange={handleSortChange}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px] cursor-pointer appearance-none text-slate-700 font-medium"
            >
              <option value="created_desc">ថ្មីបំផុត (Newest)</option>
              <option value="created_asc">ចាស់បំផុត (Oldest)</option>
              <option value="name_asc">ឈ្មោះ (A - Z)</option>
              <option value="price_desc">តម្លៃលក់ (ខ្ពស់ - ទាប)</option>
              <option value="price_asc">តម្លៃលក់ (ទាប - ខ្ពស់)</option>
              <option value="stock_desc">ចំនួនស្តុក (ច្រើន - តិច)</option>
              <option value="stock_asc">ចំនួនស្តុក (តិច - ច្រើន)</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Filters Button (If Filtered) */}
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="py-2 px-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer col-span-1 sm:col-span-2 lg:col-span-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>សម្អាតតម្រងស្វែងរក</span>
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleStatusTabChange('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px] cursor-pointer ${
              (filter.status || 'all') === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            ទាំងអស់ (All)
          </button>
          <button
            type="button"
            onClick={() => handleStatusTabChange('in_stock')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px] cursor-pointer ${
              filter.status === 'in_stock'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            🟢 មានស្តុក
          </button>
          <button
            type="button"
            onClick={() => handleStatusTabChange('low_stock')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px] cursor-pointer ${
              filter.status === 'low_stock'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            🟡 ជិតអស់ស្តុក
          </button>
          <button
            type="button"
            onClick={() => handleStatusTabChange('out_of_stock')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px] cursor-pointer ${
              filter.status === 'out_of_stock'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            🔴 អស់ពីស្តុក
          </button>
          <button
            type="button"
            onClick={() => handleStatusTabChange('archived')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap min-h-[36px] cursor-pointer ${
              filter.status === 'archived'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ⚫ ប័ណ្ណសារ
          </button>
        </div>
      </div>

      {/* Results Header Counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-600">
          បង្ហាញ {toKhmerNumeral(products.length)} ទំនិញ
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div id="product-loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 min-h-[140px]">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-slate-200 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                <div className="h-4 bg-slate-200 rounded-md w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div
          id="product-empty-state"
          className="p-8 text-center bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3"
        >
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {isFiltered ? 'រកមិនឃើញទំនិញតាមលក្ខខណ្ឌស្វែងរកឡើយ' : 'មិនទាន់មានទំនិញនៅក្នុងប្រព័ន្ធទេ'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {isFiltered
                ? 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រងស្វែងរកឡើងវិញ។'
                : 'បន្ថែមទំនិញដំបូងរបស់អ្នក ដើម្បីចាប់ផ្តើមគ្រប់គ្រងកាតាឡុកអាជីវកម្ម។'}
            </p>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors min-h-[44px] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>បង្ហាញទំនិញទាំងអស់ឡើងវិញ</span>
            </button>
          )}
        </div>
      ) : (
        /* Product Cards Grid */
        <div id="product-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={onProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
