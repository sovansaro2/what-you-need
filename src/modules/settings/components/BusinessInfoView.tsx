import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { BusinessInfoForm } from './BusinessInfoForm';
import { BusinessSettings } from '../types';

interface BusinessInfoViewProps {
  onBack: () => void;
  businessSettings: BusinessSettings;
  onSave: (data: Partial<BusinessSettings>) => Promise<boolean>;
  saving: boolean;
}

export const BusinessInfoView: React.FC<BusinessInfoViewProps> = ({
  onBack,
  businessSettings,
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
            ព័ត៌មានអាជីវកម្ម
          </h1>
          <p className="text-xs text-slate-500">
            គ្រប់គ្រងឈ្មោះ រូបសញ្ញា និងព័ត៌មានទំនាក់ទំនងហាង
          </p>
        </div>
      </div>

      <BusinessInfoForm
        initialData={businessSettings}
        onSave={onSave}
        saving={saving}
      />
    </div>
  );
};
