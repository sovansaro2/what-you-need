import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Sun, Moon, Check, Save, CheckCircle2, AlertCircle, Palette } from 'lucide-react';
import { Card, Button, Badge } from '@/components/common';
import { useSettings } from '@/modules/settings/hooks/useSettings';
import { RouteLoading } from '@/components/loading';

export const GeneralSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    successMessage,
    errorMessage,
    userPreferences,
    savePreferences,
  } = useSettings();

  const [language, setLanguage] = useState<'km' | 'en'>('km');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (userPreferences) {
      setTheme(userPreferences.theme || 'light');
    }
  }, [userPreferences]);

  if (loading) {
    return <RouteLoading message="កំពុងទាញយកទិន្នន័យ..." />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePreferences({ theme });
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
            ការកំណត់ទូទៅ (General Settings)
          </h1>
          <p className="text-xs text-slate-500">
            កំណត់ភាសា និងរចនាប័ទ្មបង្ហាញប្រព័ន្ធ
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
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ការកំណត់ទូទៅ</h3>
            <p className="text-xs text-slate-500">ជ្រើសរើសភាសា និងរចនាប័ទ្មចំណុចប្រទាក់</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* 1. Language Control */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              ភាសាប្រព័ន្ធ (System Language)
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setLanguage('km')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                  language === 'km'
                    ? 'bg-indigo-50/80 border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                    🇰🇭
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">ភាសាខ្មែរ</p>
                    <p className="text-[10px] text-slate-500">Khmer</p>
                  </div>
                </div>
                {language === 'km' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
              </div>

              <div
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                  language === 'en'
                    ? 'bg-indigo-50/80 border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    🇬🇧
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">English</p>
                    <p className="text-[10px] text-slate-500">អង់គ្លេស</p>
                  </div>
                </div>
                {language === 'en' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* 2. Theme Control */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              រចនាប័ទ្មបង្ហាញ (App Theme)
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                  theme === 'light'
                    ? 'bg-indigo-50/80 border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">ពន្លឺ</p>
                    <p className="text-[10px] text-slate-500">Light Mode</p>
                  </div>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
              </div>

              <div
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between min-h-[48px] ${
                  theme === 'dark'
                    ? 'bg-indigo-50/80 border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-100 font-bold flex items-center justify-center text-xs">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">ងងឹត</p>
                    <p className="text-[10px] text-slate-500">Dark Mode</p>
                  </div>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Submit Save */}
          <div className="pt-2">
            <Button
              type="submit"
              loading={saving}
              variant="primary"
              size="md"
              className="w-full font-bold shadow-xs min-h-[44px]"
              icon={<Save className="w-4 h-4" />}
            >
              រក្សាទុកការកំណត់ទូទៅ
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
