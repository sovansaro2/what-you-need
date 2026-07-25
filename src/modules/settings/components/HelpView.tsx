import React from 'react';
import { ArrowLeft, HelpCircle, BookOpen, MessageSquare, PhoneCall, Mail } from 'lucide-react';
import { Card } from '@/components/common';

interface HelpViewProps {
  onBack: () => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onBack }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="ត្រឡប់ក្រោយ"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            មជ្ឈមណ្ឌលជំនួយ (Help Center)
          </h1>
          <p className="text-xs text-slate-500">
            ការណែនាំអំពីការប្រើប្រាស់ប្រព័ន្ធ និងការគាំទ្រ
          </p>
        </div>
      </div>

      <Card className="p-5 space-y-4 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ជំនួយ និងការគាំទ្រ</h3>
            <p className="text-xs text-slate-500">លោកអ្នកអាចស្វែងយល់បន្ថែម ឬទាក់ទងមកក្រុមការងារគាំទ្រ</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>ការណែនាំអំពីការប្រើប្រាស់ប្រព័ន្ធ</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ប្រព័ន្ធគ្រប់គ្រង POS ត្រូវបានរចនាឡើងយ៉ាងសាមញ្ញ ងាយស្រួលប្រើប្រាស់។ លោកអ្នកអាចគ្រប់គ្រងការលក់ ទំនិញ និងហិរញ្ញវត្ថុបានយ៉ាងរហ័ស។
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>ការគាំទ្របច្ចេកទេស</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ប្រសិនបើមានចម្ងល់ ឬជួបបញ្ហាបច្ចេកទេស ក្រុមការងារយើងខ្ញុំរង់ចាំជួយសម្រួលជានិច្ច។
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900 font-medium">
              <PhoneCall className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>+855 12 345 678</span>
            </div>
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2.5 text-xs text-indigo-900 font-medium">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>support@pos-system.com</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
