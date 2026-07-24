import React, { useState } from 'react';
import { Search, PackagePlus, PackageX, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  onRefresh?: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  onAddClick,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar & Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះទំនិញ..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[44px]"
          />
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="ធ្វើបច្ចុប្បន្នភាព"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && products.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/60 animate-pulse space-y-3">
              <div className="h-5 bg-slate-100 rounded-md w-1/3" />
              <div className="h-10 bg-slate-50 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
            <PackageX className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {searchTerm ? 'រកមិនឃើញទំនិញទេ' : 'មិនទាន់មានទំនិញនៅក្នុងស្តុកនៅឡើយ'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchTerm
                ? 'សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេងទៀត។'
                : 'សូមចុចប៊ូតុង "បន្ថែមទំនិញថ្មី" ដើម្បីចាប់ផ្តើមបញ្ចូលទំនិញដំបូងរបស់អ្នក។'}
            </p>
          </div>
          {!searchTerm && (
            <button
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center gap-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer min-h-[48px]"
            >
              <PackagePlus className="w-5 h-5" />
              <span>បន្ថែមទំនិញថ្មី</span>
            </button>
          )}
        </div>
      )}

      {/* Products Grid / List */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
