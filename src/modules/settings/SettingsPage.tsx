import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { SettingsListView } from './components/SettingsListView';
import { BusinessInfoView } from './components/BusinessInfoView';
import { GeneralSettingsView } from './components/GeneralSettingsView';
import { SecurityView } from './components/SecurityView';
import { AboutView } from './components/AboutView';
import { HelpView } from './components/HelpView';
import { RouteLoading } from '@/components/loading';

export type SettingsSubView =
  | 'settings-list'
  | 'business-info'
  | 'general-settings'
  | 'security'
  | 'about'
  | 'help';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    successMessage,
    errorMessage,
    businessSettings,
    userPreferences,
    saveBusinessInfo,
    changePassword,
  } = useSettings();

  const [currentView, setCurrentView] = useState<SettingsSubView>('settings-list');

  if (loading) {
    return <RouteLoading message="កំពុងទាញយកទិន្នន័យការកំណត់..." />;
  }

  const handlePreferencesSave = async (currency: 'KHR' | 'USD') => {
    return await saveBusinessInfo({ primaryCurrency: currency });
  };

  return (
    <div id="settings-module" className="max-w-md mx-auto space-y-4 pb-6">
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

      {/* Screen / View Switcher (One Screen = One Purpose) */}
      {currentView === 'settings-list' && (
        <SettingsListView
          onBack={() => navigate('/account')}
          onSelectSubView={(subView) => setCurrentView(subView)}
        />
      )}

      {currentView === 'business-info' && (
        <BusinessInfoView
          onBack={() => setCurrentView('settings-list')}
          businessSettings={businessSettings}
          onSave={saveBusinessInfo}
          saving={saving}
        />
      )}

      {currentView === 'general-settings' && (
        <GeneralSettingsView
          onBack={() => setCurrentView('settings-list')}
          businessSettings={businessSettings}
          userPreferences={userPreferences}
          onSave={handlePreferencesSave}
          saving={saving}
        />
      )}

      {currentView === 'security' && (
        <SecurityView
          onBack={() => setCurrentView('settings-list')}
          onChangePassword={changePassword}
          saving={saving}
        />
      )}

      {currentView === 'about' && (
        <AboutView
          onBack={() => setCurrentView('settings-list')}
        />
      )}

      {currentView === 'help' && (
        <HelpView
          onBack={() => navigate('/account')}
        />
      )}
    </div>
  );
};
