import React from 'react';
import { Package, ArrowLeft, PlusCircle, RefreshCw, Layers, Tag, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventoryProducts } from '../hooks/useProducts';
import { ProductList } from './ProductList';
import { InventoryProduct } from '../types';

interface ProductListPageProps {
  onAddProductClick?: () => void;
  onProductSelect?: (product: InventoryProduct) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({
  onAddProductClick,
  onProductSelect,
}) => {
  const navigate = useNavigate();

  const {
    products,
    loading,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    stats,
    refresh,
  } = useInventoryProducts();

  const handleProductCardClick = (product: InventoryProduct) => {
    if (onProductSelect) {
      onProductSelect(product);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  const handleAddClick = () => {
    if (onAddProductClick) {
      onAddProductClick();
    } else {
      navigate('/products/new');
    }
  };

  return (
    <div id="product-list-page" className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* Header Bar */}
      <div id="product-list-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/features')}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/80"
            title="ត្រឡប់ទៅមុខងារ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">គ្រប់គ្រងទំនិញ</h1>
              <p className="text-xs text-slate-500">
                បញ្ជីទំនិញ តម្លៃដើម តម្លៃលក់ និងចំនួនស្តុកអាជីវកម្ម
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons Only (No FAB) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/inventory/categories')}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            title="គ្រប់គ្រងប្រភេទទំនិញ"
          >
            <Tag className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">ប្រភេទទំនិញ</span>
          </button>

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

          {onAddProductClick && (
            <button
              type="button"
              onClick={handleAddClick}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>បន្ថែមទំនិញថ្មី</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div id="product-stats-bar" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">ទំនិញសកម្មសរុប</span>
            <Package className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.activeTotal}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold">មានក្នុងស្តុក</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-700">{stats.inStock}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold">ជិតអស់ស្តុក</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-700">{stats.lowStock}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-[11px] font-bold">អស់ពីស្តុក</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-700">{stats.outOfStock}</p>
        </div>
      </div>

      {/* Main Product List Component */}
      <ProductList
        products={products}
        loading={loading}
        error={error}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refresh}
        onProductClick={handleProductCardClick}
      />
    </div>
  );
};
