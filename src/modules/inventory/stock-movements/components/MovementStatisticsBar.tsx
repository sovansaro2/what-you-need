import React from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  AlertTriangle,
  CalendarX,
  Activity,
} from 'lucide-react';

export interface MovementStatisticsBarProps {
  totalMovements: number;
  todayMovements: number;
  stockInCount: number;
  stockOutCount: number;
  adjustmentCount: number;
  damageCount: number;
  expiredCount: number;
}

export const MovementStatisticsBar: React.FC<MovementStatisticsBarProps> = ({
  totalMovements,
  todayMovements,
  stockInCount,
  stockOutCount,
  adjustmentCount,
  damageCount,
  expiredCount,
}) => {
  const stats = [
    {
      id: 'today',
      label: 'ថ្ងៃនេះ',
      sublabel: 'Today',
      value: todayMovements,
      icon: Activity,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200/60',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'total',
      label: 'សរុប',
      sublabel: 'Total',
      value: totalMovements,
      icon: TrendingUp,
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-800',
      borderColor: 'border-slate-200/80',
      iconBg: 'bg-slate-200/80 text-slate-700',
    },
    {
      id: 'stock_in',
      label: 'បញ្ចូលស្តុក',
      sublabel: 'Stock In',
      value: stockInCount,
      icon: ArrowDownLeft,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200/60',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'stock_out',
      label: 'លក់/ចេញ',
      sublabel: 'Stock Out',
      value: stockOutCount,
      icon: ArrowUpRight,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200/60',
      iconBg: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'adjustment',
      label: 'កែសម្រួល',
      sublabel: 'Adjusted',
      value: adjustmentCount,
      icon: Sliders,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200/60',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'damage',
      label: 'ខូចខាត',
      sublabel: 'Damage',
      value: damageCount,
      icon: AlertTriangle,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200/60',
      iconBg: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'expired',
      label: 'ហួសកំណត់',
      sublabel: 'Expired',
      value: expiredCount,
      icon: CalendarX,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200/60',
      iconBg: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2.5 min-w-max sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:min-w-0">
        {stats.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className={`flex-1 min-w-[120px] p-3 rounded-xl border ${item.bgColor} ${item.borderColor} flex flex-col justify-between transition-all`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-medium text-slate-600 truncate">
                  {item.label}
                </span>
                <div className={`p-1 rounded-lg ${item.iconBg} shrink-0`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-1">
                <span className={`text-lg font-bold ${item.textColor} tracking-tight`}>
                  {item.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-normal truncate">
                  {item.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
