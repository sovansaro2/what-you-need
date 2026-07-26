import React from 'react';
import { Inbox, SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered = false,
  onResetFilters,
  title,
  description,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center my-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        {isFiltered ? <SearchX className="w-8 h-8" /> : <Inbox className="w-8 h-8" />}
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        {title || (isFiltered ? 'រកមិនឃើញប្រវត្តិចលនាស្តុកទេ' : 'មិនទាន់មានប្រវត្តិចលនាស្តុក')}
      </h3>
      
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
        {description ||
          (isFiltered
            ? 'សូមព្យាយាមផ្លាស់ប្តូរពាក្យស្វែងរក ឬតម្រងដែលអ្នកបានជ្រើសរើស។'
            : 'រាល់ប្រតិបត្តិការបញ្ចូល លក់ចេញ ឬកែសម្រួលស្តុកនឹងត្រូវកត់ត្រានៅទីនេះ។')}
      </p>

      {isFiltered && onResetFilters && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors active:scale-98 min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>កំណត់តម្រងឡើងវិញ</span>
        </button>
      )}
    </div>
  );
};
