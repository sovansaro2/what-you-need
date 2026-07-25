import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, KeyRound, LogOut, Mail, Lock } from 'lucide-react';
import { Button, Card, Badge } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordModal } from './ChangePasswordModal';

interface SecurityViewProps {
  onBack: () => void;
  onChangePassword: (newPassword: string) => Promise<boolean>;
  saving: boolean;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  onBack,
  onChangePassword,
  saving,
}) => {
  const { user, profile, signOut } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'អ្នកប្រើប្រាស់';
  const displayEmail = user?.email || 'គ្មានអ៊ីមែល';

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

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
            សុវត្ថិភាព
          </h1>
          <p className="text-xs text-slate-500">
            គ្រប់គ្រងពាក្យសម្ងាត់ និងការចូលប្រើប្រាស់គណនី
          </p>
        </div>
      </div>

      <Card className="p-5 space-y-4 border-slate-200/80">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">សុវត្ថិភាពគណនី</h3>
            <p className="text-xs text-slate-500">ការពារគណនីរបស់អ្នកជាមួយពាក្យសម្ងាត់រឹងមាំ</p>
          </div>
        </div>

        {/* User Identity Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{displayName}</span>
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                <ShieldCheck className="w-3 h-3 mr-0.5" />
                សកម្ម
              </Badge>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {displayEmail}
            </p>
          </div>
        </div>

        {/* Security Actions */}
        <div className="space-y-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full justify-start font-bold text-slate-800 min-h-[48px]"
            icon={<KeyRound className="w-4 h-4 text-indigo-600" />}
          >
            ប្តូរពាក្យសម្ងាត់ (Change Password)
          </Button>

          <Button
            type="button"
            variant="danger"
            loading={isSigningOut}
            onClick={handleSignOut}
            className="w-full justify-start font-bold min-h-[48px]"
            icon={<LogOut className="w-4 h-4" />}
          >
            {isSigningOut ? 'កំពុងចាកចេញ...' : 'ចាកចេញពីគណនី (Sign Out)'}
          </Button>
        </div>
      </Card>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={onChangePassword}
        saving={saving}
      />
    </div>
  );
};
