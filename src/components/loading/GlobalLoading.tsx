import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/common';

interface GlobalLoadingProps {
  isLoading?: boolean;
  message?: string;
  submessage?: string;
  children?: React.ReactNode;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  isLoading = true,
  message = 'កំពុងដំណើរការទិន្នន័យ...',
  submessage = 'សូមរង់ចាំមួយភ្លែត',
  children,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div id="global-loading-overlay" className="relative">
      {/* If children are provided, render them underneath */}
      {children}

      {/* Overlay Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-all">
        <Card className="bg-white rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center space-y-3 border-indigo-100">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">{message}</h3>
            {submessage && (
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {submessage}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
