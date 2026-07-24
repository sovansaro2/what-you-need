import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';

export const ModulePlaceholder: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  const location = useLocation();

  return (
    <div id="module-placeholder-page" className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-2xs">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
        <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-100 mb-6">
          Route: {location.pathname}
        </div>
        <div>
          <Link
            to="/features"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Features
          </Link>
        </div>
      </div>
    </div>
  );
};
