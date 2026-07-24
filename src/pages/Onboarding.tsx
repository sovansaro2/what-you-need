import React from 'react';
import { OnboardingFlow } from '@/modules/onboarding/OnboardingFlow';

export const Onboarding: React.FC = () => {
  return (
    <div id="onboarding-page" className="min-h-full">
      <OnboardingFlow />
    </div>
  );
};
