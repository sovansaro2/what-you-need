import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BusinessProfile, OnboardingStep } from '../types';

const STORAGE_KEY_PREFIX = 'wyn_onboarding_';

export const useOnboarding = () => {
  const { user, profile } = useAuth();
  const storageKey = `${STORAGE_KEY_PREFIX}${user?.id || 'guest'}`;

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setBusinessProfile(parsed.profile);
        if (parsed.isCompleted !== undefined) setIsCompleted(parsed.isCompleted);
      }
    } catch (e) {
      console.error('Failed to load onboarding state:', e);
    }
  }, [storageKey]);

  const saveOnboardingData = (updatedProfile: Partial<BusinessProfile>, completed = false) => {
    const newProfile = { ...businessProfile, ...updatedProfile };
    setBusinessProfile(newProfile);
    if (completed) {
      setIsCompleted(true);
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          profile: newProfile,
          isCompleted: completed || isCompleted,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.error('Failed to save onboarding state:', e);
    }
  };

  const completeOnboarding = () => {
    saveOnboardingData({}, true);
  };

  const resetOnboarding = () => {
    setIsCompleted(false);
    setStep('welcome');
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Failed to reset onboarding:', e);
    }
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
