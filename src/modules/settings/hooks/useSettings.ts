import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';
import { authService } from '@/services/authService';
import { BusinessSettings, UserPreferences } from '../types';

export const useSettings = () => {
  const { user, profile, signOut } = useAuth();
  const userId = user?.id || 'guest';

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    userId,
    businessName: '',
    logoUrl: '',
    phone: profile?.phone || '',
    email: user?.email || '',
    address: '',
    primaryCurrency: 'KHR',
    language: 'km',
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    userId,
    theme: 'light',
    lowStockAlert: true,
    salesNotifications: true,
    reportNotifications: true,
  });

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const loadSettings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [bs, up] = await Promise.all([
        settingsService.getBusinessSettings(userId),
        settingsService.getUserPreferences(userId),
      ]);

      // If fields are empty, try pulling from profile or user metadata
      if (!bs.businessName && user?.user_metadata?.business_name) {
        bs.businessName = user.user_metadata.business_name;
      }
      if (!bs.address && user?.user_metadata?.address) {
        bs.address = user.user_metadata.address;
      }
      if (!bs.phone && (profile?.phone || user?.user_metadata?.phone)) {
        bs.phone = profile?.phone || user?.user_metadata?.phone || '';
      }
      if (!bs.email && user?.email) {
        bs.email = user.email;
      }

      setBusinessSettings(bs);
      setUserPreferences(up);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setErrorMessage('មិនអាចទាញយកការកំណត់បានទេ');
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveBusinessInfo = async (payload: Partial<BusinessSettings>) => {
    clearMessages();
    setSaving(true);
    try {
      const updated = await settingsService.updateBusinessSettings(userId, payload);
      setBusinessSettings(updated);
      setSuccessMessage('បានរក្សាទុកព័ត៌មានអាជីវកម្មដោយជោគជ័យ');
      return true;
    } catch (err: any) {
      console.error('Error saving business settings:', err);
      setErrorMessage('រក្សាទុកមិនបានជោគជ័យ សូមព្យាយាមម្តងទៀត');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (payload: Partial<UserPreferences>) => {
    clearMessages();
    setSaving(true);
    try {
      const updated = await settingsService.updateUserPreferences(userId, payload);
      setUserPreferences(updated);
      setSuccessMessage('បានរក្សាទុកការកំណត់ដោយជោគជ័យ');
      return true;
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setErrorMessage('រក្សាទុកមិនបានជោគជ័យ');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    clearMessages();
    setSaving(true);
    try {
      await authService.updatePassword(newPassword);
      setSuccessMessage('បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ');
      return true;
    } catch (err: any) {
      const formatted = authService.formatAuthError(err);
      setErrorMessage(formatted);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    successMessage,
    errorMessage,
    businessSettings,
    userPreferences,
    saveBusinessInfo,
    savePreferences,
    changePassword,
    signOut,
    clearMessages,
    reloadSettings: loadSettings,
  };
};
