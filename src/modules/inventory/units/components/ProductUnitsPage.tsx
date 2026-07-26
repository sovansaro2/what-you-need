import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, PlusCircle, RefreshCw } from 'lucide-react';
import { useProductUnits } from '../hooks/useProductUnits';
import { ProductUnitList } from './ProductUnitList';
import { ProductUnitFormModal } from './ProductUnitFormModal';
import { ProductUnit } from '../types';

export const ProductUnitsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    units,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    fetchUnits,
    addUnit,
    editUnit,
    archiveUnit,
    unarchiveUnit,
    error,
  } = useProductUnits();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ProductUnit | null>(null);

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: ProductUnit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (data: any) => {
    if (editingUnit) {
      return editUnit(editingUnit.id, data);
    } else {
      return addUnit(data);
    }
  };

  return (
    <div id="product-units-page" className="space-y-4 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div
        id="product-units-header"
        className="flex items-center justify-between bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs gap-3"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="ត្រឡប់ទៅទំនិញ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>គ្រប់គ្រងខ្នាតទំនិញ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              កំណត់ និងរៀបចំខ្នាតរាប់ទំនិញសម្រាប់អាជីវកម្មរបស់អ្នក
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchUnits(filter)}
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="ធ្វើបច្ចុប្បន្នភាព"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Standard Header Action Button (No FAB) */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">+ បន្ថែមខ្នាត</span>
            <span className="sm:hidden">+ បន្ថែម</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <ProductUnitList
        units={units}
        loading={loading}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={handleOpenEdit}
        onArchive={archiveUnit}
        onUnarchive={unarchiveUnit}
        onAddClick={handleOpenAdd}
        error={error}
      />

      {/* Add / Edit Modal */}
      <ProductUnitFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        initialData={editingUnit}
      />
    </div>
  );
};
