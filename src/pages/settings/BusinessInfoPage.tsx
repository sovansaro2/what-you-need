import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '@/modules/settings/hooks/useSettings';
import { BusinessInfoForm } from '@/modules/settings/components/BusinessInfoForm';
import { RouteLoading } from '@/components/loading';

export const BusinessInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    successMessage,
    errorMessage,
    businessSettings,
    saveBusinessInfo,
  } = useSettings();

  if (loading) {
    return <RouteLoading message="កំពុងទាញយកទិន្នន័យ..." />;
  }

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
            ព័ត៌មានអាជីវកម្ម
          </h1>
          <p className="text-xs text-slate-500">
            គ្រប់គ្រងឈ្មោះ ឡូហ្គោ និងព័ត៌មានទំនាក់ទំនងហាង
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

      {/* Business Info Form (Logo, Name, Phone, Email, Address) */}
      <BusinessInfoForm
        initialData={businessSettings}
        onSave={saveBusinessInfo}
        saving={saving}
      />
    </div>
  );
};
