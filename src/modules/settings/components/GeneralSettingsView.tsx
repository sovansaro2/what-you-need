import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PreferencesForm } from './PreferencesForm';
import { BusinessSettings, UserPreferences } from '../types';

interface GeneralSettingsViewProps {
  onBack: () => void;
  businessSettings: BusinessSettings;
  userPreferences: UserPreferences;
  onSave: (currency: 'KHR' | 'USD') => Promise<boolean>;
  saving: boolean;
}

export const GeneralSettingsView: React.FC<GeneralSettingsViewProps> = ({
  onBack,
  businessSettings,
  userPreferences,
  onSave,
  saving,
}) => {
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
            ការកំណត់ទូទៅ
          </h1>
          <p className="text-xs text-slate-500">
            កំណត់រូបិយវត្ថុ ភាសា និងរចនាប័ទ្មបង្ហាញប្រព័ន្ធ
          </p>
        </div>
      </div>

      <PreferencesForm
        initialSettings={businessSettings}
        initialPreferences={userPreferences}
        onSave={onSave}
        saving={saving}
      />
    </div>
  );
};
