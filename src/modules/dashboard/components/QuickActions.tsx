import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickActionItem } from '../types';

interface QuickActionsProps {
  actions: QuickActionItem[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const navigate = useNavigate();

  return (
    <div id="quick-actions-container" className="space-y-2">
      <h3 id="quick-actions-title" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        សកម្មភាពរហ័ស
      </h3>
      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              id={`quick-action-btn-${action.id}`}
              type="button"
              onClick={() => navigate(action.path)}
              className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-2xs hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
            >
              <div className={`p-2.5 rounded-xl ${action.color} mb-1.5 transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 line-clamp-1">{action.label}</span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{action.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
