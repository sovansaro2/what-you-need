import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { StockMovementType } from '../types';

interface ProjectedStockCardProps {
  currentStock: number;
  delta: number;
  projectedStock: number;
  unit: string;
  minStockAlert?: number | null;
  movementType: StockMovementType;
}

export const ProjectedStockCard: React.FC<ProjectedStockCardProps> = ({
  currentStock,
  delta,
  projectedStock,
  unit,
  minStockAlert = 5,
}) => {
  const isNegative = projectedStock < 0;
  const isZero = projectedStock === 0;
  const alertThreshold = minStockAlert ?? 5;
  const isLowStock = !isNegative && projectedStock <= alertThreshold;

  // Determine status color and icon
  let statusTheme = {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    label: 'ស្តុកគ្រប់គ្រាន់',
    Icon: CheckCircle2,
  };

  if (isNegative) {
    statusTheme = {
      bg: 'bg-rose-50/90',
      border: 'border-rose-300',
      text: 'text-rose-800',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      label: 'ស្តុកអវិជ្ជមាន (មិនអនុញ្ញាត)',
      Icon: AlertOctagon,
    };
  } else if (isZero) {
    statusTheme = {
      bg: 'bg-amber-50/80',
      border: 'border-amber-300',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      label: 'អស់ស្តុក',
      Icon: AlertTriangle,
    };
  } else if (isLowStock) {
    statusTheme = {
      bg: 'bg-amber-50/80',
      border: 'border-amber-300',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      label: 'ស្តុកស្ថិតក្នុងកម្រិតទាប',
      Icon: AlertTriangle,
    };
  }

  const StatusIcon = statusTheme.Icon;

  return (
    <div id="projected-stock-card" className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          សមតុល្យស្តុកព្យាករណ៍ (Projected Stock)
        </label>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusTheme.badge}`}
        >
          <StatusIcon className="w-3 h-3 shrink-0" />
          <span>{statusTheme.label}</span>
        </span>
      </div>

      <div
        className={`p-4 rounded-2xl border transition-all ${statusTheme.bg} ${statusTheme.border}`}
      >
        <div className="grid grid-cols-3 gap-2 items-center text-center">
          {/* Current Stock */}
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium block">ស្តុកបច្ចុប្បន្ន</span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-800">
              {currentStock}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{unit}</span>
          </div>

          {/* Delta Operator Indicator */}
          <div className="flex flex-col items-center justify-center space-y-0.5">
            <span
              className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md border ${
                delta > 0
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : delta < 0
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {delta > 0 ? `+${delta}` : `${delta}`}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Projected Final Stock */}
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-600 font-bold block">ស្តុកក្រោយប្រវត្តិ</span>
            <div
              className={`text-xl sm:text-2xl font-black font-mono ${statusTheme.text}`}
            >
              {projectedStock}
            </div>
            <span className="text-[10px] font-semibold text-slate-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
