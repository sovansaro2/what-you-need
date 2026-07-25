import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { Card, Button, Input } from '@/components/common';
import { useSettings } from '@/modules/settings/hooks/useSettings';
import { RouteLoading } from '@/components/loading';

export const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    saving,
    successMessage,
    errorMessage,
    changePassword,
  } = useSettings();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (loading) {
    return <RouteLoading message="កំពុងទាញយកទិន្នន័យ..." />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword.length < 6) {
      setLocalError('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៦ តួអក្សរ');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('ពាក្យសម្ងាត់ផ្ទៀងផ្ទាត់មិនត្រូវគ្នាទេ');
      return;
    }

    const ok = await changePassword(newPassword);
    if (ok) {
      setNewPassword('');
      setConfirmPassword('');
    }
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
            សុវត្ថិភាព (Security)
          </h1>
          <p className="text-xs text-slate-500">
            ប្តូរពាក្យសម្ងាត់ដើម្បីសុវត្ថិភាពគណនី
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

      {(errorMessage || localError) && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{localError || errorMessage}</span>
        </div>
      )}

      <Card className="p-5 space-y-5 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ប្តូរពាក្យសម្ងាត់ (Change Password)</h3>
            <p className="text-xs text-slate-500">Change Password Only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Input
                label="ពាក្យសម្ងាត់ថ្មី (New Password)"
                type={showPassword ? 'text' : 'password'}
                requiredStar
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="យ៉ាងហោចណាស់ ៦ តួអក្សរ..."
                icon={<Lock className="w-4 h-4 text-slate-400" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm New Password)"
              type={showPassword ? 'text' : 'password'}
              requiredStar
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត..."
              icon={<KeyRound className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={saving}
              variant="primary"
              size="md"
              className="w-full font-bold shadow-xs min-h-[44px]"
              icon={<KeyRound className="w-4 h-4" />}
            >
              ប្តូរពាក្យសម្ងាត់
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
