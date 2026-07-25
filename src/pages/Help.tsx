import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShoppingBag, BarChart3, CreditCard, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card } from '@/components/common';

export const Help: React.FC = () => {
  const navigate = useNavigate();

  const guides = [
    {
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      title: '១. ការគ្រប់គ្រងការលក់ (POS Sales)',
      description: 'របៀបចុះបញ្ជីទំនិញលក់ ជ្រើសរើសបរិមាណ គណនាប្រាក់ និងបោះពុម្ពវិក្កយបត្រជូនអតិថិជន។',
    },
    {
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      title: '២. ការគ្រប់គ្រងទំនិញ និងស្តុក (Products & Inventory)',
      description: 'របៀបបន្ថែមមុខទំនិញថ្មី កែប្រែតម្លៃ គ្រប់គ្រងប្រភេទទំនិញ និងពិនិត្យការជូនដំណឹងស្តុកទាប។',
    },
    {
      icon: BarChart3,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      title: '៣. ហិរញ្ញវត្ថុ និងរបាយការណ៍ (Finance & Reports)',
      description: 'តាមដានចំណូល ចំណាយ សរុបប្រាក់ចំណេញប្រចាំថ្ងៃ ប្រចាំសប្តាហ៍ និងប្រចាំខែ។',
    },
    {
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      title: '៤. សុវត្ថិភាព និងការកំណត់ (Security & Settings)',
      description: 'របៀបកែប្រែព័ត៌មានអាជីវកម្ម ប្តូរពាក្យសម្ងាត់ និងជ្រើសរើសរូបិយវត្ថុ (KHR/USD)។',
    },
  ];

  return (
    <div className="max-w-md mx-auto space-y-4 pb-6 animate-fade-in">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/account')}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="ត្រឡប់ក្រោយ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            ការណែនាំអំពីការប្រើប្រាស់ (User Guide)
          </h1>
          <p className="text-xs text-slate-500">
            សិក្សារបៀបប្រើប្រាស់ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្ម
          </p>
        </div>
      </div>

      <Card className="p-5 space-y-5 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">សៀវភៅណែនាំប្រើប្រាស់</h3>
            <p className="text-xs text-slate-500">មគ្គុទ្ទេសក៍ជំហានៗសម្រាប់ការប្រើប្រាស់</p>
          </div>
        </div>

        <div className="space-y-3">
          {guides.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${item.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-9">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* FAQ Prompt */}
        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-indigo-950">ត្រូវការជំនួយបន្ថែម?</p>
              <p className="text-[11px] text-indigo-700">ទំនាក់ទំនងអ្នកគ្រប់គ្រងប្រព័ន្ធ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/support')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            ទាក់ទង
          </button>
        </div>
      </Card>
    </div>
  );
};
