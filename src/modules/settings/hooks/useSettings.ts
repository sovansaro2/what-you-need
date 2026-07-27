import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  settingsRepository,
  settingsEvents,
} from '../foundation';
import { authService } from '@/services/authService';
import { BusinessSettings, UserPreferences } from '../types';
import { formatUserErrorMessage } from '@/core/errors';

interface UseSettingsOptions {
  fetchPreferences?: boolean;
}

export const useSettings = (options?: UseSettingsOptions) => {
  const fetchPreferences = options?.fetchPreferences ?? true;
  const { user, profile, signOut } = useAuth();
  const userId = user?.id || 'guest';
  const businessId = profile?.business_id || userId;

  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    userId,
    businessId,
    businessName: profile?.full_name || user?.user_metadata?.business_name || '',
    logoUrl: user?.user_metadata?.avatar_url || '',
    phone: profile?.phone || user?.user_metadata?.phone || '',
    email: user?.email || '',
    address: user?.user_metadata?.address || '',
    primaryCurrency: 'KHR',
    timezone: 'Asia/Phnom_Penh',
    language: 'km',
    receiptPrefix: 'INV-',
    taxRate: 0,
    decimalPrecision: 2,
    lowStockThreshold: 5,
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
    if (!userId || userId === 'guest') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      if (fetchPreferences) {
        const [bs, up] = await Promise.all([
          settingsRepository.getBusinessSettings(userId, businessId),
          settingsRepository.getUserPreferences(userId),
        ]);

        if (!bs.businessName && (profile?.full_name || user?.user_metadata?.business_name)) {
          bs.businessName = profile?.full_name || user?.user_metadata?.business_name || '';
        }
        if (!bs.email && user?.email) {
          bs.email = user.email;
        }

        setBusinessSettings(bs);
        setUserPreferences(up);
      } else {
        const bs = await settingsRepository.getBusinessSettings(userId, businessId);
        if (!bs.businessName && (profile?.full_name || user?.user_metadata?.business_name)) {
          bs.businessName = profile?.full_name || user?.user_metadata?.business_name || '';
        }
        if (!bs.email && user?.email) {
          bs.email = user.email;
        }
        setBusinessSettings(bs);
      }
    } catch (err: any) {
      console.warn('Failed to load settings:', err);
      setErrorMessage(formatUserErrorMessage(err, 'មិនអាចទាញយកការកំណត់បានទេ'));
    } finally {
      setLoading(false);
    }
  }, [userId, businessId, profile, user, fetchPreferences]);

  useEffect(() => {
    loadSettings();

    // Event bus auto-refresh subscription
    const unsubscribe = settingsEvents.subscribeToSettingsChanges(() => {
      loadSettings();
    });

    return () => {
      unsubscribe();
    };
  }, [loadSettings]);

  const saveBusinessInfo = async (payload: Partial<BusinessSettings>): Promise<boolean> => {
    clearMessages();
    setSaving(true);
    try {
      const updated = await settingsRepository.updateBusinessSettings(
        userId,
        payload,
        businessId
      );
      setBusinessSettings(updated);
      setSuccessMessage('បានរក្សាទុកព័ត៌មានអាជីវកម្មដោយជោគជ័យ');
      return true;
    } catch (err: any) {
      console.error('Error saving business settings:', err);
      setErrorMessage(formatUserErrorMessage(err, 'រក្សាទុកមិនបានជោគជ័យ សូមព្យាយាមម្តងទៀត'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (payload: Partial<UserPreferences>): Promise<boolean> => {
    clearMessages();
    setSaving(true);
    try {
      const updated = await settingsRepository.updateUserPreferences(userId, payload);
      setUserPreferences(updated);
      setSuccessMessage('បានរក្សាទុកការកំណត់ដោយជោគជ័យ');
      return true;
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setErrorMessage(formatUserErrorMessage(err, 'រក្សាទុកមិនបានជោគជ័យ'));
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
