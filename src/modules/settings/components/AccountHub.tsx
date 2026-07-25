import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Store,
  Palette,
  Coins,
  ShieldCheck,
  BookOpen,
  Headset,
  Info,
  Code,
  LogOut,
  Phone,
  MapPin,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Badge, Card } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { BusinessSettings } from '../types';

interface AccountHubProps {
  businessSettings: BusinessSettings;
  onNavigate?: (view: 'settings-list' | 'help' | 'about') => void;
}

export const AccountHub: React.FC<AccountHubProps> = ({
  businessSettings,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'អ្នកប្រើប្រាស់';
  const phone = profile?.phone || businessSettings?.phone || user?.user_metadata?.phone || 'មិនបានបញ្ចូល';
  const address = businessSettings?.address || user?.user_metadata?.address || 'មិនបានបញ្ចូល';
  const businessName = businessSettings?.businessName || user?.user_metadata?.business_name || 'ហាងអាជីវកម្ម';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const initialLetter = (displayName || 'U').charAt(0).toUpperCase();

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

  const handleSettingsClick = () => {
    if (onNavigate) {
      onNavigate('settings-list');
    } else {
      navigate('/settings');
    }
  };

  const handleHelpClick = () => {
    if (onNavigate) {
      onNavigate('help');
    } else {
      navigate('/help');
    }
  };

  const handleAboutClick = () => {
    if (onNavigate) {
      onNavigate('about');
    } else {
      navigate('/about');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* 1. HERO PROFILE SECTION (IDENTITY DISPLAY ONLY) */}
      <Card className="p-5 border-slate-200/80 shadow-2xs">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          {/* Centered Profile Avatar (112px) */}
          <div className="w-28 h-28 rounded-full border-4 border-indigo-50 shadow-md overflow-hidden bg-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span>{initialLetter}</span>
            )}
          </div>

          {/* User Name & Blue Verified Badge (Inline, Centered) */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {displayName}
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

          {/* Business Name with Store Icon */}
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600">
            <Building2 className="w-4 h-4 shrink-0 text-indigo-600" />
            <span className="truncate max-w-xs">{businessName}</span>
          </div>

          {/* Address & Phone in One Horizontal Row */}
          <div className="w-full pt-1 flex items-center justify-center gap-3 text-xs font-medium text-slate-500 divide-x divide-slate-200">
            <div className="flex items-center gap-1.5 min-w-0 max-w-[60%] truncate justify-end">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{address}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-3">
              <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="whitespace-nowrap">{phone}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. GROUPED ACCOUNT MENU SECTIONS */}

      {/* SECTION 1: ប្រវត្តិរូប */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          ប្រវត្តិរូប
        </h3>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  មើលប្រវត្តិរូប និងកែប្រែ
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  មើល និងកែប្រែព័ត៌មានផ្ទាល់ខ្លួន
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* SECTION 2: ការកំណត់ */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          ការកំណត់
        </h3>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
          {/* ព័ត៌មានអាជីវកម្ម */}
          <button
            type="button"
            onClick={() => navigate('/settings/business')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  ព័ត៌មានអាជីវកម្ម
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  កែប្រែព័ត៌មានហាង
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>

          {/* ស្តាយកម្មវិធី / General Settings */}
          <button
            type="button"
            onClick={() => navigate('/settings/general')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                <Palette className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  ការកំណត់ទូទៅ
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  ភាសា និងរចនាប័ទ្ម
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>

          {/* រូបិយវត្ថុ / Currency */}
          <button
            type="button"
            onClick={() => navigate('/settings/currency')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                <Coins className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  រូបិយវត្ថុ
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  រូបិយវត្ថុលំនាំដើម
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>

          {/* សុវត្ថិភាព / Security */}
          <button
            type="button"
            onClick={() => navigate('/settings/security')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  សុវត្ថិភាព
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  ពាក្យសម្ងាត់ និងសុវត្ថិភាព
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* SECTION 3: ជំនួយ */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          ជំនួយ
        </h3>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
          {/* ការណែនាំអំពីការប្រើប្រាស់ / User Guide */}
          <button
            type="button"
            onClick={() => navigate('/help')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  ការណែនាំអំពីការប្រើប្រាស់
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  សិក្សារបៀបប្រើប្រាស់ប្រព័ន្ធ
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>

          {/* ទំនាក់ទំនងអ្នកគ្រប់គ្រង / Contact Administrator */}
          <button
            type="button"
            onClick={() => navigate('/support')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                <Headset className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  ទំនាក់ទំនងអ្នកគ្រប់គ្រង
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  ស្នើសុំជំនួយ ឬរាយការណ៍បញ្ហា
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* SECTION 4: អំពីកម្មវិធី */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          អំពីកម្មវិធី
        </h3>
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
          {/* កំណែកម្មវិធី / Version */}
          <button
            type="button"
            onClick={() => navigate('/about/version')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                <Info className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  កំណែកម្មវិធី
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  Version 1.0.0
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>

          {/* អ្នកអភិវឌ្ឍន៍ / Developer Info */}
          <button
            type="button"
            onClick={() => navigate('/about/developer')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors min-h-[56px] text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                <Code className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  អ្នកអភិវឌ្ឍន៍
                </p>
                <p className="text-xs text-slate-500 leading-normal truncate">
                  Developer Information
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* SECTION 5: STANDALONE LOGOUT SECTION */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-between p-4 bg-rose-50/60 hover:bg-rose-50 border border-rose-100 rounded-2xl transition-colors min-h-[56px] text-left cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-rose-700 leading-snug">
                {isSigningOut ? 'កំពុងចាកចេញ...' : 'ចាកចេញពីគណនី'}
              </p>
              <p className="text-xs text-rose-500/90 leading-normal truncate">
                ចាកចេញពីប្រព័ន្ធដោយសុវត្ថិភាព
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-300 group-hover:text-rose-500 transition-colors shrink-0" />
        </button>
      </div>
    </div>
  );
};
