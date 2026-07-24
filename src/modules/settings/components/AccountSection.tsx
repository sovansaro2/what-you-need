import React, { useState } from 'react';
import { User, KeyRound, LogOut, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Button, Card, Badge } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { ChangePasswordModal } from './ChangePasswordModal';

interface AccountSectionProps {
  onChangePassword: (newPassword: string) => Promise<boolean>;
  saving: boolean;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  onChangePassword,
  saving,
}) => {
  const { user, profile, signOut } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'អ្នកប្រើប្រាស់';
  const displayEmail = user?.email || 'គ្មានអ៊ីមែល';
  const displayPhone = profile?.phone || user?.user_metadata?.phone || 'មិនបានផ្តល់ជូន';

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
    <Card className="p-5 space-y-4 border-slate-200/80">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">គណនី និងសុវត្ថិភាព</h3>
          <p className="text-xs text-slate-500">គ្រប់គ្រងគណនី ពាក្យសម្ងាត់ និងការចាកចេញ</p>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white font-bold text-lg rounded-2xl flex items-center justify-center shadow-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{displayName}</h4>
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                <ShieldCheck className="w-3 h-3 mr-0.5" />
                សកម្ម
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">គណនីប្រើប្រាស់ប្រព័ន្ធ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="truncate">{displayEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>{displayPhone}</span>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPasswordModalOpen(true)}
          className="w-full justify-start font-bold text-slate-700 min-h-[44px]"
          icon={<KeyRound className="w-4 h-4 text-indigo-600" />}
        >
          ប្តូរពាក្យសម្ងាត់
        </Button>

        <Button
          type="button"
          variant="danger"
          loading={isSigningOut}
          onClick={handleSignOut}
          className="w-full justify-start font-bold min-h-[44px]"
          icon={<LogOut className="w-4 h-4" />}
        >
          {isSigningOut ? 'កំពុងចាកចេញ...' : 'ចាកចេញពីគណនី'}
        </Button>
      </div>

      {/* Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={onChangePassword}
        saving={saving}
      />
    </Card>
  );
};
