import React, { useState } from 'react';
import { Tag, ArrowLeft, PlusCircle, RefreshCw, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductCategories } from '../hooks/useProductCategories';
import { ProductCategoryList } from './ProductCategoryList';
import { ProductCategoryFormModal } from './ProductCategoryFormModal';
import { ProductCategory, CreateProductCategoryInput, UpdateProductCategoryInput } from '../types';

export const ProductCategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    categories,
    rawCategories,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refresh,
    createCategory,
    updateCategory,
    archiveCategory,
    unarchiveCategory,
  } = useProductCategories('active');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (category: ProductCategory) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (
    input: CreateProductCategoryInput | UpdateProductCategoryInput
  ) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, input);
    } else {
      await createCategory(input as CreateProductCategoryInput);
    }
  };

  const activeCount = rawCategories.filter((c) => !c.is_archived).length;
  const archivedCount = rawCategories.filter((c) => c.is_archived).length;

  return (
    <div id="product-categories-page" className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/80"
            title="ត្រឡប់ទៅបញ្ជីទំនិញ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">គ្រប់គ្រងប្រភេទទំនិញ</h1>
              <p className="text-xs text-slate-500">
                កំណត់ និងរៀបចំក្រុមប្រភេទទំនិញសម្រាប់កាតាឡុកអាជីវកម្ម
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/units')}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            title="គ្រប់គ្រងខ្នាតទំនិញ"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">ខ្នាតទំនិញ</span>
          </button>

          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/80"
            title="ទាញយកទិន្នន័យឡើងវិញ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>បន្ថែមប្រភេទថ្មី</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-slate-500">សរុបប្រភេទទាំងអស់</p>
          <p className="text-xl font-bold text-slate-900">{rawCategories.length}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-[11px] font-bold text-emerald-600">ប្រភេទកំពុងប្រើសកម្ម</p>
          <p className="text-xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-amber-600">ប្រភេទក្នុងប័ណ្ណសារ</p>
          <p className="text-xl font-bold text-amber-700">{archivedCount}</p>
        </div>
      </div>

      {/* Main List Section */}
      <ProductCategoryList
        categories={categories}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
        onEdit={handleOpenEditModal}
        onArchive={archiveCategory}
        onUnarchive={unarchiveCategory}
      />

      {/* Form Modal */}
      <ProductCategoryFormModal
        isOpen={isFormModalOpen}
        category={editingCategory}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};
