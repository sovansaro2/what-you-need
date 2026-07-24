import React from 'react';
import { Package, Edit2, Trash2, Tag, Hash, Layers } from 'lucide-react';
import { Product } from '../types';
import { formatMoney } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const minAlert = product.min_stock_alert ?? 5;
  const isLowStock = product.current_stock <= minAlert;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
              {product.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {product.unit || 'កញ្ចប់'}
              </span>
              {product.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                  <Layers className="w-2.5 h-2.5" />
                  {product.category}
                </span>
              )}
              {product.sku && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-indigo-50 text-indigo-600">
                  <Hash className="w-2.5 h-2.5" />
                  {product.sku}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="កែប្រែ"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${product.name}" នេះមែនទេ?`)) {
                onDelete(product.id);
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="លុប"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details Grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2 rounded-xl">
          <span className="text-slate-400 text-[11px] block">តម្លៃដើម</span>
          <span className="font-semibold text-slate-700 block">
            {formatMoney(product.cost_price)}
          </span>
        </div>

        <div className="bg-emerald-50/70 p-2 rounded-xl">
          <span className="text-emerald-700/80 text-[11px] block">តម្លៃលក់</span>
          <span className="font-bold text-emerald-800 block">
            {formatMoney(product.selling_price)}
          </span>
        </div>

        <div className={`p-2 rounded-xl ${isLowStock ? 'bg-amber-50 text-amber-800' : 'bg-slate-50 text-slate-700'}`}>
          <span className="text-slate-400 text-[11px] block">ស្តុក</span>
          <span className="font-bold block">
            {product.current_stock} {product.unit || 'កញ្ចប់'}
          </span>
        </div>
      </div>
    </div>
  );
};

