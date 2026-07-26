import React from 'react';

interface LoadingStateProps {
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ count = 4 }) => {
  return (
    <div className="space-y-3.5 my-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs animate-pulse"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 rounded-md" />
                <div className="h-3 w-20 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="h-6 w-24 bg-slate-200 rounded-full shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-12 bg-slate-300 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-12 bg-slate-300 rounded" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="h-3 w-24 bg-slate-100 rounded" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
