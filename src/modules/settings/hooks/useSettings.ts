import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { settingsService } from '@/services/settingsService';
import { authService } from '@/services/authService';
import { BusinessSettings, UserPreferences } from '../types';

interface UseSettingsOptions {
  fetchPreferences?: boolean;
}

export const useSettings = (options?: UseSettingsOptions) => {
  const fetchPreferences = options?.fetchPreferences ?? true;
  const { user, profile, signOut } = useAuth();
  const userId = user?.id || 'guest';

  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronously compute initial business settings from local cache or auth context
  const initialBusinessSettings = useMemo<BusinessSettings>(() => {
    const defaults: BusinessSettings = {
      userId,
      businessName: user?.user_metadata?.business_name || '',
      logoUrl: user?.user_metadata?.avatar_url || '',
      phone: profile?.phone || user?.user_metadata?.phone || '',
      email: user?.email || '',
      address: user?.user_metadata?.address || '',
      primaryCurrency: 'KHR',
      language: 'km',
    };

    if (!userId) return defaults;

    try {
      const local = localStorage.getItem(`wyn_business_settings_${userId}`);
      if (local) {
        const parsed = JSON.parse(local);
        return {
          ...defaults,
          ...parsed,
          businessName: parsed.businessName || defaults.businessName,
          phone: parsed.phone || defaults.phone,
          address: parsed.address || defaults.address,
          email: parsed.email || defaults.email,
        };
      }
    } catch {
      // Ignore local storage error
    }

    return defaults;
  }, [userId, user, profile]);

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(initialBusinessSettings);

  // Keep state updated with context/cache changes
  useEffect(() => {
    setBusinessSettings((prev) => ({
      ...initialBusinessSettings,
      ...prev,
      businessName: prev.businessName || initialBusinessSettings.businessName,
      phone: prev.phone || initialBusinessSettings.phone,
      address: prev.address || initialBusinessSettings.address,
      email: prev.email || initialBusinessSettings.email,
    }));
  }, [initialBusinessSettings]);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    userId,
    theme: 'light',
    lowStockAlert: true,
    salesNotifications: true,
    reportNotifications: true,
  });

  const hasInitialData = Boolean(
    initialBusinessSettings.businessName ||
      initialBusinessSettings.phone ||
      profile?.full_name ||
      user?.email
  );

  const [loading, setLoading] = useState<boolean>(!hasInitialData);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  const loadSettings = useCallback(async () => {
    if (!userId) return;
    try {
      if (fetchPreferences) {
        const [bs, up] = await Promise.all([
          settingsService.getBusinessSettings(userId),
          settingsService.getUserPreferences(userId),
        ]);

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
      } else {
        // Load ONLY business settings required for Account page (skips userPreferences query)
        const bs = await settingsService.getBusinessSettings(userId);

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
      }
    } catch (err: any) {
      console.warn('Failed to load settings:', err);
      setErrorMessage('មិនអាចទាញយកការកំណត់បានទេ');
    } finally {
      setLoading(false);
    }
  }, [userId, user, profile, fetchPreferences]);

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
