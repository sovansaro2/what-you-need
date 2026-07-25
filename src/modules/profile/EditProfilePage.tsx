import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Store, Mail, Phone, MapPin, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/modules/settings/hooks/useSettings';
import { authService } from '@/services/authService';
import { AvatarUploader } from './components/AvatarUploader';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { businessSettings, saveBusinessInfo, reloadSettings } = useSettings();

  const userId = user?.id || 'guest';

  const [userName, setUserName] = useState(
    profile?.full_name || user?.user_metadata?.full_name || ''
  );
  const [businessName, setBusinessName] = useState(
    businessSettings?.businessName || user?.user_metadata?.business_name || ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(
    profile?.phone || businessSettings?.phone || user?.user_metadata?.phone || ''
  );
  const [address, setAddress] = useState(
    businessSettings?.address || user?.user_metadata?.address || ''
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url || user?.user_metadata?.avatar_url || null
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setUserName(profile.full_name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.avatar_url !== undefined) setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  useEffect(() => {
    if (businessSettings) {
      if (businessSettings.businessName) setBusinessName(businessSettings.businessName);
      if (businessSettings.address) setAddress(businessSettings.address);
    }
  }, [businessSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់');
      return;
    }

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // 1. Update user profile and auth metadata
      const updateRes = await authService.updateUserProfile(userId, {
        full_name: userName.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl,
        business_name: businessName.trim() || null,
        address: address.trim() || null,
      });

      if (!updateRes.success || updateRes.rowsUpdated === 0) {
        const errText = updateRes.errorMessage || 'មិនអាចធ្វើបច្ចុប្បន្នភាពទិន្នន័យបានទេ (Zero rows updated)';
        console.error('[PROFILE DEBUG] Update submission failed:', errText);
        setErrorMsg(errText);
        setSaving(false);
        return;
      }

      // 2. Sync business settings
      await saveBusinessInfo({
        businessName: businessName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });

      // 3. Refresh context hooks
      console.log('[PROFILE DEBUG] Refreshing profile hook/context after save...');
      await refreshProfile();
      await reloadSettings();

      setSuccessMsg('បានរក្សាទុកប្រវត្តិរូបដោយជោគជ័យ');

      // Navigate back to profile after short delay
      setTimeout(() => {
        navigate('/profile');
      }, 800);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg('មិនអាចរក្សាទុកបានទេ សូមព្យាយាមម្តងទៀត');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in pb-8">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="ត្រឡប់ទៅប្រវត្តិរូប"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            កែប្រែប្រវត្តិរូប (Edit Profile)
          </h1>
          <p className="text-xs text-slate-500 leading-normal">
            ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួន និងរូបភាព
          </p>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-2xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl flex items-center gap-2 animate-fade-in shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card className="p-5 space-y-5 border-slate-200/80 shadow-2xs">
        {/* Avatar Photo Section */}
        <AvatarUploader
          userId={userId}
          currentAvatarUrl={avatarUrl}
          userName={userName}
          onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
          disabled={saving}
        />

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* User Name */}
          <Input
            label="ឈ្មោះអ្នកប្រើប្រាស់ (User Name)"
            requiredStar
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="បញ្ចូលឈ្មោះរបស់អ្នក..."
            icon={<User className="w-4 h-4" />}
          />

          {/* Business Name */}
          <Input
            label="ឈ្មោះអាជីវកម្ម (Business Name)"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="បញ្ចូលឈ្មោះអាជីវកម្ម..."
            icon={<Store className="w-4 h-4" />}
          />

          {/* Email (Read only for safety) */}
          <Input
            label="អ៊ីមែល (Email)"
            type="email"
            value={email}
            disabled
            readOnly
            className="bg-slate-100/70 text-slate-500 cursor-not-allowed"
            icon={<Mail className="w-4 h-4" />}
          />

          {/* Phone Number */}
          <Input
            label="លេខទូរស័ព្ទ (Phone Number)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="012 345 678"
            icon={<Phone className="w-4 h-4" />}
          />

          {/* Address */}
          <Input
            label="អាសយដ្ឋាន (Address)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="បញ្ចូលអាសយដ្ឋាន..."
            icon={<MapPin className="w-4 h-4" />}
          />

          {/* Save Action Button */}
          <div className="pt-2">
            <Button
              type="submit"
              loading={saving}
              disabled={!userName.trim()}
              variant="primary"
              size="md"
              className="w-full font-bold shadow-xs min-h-[48px] text-sm"
              icon={<Save className="w-4 h-4" />}
            >
              រក្សាទុក (Save Changes)
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
