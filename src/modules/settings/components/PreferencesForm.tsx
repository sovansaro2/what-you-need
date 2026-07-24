import React, { useState, useEffect } from 'react';
import { Sliders, DollarSign, Globe, Sun, Check, Save } from 'lucide-react';
import { Button, Card, Badge } from '@/components/common';
import { BusinessSettings, UserPreferences } from '../types';

interface PreferencesFormProps {
  initialSettings: BusinessSettings;
  initialPreferences: UserPreferences;
  onSave: (currency: 'KHR' | 'USD') => Promise<boolean>;
  saving: boolean;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  initialSettings,
  onSave,
  saving,
}) => {
  const [currency, setCurrency] = useState<'KHR' | 'USD'>(
    initialSettings.primaryCurrency || 'KHR'
  );

  useEffect(() => {
    setCurrency(initialSettings.primaryCurrency || 'KHR');
  }, [initialSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(currency);
  };

  return (
    <Card className="p-5 space-y-4 border-slate-200/80">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">ការកំណត់ប្រព័ន្ធ</h3>
          <p className="text-xs text-slate-500">កំណត់រូបិយវត្ថុ ភាសា និងរចនាប័ទ្មបង្ហាញ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Currency Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            រូបិយវត្ថុគោលបង្ហាញទិន្នន័យ (Currency)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setCurrency('KHR')}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                currency === 'KHR'
                  ? 'bg-indigo-50/80 border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  ៛
                </span>
                <span className="text-xs font-bold text-slate-900">ប្រាក់រៀល (KHR)</span>
              </div>
              {currency === 'KHR' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
            </div>

            <div
              onClick={() => setCurrency('USD')}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                currency === 'USD'
                  ? 'bg-indigo-50/80 border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  $
                </span>
                <span className="text-xs font-bold text-slate-900">ប្រាក់ដុល្លារ (USD)</span>
              </div>
              {currency === 'USD' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
            </div>
          </div>
        </div>

        {/* Read-Only Standards: Language & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Language Standard */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs font-bold text-slate-800">ភាសាប្រព័ន្ធ</p>
                <p className="text-[10px] text-slate-400">Language</p>
              </div>
            </div>
            <Badge variant="primary" className="text-[11px]">
              ភាសាខ្មែរ (Khmer)
            </Badge>
          </div>

          {/* Theme Standard */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-800">រចនាប័ទ្មបង្ហាញ</p>
                <p className="text-[10px] text-slate-400">Theme</p>
              </div>
            </div>
            <Badge variant="neutral" className="text-[11px] bg-amber-50 text-amber-800 border-amber-200">
              ពន្លឺ (Light Mode)
            </Badge>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button
            type="submit"
            loading={saving}
            variant="primary"
            size="md"
            className="w-full font-bold shadow-xs min-h-[44px]"
            icon={<Save className="w-4 h-4" />}
          >
            រក្សាទុកការកំណត់ប្រព័ន្ធ
          </Button>
        </div>
      </form>
    </Card>
  );
};
