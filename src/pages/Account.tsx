import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Account: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'អ្នកប្រើប្រាស់';
  const displayEmail = user?.email || 'គ្មានអ៊ីមែល';
  const displayPhone = profile?.phone || user?.user_metadata?.phone || 'មិនបានផ្តល់ជូន';

  return (
    <div id="account-page" className="space-y-4">
      <div id="account-profile-card" className="p-5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
        <div id="account-avatar" className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-xl">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <h2 id="account-name" className="text-base font-bold text-slate-900">{displayName}</h2>
        <p id="account-status" className="text-xs text-indigo-600 font-medium mt-0.5 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5" /> គណនីបានផ្ទៀងផ្ទាត់
        </p>
      </div>

      <div id="account-details-card" className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-2xs">
        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" /> អ៊ីមែល
          </span>
          <span id="account-email-value" className="font-medium text-slate-800">{displayEmail}</span>
        </div>
        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400" /> លេខទូរស័ព្ទ
          </span>
          <span id="account-phone-value" className="font-medium text-slate-800">{displayPhone}</span>
        </div>
      </div>

      <button
        id="account-signout-btn"
        type="button"
        disabled={isSigningOut}
        onClick={handleSignOut}
        className="w-full p-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        {isSigningOut ? 'កំពុងចាកចេញ...' : 'ចាកចេញ'}
      </button>
    </div>
  );
};
