import React from 'react';
import { SummaryMetric } from '../types';

interface SummaryCardProps {
  metric: SummaryMetric;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ metric }) => {
  const Icon = metric.icon;

  const getTypeStyles = () => {
    switch (metric.type) {
      case 'income':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          iconBg: 'bg-emerald-100 text-emerald-700',
          text: 'text-emerald-700',
        };
      case 'expense':
        return {
          bg: 'bg-rose-50 border-rose-100',
          iconBg: 'bg-rose-100 text-rose-700',
          text: 'text-rose-700',
        };
      case 'profit':
        return {
          bg: 'bg-indigo-50 border-indigo-100',
          iconBg: 'bg-indigo-100 text-indigo-700',
          text: 'text-indigo-700',
        };
      case 'inventory':
        return {
          bg: 'bg-amber-50 border-amber-100',
          iconBg: 'bg-amber-100 text-amber-700',
          text: 'text-slate-900',
        };
      case 'sales':
      default:
        return {
          bg: 'bg-blue-50 border-blue-100',
          iconBg: 'bg-blue-100 text-blue-700',
          text: 'text-slate-900',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      id={`summary-card-${metric.id}`}
      className={`p-4 rounded-xl border ${styles.bg} shadow-2xs transition-all flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-600">{metric.label}</span>
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className={`text-lg font-bold tracking-tight ${styles.text}`}>{metric.value}</div>
        {metric.change && (
          <div className="mt-1 flex items-center text-[11px] font-medium">
            <span className={metric.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
              {metric.change}
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};
