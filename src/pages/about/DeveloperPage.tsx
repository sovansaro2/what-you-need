import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Code2, Globe, Mail, Terminal, Cpu, Sparkles, Building } from 'lucide-react';
import { Card, Badge } from '@/components/common';

export const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();

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
            អ្នកអភិវឌ្ឍន៍ (Developer Info)
          </h1>
          <p className="text-xs text-slate-500">
            ព័ត៌មានក្រុមការងារបច្ចេកវិទ្យា និងអ្នកបង្កើត
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-6 border-slate-200/80">
        {/* Developer Header Badge */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md">
            <Code2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              ក្រុមការងារអភិវឌ្ឍន៍ប្រព័ន្ធ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Software Engineering & Development Team
            </p>
          </div>
          <Badge variant="primary" className="px-3 py-1 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Lead System Architect
          </Badge>
        </div>

        {/* Technical Details */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">ក្រុមហ៊ុន/ក្រុម (Organization)</span>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              POS Solutions Tech
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">បច្ចេកវិទ្យាប្រើប្រាស់ (Tech Stack)</span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              React 18 / TS / Supabase
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">អ៊ីមែលទំនាក់ទំនង (Contact Email)</span>
            </div>
            <a
              href="mailto:dev@pos-system.com"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              dev@pos-system.com
            </a>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">គេហទំព័រផ្លូវការ (Website)</span>
            </div>
            <a
              href="https://pos-system.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              pos-system.com
            </a>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-3">
          <Terminal className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-900 leading-snug font-medium">
            អភិវឌ្ឍន៍ឡើងយ៉ាងផ្ចិតផ្ចង់ជាមួយស្តង់ដារប្រូហ្វេស៊ីនណាល់ខ្ពស់ ដើម្បីធានាសុវត្ថិភាព និងល្បឿនប្រតិបត្តិការ។
          </p>
        </div>
      </Card>
    </div>
  );
};
