import React from 'react';
import { Package, Tag, Layers, Barcode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryProduct } from '../types';
import { DEFAULT_MIN_STOCK_ALERT, toKhmerNumeral } from '../constants';

interface ProductCardProps {
  product: InventoryProduct;
  onClick?: (product: InventoryProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const navigate = useNavigate();

  const getStockStatus = () => {
    if (product.is_archived) {
      return {
        label: 'ប័ណ្ណសារ',
        dotColor: 'bg-slate-500',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
      };
    }
    const minAlert = product.min_stock_alert ?? DEFAULT_MIN_STOCK_ALERT;
    if (product.current_stock <= 0) {
      return {
        label: 'អស់ពីស្តុក',
        dotColor: 'bg-red-500',
        badgeClass: 'bg-red-50 text-red-700 border-red-200/80',
      };
    }
    if (product.current_stock <= minAlert) {
      return {
        label: 'ជិតអស់ស្តុក',
        dotColor: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
      };
    }
    return {
      label: 'មានស្តុក',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    };
  };

  const statusInfo = getStockStatus();

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleClick}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between space-y-3 min-h-[140px]"
    >
      <div className="flex items-start gap-3">
        {/* Product Image or Thumbnail Placeholder */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 border border-slate-200/80 rounded-xl shrink-0 overflow-hidden flex items-center justify-center relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Image fallback
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Package className="w-8 h-8 text-slate-400" />
          )}
        </div>

        {/* Primary Product Details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 truncate" title={product.name}>
              {product.name}
            </h3>

            {/* Dynamic Stock Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full border shrink-0 ${statusInfo.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
              <span>{statusInfo.label}</span>
            </span>
          </div>

          {/* SKU / Barcode */}
          {product.sku ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">SKU: {product.sku}</span>
            </div>
          ) : null}

          {/* Category & Unit Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
              <Tag className="w-3 h-3 text-indigo-500" />
              <span>{product.category}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 rounded-md">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>{product.unit}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Stock Stats Row */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block">តម្លៃលក់</span>
          <span className="text-sm font-bold text-indigo-600">
            ${product.selling_price.toFixed(2)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">ស្តុកបច្ចុប្បន្ន</span>
          <span className="text-xs font-bold text-slate-800">
            {toKhmerNumeral(product.current_stock)} {product.unit}
          </span>
        </div>
      </div>
    </div>
  );
};
