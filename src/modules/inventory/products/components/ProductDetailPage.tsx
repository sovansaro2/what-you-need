import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Edit3,
  TrendingUp,
  History,
  Tag,
  Layers,
  Barcode,
  DollarSign,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Archive,
  RefreshCw,
  Box,
} from 'lucide-react';
import { InventoryProduct } from '../types';
import { useInventoryProducts } from '../hooks/useProducts';
import { DEFAULT_MIN_STOCK_ALERT, toKhmerNumeral } from '../constants';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useInventoryProducts();

  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('កូដសម្គាល់ទំនិញមិនត្រឹមត្រូវឡើយ');
      setLoading(false);
      return;
    }

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
        console.error('Failed to load product details:', err);
        setError('មានបញ្ហាក្នុងការទាញយកទិន្នន័យទំនិញ');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, getProductById]);

  // Helper function for stock badge calculation
  const getStockStatus = (prod: InventoryProduct) => {
    if (prod.is_archived) {
      return {
        label: 'ប័ណ្ណសារ',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Archive,
        dotColor: 'bg-slate-500',
      };
    }
    const minAlert = prod.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT;
    if (prod.current_stock <= 0) {
      return {
        label: 'អស់ពីស្តុក',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        dotColor: 'bg-red-500',
      };
    }
    if (prod.current_stock <= minAlert) {
      return {
        label: 'ជិតអស់ស្តុក',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
        dotColor: 'bg-amber-500',
      };
    }
    return {
      label: 'មានស្តុក',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      dotColor: 'bg-emerald-500',
    };
  };

  // Date Formatter Helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'មិនមានទិន្នន័យ';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('km-KH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Action Click Handlers
  const handleEditClick = () => {
    if (product) {
      navigate(`/products/${product.id}/edit`);
    }
  };

  const handleUpdateStockClick = () => {
    if (product) {
      navigate(`/products/${product.id}/stock-update`);
    }
  };

  const handleViewHistoryClick = () => {
    setToastMessage('មុខងារប្រវត្តិស្តុកនឹងត្រូវភ្ជាប់ទៅកាន់ម៉ូឌុល Stock History');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div id="product-detail-skeleton" className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-16 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="w-32 h-6 bg-slate-200 rounded-xl" />
          <div className="w-24 h-8 bg-slate-200 rounded-xl" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center">
          <div className="w-36 h-36 bg-slate-200 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="w-2/3 h-7 bg-slate-200 rounded-xl" />
            <div className="w-1/3 h-5 bg-slate-200 rounded-lg" />
            <div className="w-1/2 h-5 bg-slate-200 rounded-lg" />
          </div>
        </div>

        {/* Content Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-40 bg-white border border-slate-200 rounded-2xl p-4" />
          <div className="h-40 bg-white border border-slate-200 rounded-2xl p-4" />
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !product) {
    return (
      <div id="product-detail-not-found" className="max-w-xl mx-auto my-12 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">រកមិនឃើញទិន្នន័យទំនិញ</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'ទំនិញនេះត្រូវបានលុប ឬមិនមាននៅក្នុងប្រព័ន្ធឡើយ'}</p>
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
    );
  }

  const status = getStockStatus(product);
  const StatusIcon = status.icon;

  // Margin calculation
  const marginDollar = product.selling_price - product.cost_price;
  const marginPercent =
    product.selling_price > 0
      ? ((marginDollar / product.selling_price) * 100).toFixed(1)
      : '0';

  return (
    <div id="product-detail-page" className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Header Bar */}
      <div id="product-detail-header" className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200/80"
            title="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              ព័ត៌មានលម្អិតទំនិញ
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ព័ត៌មានទូទៅ ស្តុក តម្លៃ និងប្រតិបត្តិការ
            </p>
          </div>
        </div>

        {/* Header Quick Edit Button */}
        <button
          type="button"
          onClick={handleEditClick}
          className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Edit3 className="w-4 h-4" />
          <span className="hidden sm:inline">កែប្រែព័ត៌មាន</span>
        </button>
      </div>

      {/* Main Hero Card */}
      <div id="product-detail-hero" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        {/* Product Image Preview */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shrink-0 relative flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-3 space-y-1">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <span className="text-[11px] text-slate-400 block font-medium">គ្មានរូបភាព</span>
            </div>
          )}
        </div>

        {/* Primary Product Details Info */}
        <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.badgeClass}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{status.label}</span>
            </span>

            {product.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{product.category}</span>
              </span>
            )}

            {product.unit && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>{product.unit}</span>
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {product.name}
          </h2>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-mono">
            {product.sku && (
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <span className="text-slate-400 font-sans">SKU:</span>
                <span className="font-bold text-slate-800">{product.sku}</span>
              </div>
            )}

            {product.barcode && (
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Barcode className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-800">{product.barcode}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Inventory & Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Inventory & Stock Status */}
        <div id="card-inventory-status" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span>ព័ត៌មានស្តុក (Stock Status)</span>
            </h3>
            <span className="text-[11px] text-amber-600 font-medium">Read-Only</span>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">ចំនួនស្តុកបច្ចុប្បន្ន</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                  {toKhmerNumeral(product.current_stock)}
                </span>
                <span className="text-xs font-bold text-slate-600">{product.unit}</span>
              </div>
            </div>

            <div className={`w-3 h-3 rounded-full ${status.dotColor} animate-pulse`} title={status.label} />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">ជូនដំណឹងស្តុកទាប</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {toKhmerNumeral(product.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT)} {product.unit}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">ស្ថានភាព</span>
              <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Pricing & Margins */}
        <div id="card-pricing-margins" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>តម្លៃ និងចំណេញ (Pricing & Profit)</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[11px]">តម្លៃដើម (Cost Price)</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">
                ${product.cost_price.toFixed(2)}
              </span>
            </div>

            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-indigo-600/80 block text-[11px] font-medium">តម្លៃលក់ (Selling Price)</span>
              <span className="text-lg font-extrabold text-indigo-700 font-mono mt-0.5 block">
                ${product.selling_price.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-emerald-800 font-bold block">ប្រាក់ចំណេញ (Margin)</span>
                <span className="text-[11px] text-emerald-600 font-medium">គណនាលើតម្លៃលក់</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-extrabold text-emerald-700 block">
                +${marginDollar.toFixed(2)}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">
                ({marginPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Additional Meta Card */}
      <div id="card-description-meta" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
          ការពិពណ៌នា និងប្រព័ន្ធព័ត៌មាន (Additional Info)
        </h3>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">ការពិពណ៌នាទំនិញ</span>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed min-h-[60px]">
            {product.description || <span className="text-slate-400 italic">គ្មានការពិពណ៌នាបន្ថែមឡើយ</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>ថ្ងៃបង្កើត៖ </span>
            <span className="font-bold text-slate-800">{formatDate(product.created_at)}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>កែប្រែចុងក្រោយ៖ </span>
            <span className="font-bold text-slate-800">{formatDate(product.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer Bar (Primary Operations) */}
      <div
        id="product-detail-actions-footer"
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-3 sm:p-4 shadow-lg pb-safe"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleViewHistoryClick}
            className="py-2.5 px-3.5 sm:px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px] border border-slate-200/80"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>មើលប្រវត្តិស្តុក</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpdateStockClick}
              className="py-2.5 px-3.5 sm:px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px] border border-emerald-200/80"
            >
              <TrendingUp className="w-4 h-4" />
              <span>បច្ចុប្បន្នភាពស្តុក</span>
            </button>

            <button
              type="button"
              onClick={handleEditClick}
              className="py-2.5 px-4 sm:px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Edit3 className="w-4 h-4" />
              <span>កែប្រែព័ត៌មាន</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
