import React from 'react';
import { ArrowLeft, Info, Code2, Mail, CheckCircle2, Shield } from 'lucide-react';
import { Card, Badge } from '@/components/common';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
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
            អំពីកម្មវិធី
          </h1>
          <p className="text-xs text-slate-500">
            ព័ត៌មានប្រព័ន្ធ កំណែទម្រង់ និងទំនាក់ទំនង
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-6 text-center border-slate-200/80">
        {/* Application Logo & Title */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              ប្រព័ន្ធគ្រប់គ្រងការលក់ (POS System)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ប្រព័ន្ធគ្រប់គ្រងអាជីវកម្មឆ្លាតវៃសម្រាប់ហាង និងអាជីវកម្ម
            </p>
          </div>
          <Badge variant="primary" className="px-3 py-1 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            កំណែ v1.0.0 (Production Ready)
          </Badge>
        </div>

        {/* Detailed Information Rows */}
        <div className="space-y-3 text-left pt-2 border-t border-slate-100">
          {/* Version */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">កំណែកម្មវិធី (Application Version)</span>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              v1.0.0
            </span>
          </div>

          {/* Developer */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">អ្នកអភិវឌ្ឍន៍ (Developer)</span>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              ក្រុមការងារអភិវឌ្ឍន៍ប្រព័ន្ធ
            </span>
          </div>

          {/* Contact */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">ទំនាក់ទំនង (Contact Support)</span>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              support@pos-system.com
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
