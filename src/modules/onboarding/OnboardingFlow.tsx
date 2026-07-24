import React from 'react';
import { useOnboarding } from './hooks/useOnboarding';
import { OnboardingProgress } from './components/OnboardingProgress';
import { WelcomeStep } from './components/WelcomeStep';
import { BusinessInfoStep } from './components/BusinessInfoStep';
import { CurrencyStep } from './components/CurrencyStep';
import { CompletionStep } from './components/CompletionStep';
import { useNavigate } from 'react-router-dom';

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const {
    step,
    setStep,
    businessProfile,
    saveOnboardingData,
    completeOnboarding,
  } = useOnboarding();

  const handleWelcomeNext = () => {
    setStep('business_info');
  };

  const handleBusinessInfoNext = (updated: any) => {
    saveOnboardingData(updated);
    setStep('currency');
  };

  const handleCurrencyNext = (updated: any) => {
    saveOnboardingData(updated);
    setStep('completion');
  };

  const handleFinish = () => {
    completeOnboarding();
    navigate('/home');
  };

  return (
    <div id="onboarding-flow-container" className="max-w-lg mx-auto space-y-4 py-2">
      {/* Step Progress Bar */}
      <OnboardingProgress currentStep={step} />

      {/* Step Views */}
      {step === 'welcome' && <WelcomeStep onNext={handleWelcomeNext} />}

      {step === 'business_info' && (
        <BusinessInfoStep
          data={businessProfile}
          onNext={handleBusinessInfoNext}
          onBack={() => setStep('welcome')}
        />
      )}

      {step === 'currency' && (
        <CurrencyStep
          data={businessProfile}
          onNext={handleCurrencyNext}
          onBack={() => setStep('business_info')}
        />
      )}

      {step === 'completion' && (
        <CompletionStep data={businessProfile} onFinish={handleFinish} />
      )}
    </div>
  );
};
