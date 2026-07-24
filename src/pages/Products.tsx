import React, { useState } from 'react';
import { Package, ArrowLeft, PlusCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/modules/sales/hooks/useProducts';
import { ProductList } from '@/modules/sales/components/ProductList';
import { ProductFormModal } from '@/modules/sales/components/ProductFormModal';
import { Product } from '@/modules/sales/types';

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, fetchProducts, addProduct, editProduct, removeProduct } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      const res = await editProduct(editingProduct.id, data);
      return !!res;
    } else {
      const res = await addProduct(data);
      return !!res;
    }
  };

  return (
    <div id="products-page" className="space-y-4">
      {/* Header */}
      <div id="products-header" className="flex items-center justify-between bg-white p-4 border border-slate-200/80 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/features')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="ត្រឡប់ទៅមុខងារ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <span>គ្រប់គ្រងទំនិញ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              បញ្ជីទំនិញ តម្លៃដើម តម្លៃលក់ និងចំនួនស្តុក
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchProducts()}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-40 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="ធ្វើបច្ចុប្បន្នភាព"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">បន្ថែមទំនិញថ្មី</span>
            <span className="sm:hidden">បន្ថែម</span>
          </button>
        </div>
      </div>

      {/* Main Product List */}
      <ProductList
        products={products}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={removeProduct}
        onAddClick={handleOpenAdd}
        onRefresh={fetchProducts}
      />

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingProduct}
      />
    </div>
  );
};
