import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Package,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { productService } from '../../products/services/productService';
import { InventoryProduct } from '../../products/types';
import { useStockMovements } from '../hooks/useStockMovements';
import { CreateStockMovementInput } from '../types';
import { StockMovementForm } from './StockMovementForm';

export const StockMovementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const { createMovement, loading: movementSubmitting, error: movementError, clearError } =
    useStockMovements(undefined, false);

  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [productLoading, setProductLoading] = useState<boolean>(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch target product
  const loadProduct = useCallback(async () => {
    if (!id) {
      setProductError('មិនមានលេខសម្គាល់ទំនិញឡើយ');
      setProductLoading(false);
      return;
    }

    setProductLoading(true);
    setProductError(null);
    try {
      const prod = await productService.getProductById(userId, id);
      if (!prod) {
        setProductError('រកមិនឃើញទិន្នន័យទំនិញនៅក្នុងប្រព័ន្ធឡើយ');
      } else {
        setProduct(prod);
      }
    } catch (err: any) {
      console.error('Failed to load product:', err);
      setProductError(err?.message || 'មានបញ្ហាក្នុងការទាញយកទិន្នន័យទំនិញ');
    } finally {
      setProductLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Back button handler with unsaved changes guard
  const handleBack = () => {
    if (isDirty) {
      setShowExitConfirm(true);
    } else {
      navigate(product ? `/products/${product.id}` : '/products');
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    navigate(product ? `/products/${product.id}` : '/products');
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  // Form Submission
  const handleSubmitMovement = async (
    input: CreateStockMovementInput
  ): Promise<boolean> => {
    if (!product) return false;

    clearError();
    const result = await createMovement(input, product);

    if (result) {
      setIsDirty(false);
      setToastMessage('កត់ត្រាប្រតិបត្តិការស្តុកបានជោគជ័យ!');

      // Redirect after brief toast
      setTimeout(() => {
        navigate(`/products/${product.id}`);
      }, 1000);
      return true;
    }
    return false;
  };

  return (
    <div
      id="stock-movement-page"
      className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5 pb-28 min-h-[calc(100vh-4rem)]"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="movement-toast"
          className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Header */}
      <div
        id="stock-movement-header"
        className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="movement-back-btn"
            onClick={handleBack}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/80"
            title="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              បច្ចុប្បន្នភាពស្តុក (Stock Movement)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              កត់ត្រាការនាំចូល លក់ កែតម្រូវ ឬកាត់ខូចខាតស្តុក
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {productLoading && (
        <div
          id="stock-movement-skeleton"
          className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="w-2/3 h-5 bg-slate-200 rounded-lg" />
              <div className="w-1/3 h-4 bg-slate-200 rounded-lg" />
            </div>
          </div>
          <div className="h-32 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
        </div>
      )}

      {/* Product Error / Not Found */}
      {!productLoading && (productError || !product) && (
        <div
          id="stock-movement-not-found"
          className="bg-white p-8 rounded-2xl border border-slate-200/80 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs"
        >
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              រកមិនឃើញទិន្នន័យទំនិញ
            </h2>
            <p className="text-xs text-slate-500">
              {productError || 'ទំនិញនេះមិនមាននៅក្នុងប្រព័ន្ធ ឬត្រូវបានលុបចោល'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ទៅបញ្ជីទំនិញ</span>
          </button>
        </div>
      )}

      {/* Main Stock Movement Form */}
      {!productLoading && product && (
        <StockMovementForm
          product={product}
          onSubmit={handleSubmitMovement}
          onCancel={handleBack}
          submitting={movementSubmitting}
          externalError={movementError}
          onDirtyChange={setIsDirty}
        />
      )}

      {/* Unsaved Changes Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          id="unsaved-exit-dialog"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  បោះបង់ការកែប្រែ?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ទិន្នន័យដែលបានបញ្ចូលនឹងត្រូវបាត់បង់ ប្រសិនបើអ្នកចាកចេញឥឡូវនេះ។
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelExit}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer min-h-[44px]"
              >
                បន្តកែប្រែ
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                ចាកចេញ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
