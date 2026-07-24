import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FeatureItem } from '../types';

interface FeatureCardProps {
  feature: FeatureItem;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const navigate = useNavigate();
  const Icon = feature.icon;

  const getStatusBadge = () => {
    switch (feature.status) {
      case 'available':
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">
            អាចប្រើបាន
          </span>
        );
      case 'coming_soon':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
            ឆាប់ៗនេះ
          </span>
        );
    }
  };

  return (
    <div
      id={`feature-card-${feature.id}`}
      onClick={() => navigate(feature.route)}
      className="p-4 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          {getStatusBadge()}
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {feature.title}
        </h3>

        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {feature.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${feature.badgeColor || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {feature.badgeText || feature.route}
        </span>
        <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          បើក <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
