import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, CheckCircle2, Shield, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { Card, Badge, Button } from '@/components/common';

export const VersionPage: React.FC = () => {
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
            កំណែកម្មវិធី (Application Version)
          </h1>
          <p className="text-xs text-slate-500">
            ព័ត៌មានកំណែទម្រង់ និងលេខកូដសម្គាល់ប្រព័ន្ធ
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-6 border-slate-200/80 text-center">
        {/* Version Hero Badge */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md">
            <Info className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              ប្រព័ន្ធគ្រប់គ្រងការលក់ POS
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              POS Management Application
            </p>
          </div>
          <Badge variant="success" className="px-3 py-1 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            កំណែចុងក្រោយបង្អស់
          </Badge>
        </div>

        {/* Technical Version Info */}
        <div className="space-y-3 text-left pt-2 border-t border-slate-100">
          {/* Version Number */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">លេខកំណែកម្មវិធី (Version)</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              v1.0.0
            </span>
          </div>

          {/* Build Number */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">លេខស៊េរីបង្កើត (Build Number)</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Build 2026.07.25
            </span>
          </div>

          {/* Release Features */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>កំណត់ចំណាំការអាប់ដេត (Release Notes)</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 pl-6 list-disc">
              <li>រចនាសម្ព័ន្ធផ្លូវរុករកដាច់ដោយឡែកពីគ្នា (Dedicated Navigation Routes)</li>
              <li>ការគ្រប់គ្រងហិរញ្ញវត្ថុ និងប្រព័ន្ធស្តុកទំនិញស្វ័យប្រវត្ត</li>
              <li>ប្រព័ន្ធសុវត្ថិភាព និងការប្តូរពាក្យសម្ងាត់ផ្ទាល់ខ្លួន</li>
            </ul>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => alert('ប្រព័ន្ធរបស់អ្នកស្ថិតក្នុងកំណែចុងក្រោយរួចរាល់ហើយ!')}
          className="w-full font-bold min-h-[44px]"
          icon={<RefreshCw className="w-4 h-4 text-indigo-600" />}
        >
          ពិនិត្យការអាប់ដេតថ្មី
        </Button>
      </Card>
    </div>
  );
};
