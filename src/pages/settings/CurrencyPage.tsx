import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Check, Save, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { Card, Button } from '@/components/common';
import { useSettings } from '@/modules/settings/hooks/useSettings';
import { RouteLoading } from '@/components/loading';

export const CurrencyPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    successMessage,
    errorMessage,
    businessSettings,
    saveBusinessInfo,
  } = useSettings();

  const [currency, setCurrency] = useState<'KHR' | 'USD'>('KHR');

  useEffect(() => {
    if (businessSettings?.primaryCurrency) {
      setCurrency(businessSettings.primaryCurrency);
    }
  }, [businessSettings]);

  if (loading) {
    return <RouteLoading message="កំពុងទាញយកទិន្នន័យ..." />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBusinessInfo({ primaryCurrency: currency });
  };

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
            កំណត់រូបិយវត្ថុ (Currency)
          </h1>
          <p className="text-xs text-slate-500">
            ជ្រើសរើសរូបិយវត្ថុគោលសម្រាប់បង្ហាញការលក់ និងរបាយការណ៍
          </p>
        </div>
      </div>

      {/* Feedback Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-2xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card className="p-5 space-y-5 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ជ្រើសរើសរូបិយវត្ថុ</h3>
            <p className="text-xs text-slate-500">KHR / USD Selector Only</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              រូបិយវត្ថុគោលបង្ហាញទិន្នន័យ
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* KHR Option */}
              <div
                onClick={() => setCurrency('KHR')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[56px] ${
                  currency === 'KHR'
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-2xs">
                    ៛
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">ប្រាក់រៀល (KHR)</p>
                    <p className="text-xs text-slate-500">Cambodian Riel</p>
                  </div>
                </div>
                {currency === 'KHR' && <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />}
              </div>

              {/* USD Option */}
              <div
                onClick={() => setCurrency('USD')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[56px] ${
                  currency === 'USD'
                    ? 'bg-indigo-50/80 border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-2xs">
                    $
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">ប្រាក់ដុល្លារ (USD)</p>
                    <p className="text-xs text-slate-500">US Dollar</p>
                  </div>
                </div>
                {currency === 'USD' && <Check className="w-5 h-5 text-indigo-600 stroke-[3]" />}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={saving}
              variant="primary"
              size="md"
              className="w-full font-bold shadow-xs min-h-[44px]"
              icon={<Save className="w-4 h-4" />}
            >
              រក្សាទុករូបិយវត្ថុ
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
