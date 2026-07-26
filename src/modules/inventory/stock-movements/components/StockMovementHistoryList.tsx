import React, { useState, useMemo } from 'react';
import { StockMovement } from '../types';
import { StockMovementHistoryCard } from './StockMovementHistoryCard';
import { EmptyState } from './EmptyState';
import { ChevronDown, History } from 'lucide-react';

export interface StockMovementHistoryListProps {
  movements: StockMovement[];
  loading?: boolean;
  onResetFilters?: () => void;
  isFiltered?: boolean;
  pageSize?: number;
}

export const StockMovementHistoryList: React.FC<StockMovementHistoryListProps> = ({
  movements,
  loading = false,
  onResetFilters,
  isFiltered = false,
  pageSize = 10,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset page to 1 when movements change length
  const visibleMovements = useMemo(() => {
    return movements.slice(0, currentPage * pageSize);
  }, [movements, currentPage, pageSize]);

  const hasMore = visibleMovements.length < movements.length;

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (!loading && movements.length === 0) {
    return <EmptyState isFiltered={isFiltered} onResetFilters={onResetFilters} />;
  }

  return (
    <div className="space-y-3.5 my-4">
      {/* Timeline List */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>បញ្ជីចលនាស្តុក ({movements.length} ប្រតិបត្តិការ)</span>
        </div>
        {visibleMovements.length < movements.length && (
          <span>
            បង្ហាញ {visibleMovements.length} នៃ {movements.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {visibleMovements.map((movement) => (
          <StockMovementHistoryCard key={movement.id} movement={movement} />
        ))}
      </div>

      {/* Pagination / Load More Button */}
      {hasMore && (
        <div className="pt-3 pb-2 text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl shadow-xs transition-colors active:scale-98 min-h-[44px] w-full sm:w-auto"
          >
            <span>ទាញយកបន្ថែម ({movements.length - visibleMovements.length} ប្រតិបត្តិការទៀត)</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
};
