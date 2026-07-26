import React, { useState } from 'react';
import {
  Search,
  Filter,
  Edit2,
  Archive,
  RotateCcw,
  Lock,
  AlertCircle,
  Sparkles,
  Tag,
  Package,
} from 'lucide-react';
import { ProductCategory, ProductCategoryFilter } from '../types';
import { KHMER_CATEGORY_MESSAGES, toKhmerNumeral } from '../constants';

interface ProductCategoryListProps {
  categories: ProductCategory[];
  filter: ProductCategoryFilter;
  onFilterChange: (filter: ProductCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
  onEdit: (category: ProductCategory) => void;
  onArchive: (id: string) => Promise<void>;
  onUnarchive: (id: string) => Promise<void>;
}

export const ProductCategoryList: React.FC<ProductCategoryListProps> = ({
  categories,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  loading,
  onEdit,
  onArchive,
  onUnarchive,
}) => {
  const [archivingCategory, setArchivingCategory] = useState<ProductCategory | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirmArchive = async () => {
    if (!archivingCategory) return;
    setActionError(null);
    setProcessingId(archivingCategory.id);
    try {
      await onArchive(archivingCategory.id);
      setArchivingCategory(null);
    } catch (err: any) {
      setActionError(err?.message || 'មិនអាចដាក់ចូលក្នុងប័ណ្ណសារបានទេ');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnarchive = async (cat: ProductCategory) => {
    setActionError(null);
    setProcessingId(cat.id);
    try {
      await onUnarchive(cat.id);
    } catch (err: any) {
      setActionError(err?.message || 'មិនអាចយកចេញពីប័ណ្ណសារបានទេ');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div id="product-category-list-container" className="space-y-4">
      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-700 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-red-600 text-xs font-bold min-h-[32px] px-2 cursor-pointer"
          >
            បិទ
          </button>
        </div>
      )}

      {/* Controls: Search & Filters */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះប្រភេទទំនិញ ឬការពិពណ៌នា..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => onFilterChange('active')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                filter === 'active'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              សកម្ម (Active)
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('archived')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                filter === 'archived'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ប័ណ្ណសារ (Archived)
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ទាំងអស់ (All)
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            សរុប {toKhmerNumeral(categories.length)} ប្រភេទ
          </span>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div id="category-loading-skeletons" className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="h-4 bg-slate-200 rounded-md w-1/2" />
              <div className="h-3 bg-slate-100 rounded-md w-3/4" />
              <div className="h-8 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        /* Empty State */
        <div
          id="category-empty-state"
          className="p-8 text-center bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-3"
        >
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Tag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {filter === 'active' ? 'មិនទាន់មានប្រភេទទំនិញនៅឡើយទេ' : 'គ្មានប្រភេទក្នុងប័ណ្ណសារទេ'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {filter === 'active'
                ? 'បង្កើតប្រភេទទំនិញថ្មីសម្រាប់បែងចែកក្រុមទំនិញក្នុងកាតាឡុករបស់អ្នក។'
                : 'គ្មានប្រភេទទំនិញណាមួយត្រូវបានដាក់ចូលក្នុងប័ណ្ណសារនៅឡើយទេ។'}
            </p>
          </div>
        </div>
      ) : (
        /* Category Grid Cards */
        <div id="product-category-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const usageCount = cat.product_count ?? 0;
            const inUse = usageCount > 0;
            const catColor = cat.color || '#6366f1';

            return (
              <div
                key={cat.id}
                id={`category-card-${cat.id}`}
                className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      {/* Name & Color swatch */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: catColor }}
                        />
                        <span className="text-sm font-bold text-slate-900">{cat.name}</span>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cat.is_archived ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 rounded-md">
                            <Archive className="w-2.5 h-2.5 text-amber-600" />
                            <span>ប័ណ្ណសារ (Archived)</span>
                          </span>
                        ) : cat.is_default ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 rounded-md">
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                            <span>ប្រព័ន្ធ (System)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-md">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            <span>ផ្ទាល់ខ្លួន (Custom)</span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {cat.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{cat.description}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">គ្មានការពិពណ៌នា</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Usage counter & Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Usage Counter */}
                  <div>
                    {inUse ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg">
                        <Package className="w-3 h-3 text-blue-600" />
                        <span>កំពុងប្រើប្រាស់ {toKhmerNumeral(usageCount)} ទំនិញ</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200/80 rounded-lg">
                        <span>មិនទាន់ប្រើ</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!cat.is_archived && (
                      <button
                        type="button"
                        onClick={() => onEdit(cat)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
                        title="កែប្រែ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>កែប្រែ</span>
                      </button>
                    )}

                    {cat.is_archived ? (
                      <button
                        type="button"
                        onClick={() => handleUnarchive(cat)}
                        disabled={processingId === cat.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer disabled:opacity-50"
                        title="យកចេញពីប័ណ្ណសារ"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>យកចេញពីប័ណ្ណសារ</span>
                      </button>
                    ) : cat.is_default ? (
                      <span
                        className="px-2 py-1 text-[11px] text-slate-400 bg-slate-50 rounded-lg border border-slate-200/60"
                        title="ប្រភេទប្រព័ន្ធមិនអាចប័ណ្ណសារបានទេ"
                      >
                        ការពារដោយប្រព័ន្ធ
                      </span>
                    ) : inUse ? (
                      <span
                        className="px-2 py-1 text-[11px] text-amber-700 bg-amber-50/80 rounded-lg border border-amber-200/60"
                        title="មិនអាចប័ណ្ណសារប្រភេទដែលកំពុងប្រើប្រាស់បានទេ"
                      >
                        កំពុងប្រើប្រាស់
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setArchivingCategory(cat)}
                        disabled={processingId === cat.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer disabled:opacity-50"
                        title="ដាក់ចូលប័ណ្ណសារ"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>ប័ណ្ណសារ</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {archivingCategory && (
        <div
          id="archive-category-confirm-overlay"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="archive-category-confirm-modal"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl shrink-0 text-amber-600">
                <Archive className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{KHMER_CATEGORY_MESSAGES.CONFIRM_ARCHIVE_TITLE}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {KHMER_CATEGORY_MESSAGES.CONFIRM_ARCHIVE_BODY}
                </p>
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>ប្រភេទ៖ {archivingCategory.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setArchivingCategory(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={processingId === archivingCategory.id}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{processingId === archivingCategory.id ? 'កំពុងប័ណ្ណសារ...' : 'ដាក់ចូលប័ណ្ណសារ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
