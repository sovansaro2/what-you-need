import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react';
import { InventoryProduct } from '../types';
import { useInventoryProducts } from '../hooks/useProducts';
import { ProductForm } from './ProductForm';
import { RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';

interface ProductFormPageProps {
  mode: 'add' | 'edit';
}

export const ProductFormPage: React.FC<ProductFormPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useInventoryProducts();

  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(mode === 'edit');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      let isMounted = true;
      setLoading(true);
      setError(null);

      getProductById(id)
        .then((fetched) => {
          if (!isMounted) return;
          if (fetched) {
            setProduct(fetched);
          } else {
            setError('រកមិនឃើញទំនិញដែលអ្នកកំពុងស្វែងរកឡើយ');
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Error fetching product:', err);
          setError('មានបញ្ហាក្នុងការទាញយកទិន្នន័យទំនិញ');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [mode, id, getProductById]);

  if (loading) {
    return (
      <div id="product-form-page-loading" className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-600">កំពុងទាញយកព័ត៌មានទំនិញ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="product-form-page-error" className="max-w-xl mx-auto my-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">បរាជ័យក្នុងការទាញយកទិន្នន័យ</h2>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="py-2.5 px-4 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ត្រឡប់ទៅកាន់បញ្ជីទំនិញ</span>
        </button>
      </div>
    );
  }

  return (
    <div id="product-form-page" className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <ProductForm
        initialData={product}
        isEdit={mode === 'edit'}
        onSuccess={() => navigate('/products')}
        onCancel={() => navigate('/products')}
      />
    </div>
  );
};
