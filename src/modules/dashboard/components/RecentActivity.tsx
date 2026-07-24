import React from 'react';
import { ArrowUpRight, ArrowDownRight, ShoppingBag, Package } from 'lucide-react';
import { RecentActivityItem } from '../types';

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'income':
        return {
          icon: ArrowUpRight,
          style: 'bg-emerald-100 text-emerald-700',
        };
      case 'expense':
        return {
          icon: ArrowDownRight,
          style: 'bg-rose-100 text-rose-700',
        };
      case 'sale':
        return {
          icon: ShoppingBag,
          style: 'bg-blue-100 text-blue-700',
        };
      case 'inventory':
      default:
        return {
          icon: Package,
          style: 'bg-amber-100 text-amber-700',
        };
    }
  };

  return (
    <div id="recent-activity-container" className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 id="recent-activity-title" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          សកម្មភាពថ្មីៗ
        </h3>
        <span id="recent-activity-badge" className="text-[11px] font-medium text-slate-400">
          ទិន្នន័យគំរូ
        </span>
      </div>

      <div id="recent-activity-list" className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">គ្មានសកម្មភាពថ្មីៗទេ</div>
        ) : (
          activities.map((item) => {
            const { icon: Icon, style } = getActivityIcon(item.type);
            return (
              <div key={item.id} id={`activity-item-${item.id}`} className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${style} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  {item.amount && (
                    <div
                      className={`text-xs font-bold ${
                        item.type === 'income' || item.type === 'sale'
                          ? 'text-emerald-600'
                          : item.type === 'expense'
                          ? 'text-rose-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.amount}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.date}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
