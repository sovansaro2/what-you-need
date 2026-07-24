import React, { useState } from 'react';
import { DollarSign, Check, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { BusinessProfile } from '../types';

interface CurrencyStepProps {
  data: BusinessProfile;
  onNext: (updated: Partial<BusinessProfile>) => void;
  onBack: () => void;
}

export const CurrencyStep: React.FC<CurrencyStepProps> = ({
  data,
  onNext,
  onBack,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'KHR' | 'USD'>(
    data.primaryCurrency || 'KHR'
  );

  const handleNext = () => {
    onNext({ primaryCurrency: selectedCurrency });
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">ជ្រើសរើសរូបិយវត្ថុគោល</h2>
            <p className="text-xs text-slate-500">
              ជ្រើសរើសរូបិយវត្ថុចម្បងសម្រាប់បង្ហាញតម្លៃ និងរបាយការណ៍ហិរញ្ញវត្ថុ
            </p>
          </div>
        </div>

        {/* Currency Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* KHR Option */}
          <div
            onClick={() => setSelectedCurrency('KHR')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
              selectedCurrency === 'KHR'
                ? 'bg-indigo-50/70 border-indigo-600 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  ៛
                </span>
                <span className="text-sm font-bold text-slate-900">ប្រាក់រៀល (KHR)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                ស័ក្តិសមបំផុតសម្រាប់ហាងទូទៅនៅកម្ពុជា ដែលទូទាត់ជាប្រាក់រៀលប្រចាំថ្ងៃ។
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                selectedCurrency === 'KHR'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {selectedCurrency === 'KHR' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>

          {/* USD Option */}
          <div
            onClick={() => setSelectedCurrency('USD')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
              selectedCurrency === 'USD'
                ? 'bg-indigo-50/70 border-indigo-600 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  $
                </span>
                <span className="text-sm font-bold text-slate-900">ប្រាក់ដុល្លារ (USD)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                សម្រាប់អាជីវកម្មដែលកំណត់តម្លៃ និងទូទាត់ជាដុល្លារអាមេរិក។
              </p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                selectedCurrency === 'USD'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {selectedCurrency === 'USD' && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            អ្នកអាចផ្លាស់ប្តូររូបិយវត្ថុ ឬបន្ថែមការកំណត់ប្តូរប្រាក់នៅពេលក្រោយក្នុងទំព័រការកំណត់គណនីបាន។
          </span>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          variant="secondary"
          size="lg"
          className="flex-1"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          ត្រឡប់ក្រោយ
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="flex-1"
          icon={<ArrowRight className="w-4 h-4" />}
        >
          បន្តទៅមុខ
        </Button>
      </div>
    </div>
  );
};
