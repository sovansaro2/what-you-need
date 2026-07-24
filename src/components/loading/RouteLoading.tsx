import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RouteLoadingProps {
  message?: string;
}

export const RouteLoading: React.FC<RouteLoadingProps> = ({
  message = 'កំពុងផ្លាស់ប្តូរទំព័រ...',
}) => {
  return (
    <div
      id="route-loading-container"
      className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-3"
    >
      {/* Top Animated Bar Indicator */}
      <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4" />
      </div>

      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-2xs">
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>

      <div className="space-y-0.5">
        <p className="text-xs font-bold text-slate-800">{message}</p>
        <p className="text-[11px] text-slate-400">សូមរង់ចាំមួយភ្លែត</p>
      </div>
    </div>
  );
};
