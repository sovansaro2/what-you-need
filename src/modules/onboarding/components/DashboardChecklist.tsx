import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight, Sparkles, CheckSquare } from 'lucide-react';
import { Card, Badge, Button } from '@/components/common';
import { SetupChecklistItem } from '../types';

interface DashboardChecklistProps {
  items?: SetupChecklistItem[];
  onDismiss?: () => void;
}

const DEFAULT_CHECKLIST: SetupChecklistItem[] = [
  {
    id: 'setup-business',
    title: 'រៀបចំព័ត៌មានអាជីវកម្ម និងរូបិយវត្ថុ',
    description: 'កំណត់ឈ្មោះហាង ប្រភេទអាជីវកម្ម និងរូបិយវត្ថុគោល',
    isCompleted: true,
    actionRoute: '/onboarding',
    actionText: 'ពិនិត្យ',
  },
  {
    id: 'add-product',
    title: 'បន្ថែមទំនិញដំបូងក្នុងស្តុក',
    description: 'បញ្ចូលឈ្មោះទំនិញ តម្លៃដើម តម្លៃលក់ និងចំនួនស្តុក',
    isCompleted: false,
    actionRoute: '/products',
    actionText: 'បន្ថែមទំនិញ',
  },
  {
    id: 'record-finance',
    title: 'កត់ត្រាចំណូល ឬចំណាយដំបូង',
    description: 'បញ្ចូលទិន្នន័យចំណូល/ចំណាយប្រចាំថ្ងៃដំបូងរបស់អ្នក',
    isCompleted: false,
    actionRoute: '/finance',
    actionText: 'កត់ត្រា',
  },
];

export const DashboardChecklist: React.FC<DashboardChecklistProps> = ({
  items = DEFAULT_CHECKLIST,
  onDismiss,
}) => {
  const navigate = useNavigate();

  const completedCount = items.filter((item) => item.isCompleted).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <Card className="p-4 space-y-3.5 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-2xs">
      <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">បញ្ជីត្រួតពិនិត្យការរៀបចំដំបូង</h3>
              <Badge variant="primary" className="text-[10px] px-1.5 py-0">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                {progressPercent}%
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              បំពេញ {completedCount} នៃ {items.length} ជំហានដើមដើម្បីចាប់ផ្តើមអាជីវកម្ម
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            លាក់
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              item.isCompleted
                ? 'bg-slate-50/80 border-slate-200/80'
                : 'bg-white border-slate-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="shrink-0 mt-0.5">
                {item.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div>
                <h4
                  className={`text-xs font-bold ${
                    item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>

            {!item.isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(item.actionRoute)}
                className="shrink-0 text-[11px] py-1 px-2.5 min-h-[36px]"
                icon={<ArrowRight className="w-3 h-3" />}
              >
                {item.actionText}
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
