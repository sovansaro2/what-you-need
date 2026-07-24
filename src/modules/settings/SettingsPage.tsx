import React, { useState } from 'react';
import { Store, Sliders, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { BusinessInfoForm } from './components/BusinessInfoForm';
import { PreferencesForm } from './components/PreferencesForm';
import { AccountSection } from './components/AccountSection';
import { RouteLoading } from '@/components/loading';

type SettingsTab = 'business' | 'preferences' | 'account';

export const SettingsPage: React.FC = () => {
  const {
    loading,
    saving,
    successMessage,
    errorMessage,
    businessSettings,
    userPreferences,
    saveBusinessInfo,
    savePreferences,
    changePassword,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  if (loading) {
    return <RouteLoading message="កំពុងទាញយកការកំណត់អាជីវកម្ម..." />;
  }

  const handlePreferencesSave = async (currency: 'KHR' | 'USD') => {
    return await savePreferences({ primaryCurrency: currency });
  };

  return (
    <div id="settings-page" className="max-w-xl mx-auto space-y-4 pb-6">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          ការកំណត់អាជីវកម្ម (Settings)
        </h1>
        <p className="text-xs text-slate-500">
          គ្រប់គ្រងព័ត៌មានហាង រូបិយវត្ថុ និងគណនីរបស់អ្នក
        </p>
      </div>

      {/* Global Feedback Banners */}
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

      {/* Section Navigation Tabs (Mobile-first Touch Friendly) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'business'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4 shrink-0" />
          <span className="truncate">ព័ត៌មានអាជីវកម្ម</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span className="truncate">ការកំណត់</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
            activeTab === 'account'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="truncate">គណនី</span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="pt-1">
        {activeTab === 'business' && (
          <BusinessInfoForm
            initialData={businessSettings}
            onSave={saveBusinessInfo}
            saving={saving}
          />
        )}

        {activeTab === 'preferences' && (
          <PreferencesForm
            initialSettings={businessSettings}
            initialPreferences={userPreferences}
            onSave={handlePreferencesSave}
            saving={saving}
          />
        )}

        {activeTab === 'account' && (
          <AccountSection
            onChangePassword={changePassword}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};
