import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { settingsRepository, settingsEvents } from '@/modules/settings/foundation';
import { BusinessProfile, OnboardingStep } from '../types';

export const useOnboarding = () => {
  const { user, profile } = useAuth();
  const userId = user?.id || 'guest';
  const businessId = profile?.business_id || userId;

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessName: '',
    businessType: 'ហាងលក់ចាប់ហួយ',
    ownerName: profile?.full_name || '',
    phone: '',
    address: '',
    primaryCurrency: 'KHR',
  });

  const loadProfile = useCallback(async () => {
    if (!userId || userId === 'guest') return;
    try {
      const bs = await settingsRepository.getBusinessSettings(userId, businessId);
      if (bs.businessName || bs.phone || bs.address) {
        setBusinessProfile({
          businessName: bs.businessName,
          businessType: 'ហាងលក់ចាប់ហួយ',
          ownerName: profile?.full_name || '',
          phone: bs.phone || '',
          address: bs.address || '',
          primaryCurrency: bs.primaryCurrency || 'KHR',
        });
        if (bs.businessName) {
          setIsCompleted(true);
        }
      }
    } catch (err) {
      console.warn('Failed to load onboarding business settings:', err);
    }
  }, [userId, businessId, profile]);

  useEffect(() => {
    loadProfile();

    const unsubscribe = settingsEvents.subscribeToSettingsChanges(() => {
      loadProfile();
    });

    return () => {
      unsubscribe();
    };
  }, [loadProfile]);

  const saveOnboardingData = async (updatedProfile: Partial<BusinessProfile>, completed = false) => {
    const newProfile = { ...businessProfile, ...updatedProfile };
    setBusinessProfile(newProfile);
    if (completed) {
      setIsCompleted(true);
    }

    if (userId && userId !== 'guest') {
      try {
        await settingsRepository.updateBusinessSettings(
          userId,
          {
            businessName: newProfile.businessName,
            phone: newProfile.phone,
            address: newProfile.address,
            primaryCurrency: newProfile.primaryCurrency as 'KHR' | 'USD',
          },
          businessId
        );
      } catch (err) {
        console.warn('Failed to persist onboarding data to DB:', err);
      }
    }
  };

  const completeOnboarding = () => {
    saveOnboardingData({}, true);
  };

  const resetOnboarding = () => {
    setIsCompleted(false);
    setStep('welcome');
  };

  return {
    step,
    setStep,
    isCompleted,
    businessProfile,
    saveOnboardingData,
    completeOnboarding,
    resetOnboarding,
  };
};
