import React from 'react';
import { Search, Barcode, Package, AlertCircle } from 'lucide-react';
import { InventoryProduct } from '../../inventory/products/types';
import { ProductCategory } from '../../inventory/categories/types';

interface ProductCatalogProps {
  products: InventoryProduct[];
  categories: ProductCategory[];
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onAddToCart: (product: InventoryProduct) => void;
  onBarcodeScan: (barcode: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  searchQuery,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onAddToCart,
  onBarcodeScan,
}) => {
  const [barcodeInput, setBarcodeInput] = React.useState('');

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      onBarcodeScan(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  return (
    <div id="pos-product-catalog" className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Search & Barcode Header */}
      <div id="catalog-header" className="p-4 bg-white border-b border-slate-200 space-y-3">
        <div id="search-bar-row" className="flex items-center gap-2">
          <div id="search-input-wrapper" className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ស្វែងរកតាមឈ្មោះ, SKU..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <form id="barcode-form" onSubmit={handleBarcodeSubmit} className="relative w-48">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="barcode-input"
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="ស្កែនបារកូដ..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </form>
        </div>

        {/* Category Filters */}
        <div id="category-chips-row" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            id="cat-chip-all"
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ទាំងអស់ ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-chip-${cat.id}`}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div id="catalog-grid-container" className="flex-1 p-4 overflow-y-auto">
        {products.length === 0 ? (
          <div id="empty-catalog-state" className="h-full flex flex-col items-center justify-center text-slate-400">
            <Package className="w-12 h-12 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium">មិនទាន់មានទំនិញក្នុងប្រព័ន្ធទេ</p>
          </div>
        ) : (
          <div id="catalog-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((product) => {
              const stock = product.current_stock ?? 0;
              const minAlert = product.min_stock_alert ?? 5;
              const isOutOfStock = stock <= 0;
              const isLowStock = stock > 0 && stock <= minAlert;

              return (
                <button
                  key={product.id}
                  id={`product-card-${product.id}`}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => onAddToCart(product)}
                  className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all relative group bg-white ${
                    isOutOfStock
                      ? 'opacity-50 border-slate-200 cursor-not-allowed'
                      : 'border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-[0.98]'
                  }`}
                >
                  <div id={`product-card-info-${product.id}`}>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">
                        {product.name}
                      </span>
                    </div>
                    {product.sku && (
                      <span className="text-[11px] text-slate-400 block mb-2 font-mono">
                        {product.sku}
                      </span>
                    )}
                  </div>

                  <div id={`product-card-footer-${product.id}`} className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-emerald-600 text-base">
                      ${Number(product.selling_price || 0).toFixed(2)}
                    </span>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700'
                          : isLowStock
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isOutOfStock && <AlertCircle className="w-3 h-3" />}
                      {stock} {product.unit || 'ឯកតា'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
