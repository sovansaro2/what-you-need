import React from 'react';
import { Store, Sliders, ShieldCheck, Info, ChevronRight, ArrowLeft } from 'lucide-react';

interface SettingsListViewProps {
  onBack: () => void;
  onSelectSubView: (subView: 'business-info' | 'general-settings' | 'security' | 'about') => void;
}

export const SettingsListView: React.FC<SettingsListViewProps> = ({
  onBack,
  onSelectSubView,
}) => {
  const menuItems = [
    {
      id: 'business-info' as const,
      title: 'ព័ត៌មានអាជីវកម្ម',
      subtitle: 'ឈ្មោះ ឡូហ្គោ លេខទូរស័ព្ទ អ៊ីមែល និងអាសយដ្ឋាន',
      icon: Store,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'general-settings' as const,
      title: 'ការកំណត់ទូទៅ',
      subtitle: 'រូបិយវត្ថុ ភាសា និងរចនាប័ទ្មបង្ហាញ',
      icon: Sliders,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'security' as const,
      title: 'សុវត្ថិភាព',
      subtitle: 'ប្តូរពាក្យសម្ងាត់ និងចាកចេញពីគណនី',
      icon: ShieldCheck,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'about' as const,
      title: 'អំពីកម្មវិធី',
      subtitle: 'ព័ត៌មានកំណែកម្មវិធី និងទំនាក់ទំនង',
      icon: Info,
      iconBg: 'bg-sky-50 text-sky-600',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="ត្រឡប់ក្រោយ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            ការកំណត់អាជីវកម្ម
          </h1>
          <p className="text-xs text-slate-500 leading-normal">
            ជ្រើសរើសផ្នែកដែលអ្នកចង់កំណត់
          </p>
        </div>
      </div>

      {/* Android Settings Style List Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSubView(item.id)}
              className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 leading-snug truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 leading-normal truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
