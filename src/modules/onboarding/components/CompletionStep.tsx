import React from 'react';
import { CheckCircle2, Store, DollarSign, Package, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Button, Card, Badge } from '@/components/common';
import { BusinessProfile } from '../types';

interface CompletionStepProps {
  data: BusinessProfile;
  onFinish: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({ data, onFinish }) => {
  return (
    <div className="space-y-5 text-center">
      {/* Celebration Header */}
      <Card className="bg-gradient-to-b from-emerald-50 via-white to-white border-emerald-100 p-6 space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1 max-w-sm mx-auto">
          <Badge variant="success" className="mx-auto mb-1">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            ការរៀបចំបានជោគជ័យ
          </Badge>
          <h2 className="text-xl font-bold text-slate-900">
            អាជីវកម្មរបស់អ្នករៀបចំរួចរាល់ហើយ!
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            ប្រព័ន្ធ WYN ត្រូវបានរៀបចំសម្រាប់ដំណើរការអាជីវកម្មរបស់អ្នក។ អ្នកអាចចាប់ផ្តើមកត់ត្រាហិរញ្ញវត្ថុ និងបន្ថែមទំនិញបានភ្លាមៗ។
          </p>
        </div>

        {/* Business Summary Badge Card */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-left space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-indigo-600" />
              អាជីវកម្ម:
            </span>
            <span className="font-bold text-slate-900">{data.businessName || 'មិនបានបញ្ចូល'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">ប្រភេទ:</span>
            <span className="font-medium text-slate-800">{data.businessType}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              រូបិយវត្ថុគោល:
            </span>
            <span className="font-bold text-emerald-700">
              {data.primaryCurrency === 'KHR' ? 'ប្រាក់រៀល (៛)' : 'ប្រាក់ដុល្លារ ($)'}
            </span>
          </div>
        </div>
      </Card>

      {/* Modules Ready to Use */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">ហិរញ្ញវត្ថុ</h4>
            <p className="text-[10px] text-slate-500">កត់ត្រាចំណូល/ចំណាយ</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">គ្រប់គ្រងទំនិញ</h4>
            <p className="text-[10px] text-slate-500">គ្រប់គ្រងស្តុក និងតម្លៃ</p>
          </div>
        </div>
      </div>

      {/* Enter Dashboard Action */}
      <div className="pt-2">
        <Button
          onClick={onFinish}
          size="lg"
          variant="primary"
          className="w-full text-base font-bold shadow-md"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង (Dashboard)
        </Button>
      </div>
    </div>
  );
};
