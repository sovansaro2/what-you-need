import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, ShieldCheck, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { Button, Card, Badge } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/modules/settings/hooks/useSettings';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { businessSettings } = useSettings();

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'អ្នកប្រើប្រាស់';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const businessName = businessSettings?.businessName || user?.user_metadata?.business_name || 'ហាងអាជីវកម្ម';
  const email = user?.email || 'គ្មានអ៊ីមែល';
  const phone = profile?.phone || businessSettings?.phone || user?.user_metadata?.phone || 'មិនបានបញ្ចូល';
  const address = businessSettings?.address || user?.user_metadata?.address || 'មិនបានបញ្ចូល';

  const initialLetter = (userName || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in pb-8">
      {/* Top Navigation Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/account')}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="ត្រឡប់ទៅគណនី"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            ប្រវត្តិរូបអ្នកប្រើប្រាស់ (User Profile)
          </h1>
          <p className="text-xs text-slate-500 leading-normal">
            ព័ត៌មានផ្ទាល់ខ្លួន និងព័ត៌មានគណនី
          </p>
        </div>
      </div>

      {/* Hero Profile Container */}
      <Card className="p-5 space-y-5 border-slate-200/80 shadow-2xs">
        {/* Top: Circular Avatar Centered (112px x 112px) */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-28 h-28 rounded-full border-4 border-indigo-50 shadow-md overflow-hidden bg-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span>{initialLetter}</span>
            )}
          </div>

          {/* Below: User Name Centered & Verified Icon Inline */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {userName}
            </h2>
            <div
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shrink-0 shadow-2xs"
              title="ផ្ទៀងផ្ទាត់រួច"
              aria-label="Verified"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Below: Building Icon & Business Name Centered */}
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600">
            <Building2 className="w-4 h-4 shrink-0 text-indigo-600" />
            <span className="truncate max-w-xs">{businessName}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Below: Email, Phone, Address Clean Vertical Stack */}
        <div className="space-y-3.5 text-left">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            ព័ត៌មានទំនាក់ទំនង (Contact Information)
          </h3>

          {/* Email Row */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-400">អ៊ីមែល (Email)</p>
              <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{email}</p>
            </div>
          </div>

          {/* Phone Row */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-400">លេខទូរស័ព្ទ (Phone Number)</p>
              <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{phone}</p>
            </div>
          </div>

          {/* Address Row */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-400">អាសយដ្ឋាន (Address)</p>
              <p className="text-sm font-bold text-slate-800 leading-snug mt-0.5">{address}</p>
            </div>
          </div>
        </div>

        {/* Bottom: Edit Profile Action Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => navigate('/profile/edit')}
            className="w-full font-bold shadow-xs min-h-[48px] text-sm"
            icon={<Edit3 className="w-4 h-4" />}
          >
            កែប្រែប្រវត្តិរូប
          </Button>
        </div>
      </Card>
    </div>
  );
};
