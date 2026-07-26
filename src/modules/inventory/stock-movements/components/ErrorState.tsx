import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string | null;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 bg-red-50/60 rounded-2xl border border-red-200 text-center my-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 text-red-600">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-red-900 mb-1">
        មិនអាចទាញយកប្រវត្តិចលនាស្តុកបានឡើយ
      </h3>

      <p className="text-sm text-red-700 max-w-md mb-5 leading-relaxed">
        {message || 'មានបញ្ហាបច្ចេកទេស ឬកំហុសបណ្តាញ។ សូមពិនិត្យការភ្ជាប់អ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត។'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors active:scale-98 min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          <span>ព្យាយាមម្ដងទៀត</span>
        </button>
      )}
    </div>
  );
};
