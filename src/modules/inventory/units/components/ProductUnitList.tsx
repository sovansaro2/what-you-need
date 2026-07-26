import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  Archive,
  RotateCcw,
  Edit2,
  Lock,
  Layers,
  AlertCircle,
  CheckCircle2,
  Package,
  Sparkles,
} from 'lucide-react';
import { ProductUnit, ProductUnitFilter } from '../types';
import { KHMER_MESSAGES, toKhmerNumeral } from '../constants';

interface ProductUnitListProps {
  units: ProductUnit[];
  loading: boolean;
  filter: ProductUnitFilter;
  onFilterChange: (filter: ProductUnitFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (unit: ProductUnit) => void;
  onArchive: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUnarchive: (id: string) => Promise<{ success: boolean; error?: string }>;
  onAddClick: () => void;
  error?: string | null;
}

export const ProductUnitList: React.FC<ProductUnitListProps> = ({
  units,
  loading,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onEdit,
  onArchive,
  onUnarchive,
  onAddClick,
  error,
}) => {
  const [archivingUnit, setArchivingUnit] = useState<ProductUnit | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const handleConfirmArchive = async () => {
    if (!archivingUnit) return;
    setProcessingId(archivingUnit.id);
    setActionError(null);

    const res = await onArchive(archivingUnit.id);
    setProcessingId(null);

    if (res.success) {
      setArchivingUnit(null);
      triggerToast(KHMER_MESSAGES.ARCHIVE_SUCCESS);
    } else if (res.error) {
      setActionError(res.error);
    }
  };

  const handleUnarchive = async (unit: ProductUnit) => {
    setProcessingId(unit.id);
    setActionError(null);

    const res = await onUnarchive(unit.id);
    setProcessingId(null);

    if (res.success) {
      triggerToast(KHMER_MESSAGES.UNARCHIVE_SUCCESS);
    } else if (res.error) {
      setActionError(res.error);
    }
  };

  return (
    <div id="product-unit-list-container" className="space-y-4">
      {/* Toast Notification */}
      {successToast && (
        <div
          id="product-unit-toast"
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Global / Action Error Banner */}
      {(error || actionError) && (
        <div id="product-unit-list-error-banner" className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span className="flex-1">{actionError || error}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-red-600 text-xs font-bold min-h-[32px] px-2 cursor-pointer"
          >
            បិទ
          </button>
        </div>
      )}

      {/* Search and Tabs Header */}
      <div id="product-unit-controls" className="bg-white p-3.5 border border-slate-200/80 rounded-2xl shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="unit-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះខ្នាត, និមិត្តសញ្ញា (kg, g, L, Bottle, Can...)"
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all min-h-[44px]"
          />
        </div>

        {/* Filter Tabs */}
        <div id="unit-filter-tabs" className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onFilterChange('active')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                filter === 'active'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ខ្នាតសកម្ម
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('archived')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                filter === 'archived'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ក្នុងប័ណ្ណសារ
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            សរុប {toKhmerNumeral(units.length)} ខ្នាត
          </span>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div id="product-unit-loading-skeleton" className="space-y-2.5">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="p-4 bg-white border border-slate-200/80 rounded-2xl animate-pulse flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded-md w-32"></div>
                <div className="h-3 bg-slate-100 rounded-md w-48"></div>
              </div>
              <div className="h-8 bg-slate-100 rounded-xl w-20"></div>
            </div>
          ))}
        </div>
      ) : units.length === 0 ? (
        /* Empty State */
        <div id="product-unit-empty-state" className="p-8 bg-white border border-slate-200/80 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl mx-auto flex items-center justify-center text-indigo-600 shadow-2xs">
            <Layers className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {filter === 'active' ? 'មិនទាន់មានខ្នាតទំនិញនៅឡើយទេ' : 'គ្មានខ្នាតក្នុងប័ណ្ណសារទេ'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {filter === 'active'
                ? 'បង្កើតខ្នាតរាប់ទំនិញថ្មីសម្រាប់ប្រើប្រាស់ក្នុងកាតាឡុកទំនិញរបស់អ្នក។'
                : 'គ្មានខ្នាតទំនិញណាមួយត្រូវបានដាក់ចូលក្នុងប័ណ្ណសារនៅឡើយទេ។'}
            </p>
          </div>

          {filter === 'active' && (
            <button
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ បន្ថែមខ្នាត</span>
            </button>
          )}
        </div>
      ) : (
        /* Unit Cards List */
        <div id="product-unit-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {units.map((unit) => {
            const usageCount = unit.product_count ?? 0;
            const inUse = usageCount > 0;

            return (
              <div
                key={unit.id}
                id={`unit-card-${unit.id}`}
                className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      {/* Name & Symbol */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{unit.name}</span>
                        {unit.symbol && (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md">
                            {unit.symbol}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {unit.is_archived ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 rounded-md">
                            <Archive className="w-2.5 h-2.5 text-amber-600" />
                            <span>ប័ណ្ណសារ (Archived)</span>
                          </span>
                        ) : unit.is_default ? (
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
                      {unit.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{unit.description}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">គ្មានការពិពណ៌នា</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Usage Counter & Actions */}
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
                    {!unit.is_archived && (
                      <button
                        type="button"
                        onClick={() => onEdit(unit)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer"
                        title="កែប្រែ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>កែប្រែ</span>
                      </button>
                    )}

                    {unit.is_archived ? (
                      <button
                        type="button"
                        onClick={() => handleUnarchive(unit)}
                        disabled={processingId === unit.id}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 min-h-[36px] cursor-pointer disabled:opacity-50"
                        title="យកចេញពីប័ណ្ណសារ"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>យកចេញពីប័ណ្ណសារ</span>
                      </button>
                    ) : unit.is_default ? (
                      <span
                        className="px-2 py-1 text-[11px] text-slate-400 bg-slate-50 rounded-lg border border-slate-200/60"
                        title="ខ្នាតប្រព័ន្ធមិនអាចប័ណ្ណសារបានទេ"
                      >
                        ការពារដោយប្រព័ន្ធ
                      </span>
                    ) : inUse ? (
                      <span
                        className="px-2 py-1 text-[11px] text-amber-700 bg-amber-50/80 rounded-lg border border-amber-200/60"
                        title="មិនអាចប័ណ្ណសារខ្នាតដែលកំពុងប្រើប្រាស់បានទេ"
                      >
                        កំពុងប្រើប្រាស់
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setArchivingUnit(unit)}
                        disabled={processingId === unit.id}
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
      {archivingUnit && (
        <div
          id="archive-confirm-overlay"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            id="archive-confirm-modal"
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl shrink-0 text-amber-600">
                <Archive className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{KHMER_MESSAGES.CONFIRM_ARCHIVE_TITLE}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {KHMER_MESSAGES.CONFIRM_ARCHIVE_BODY}
                </p>
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200/60 text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>ខ្នាត៖ {archivingUnit.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setArchivingUnit(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={processingId === archivingUnit.id}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors min-h-[44px] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>{processingId === archivingUnit.id ? 'កំពុងប័ណ្ណសារ...' : 'ដាក់ចូលប័ណ្ណសារ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
