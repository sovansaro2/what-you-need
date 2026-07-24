export interface BusinessProfile {
  businessName: string;
  businessType: string;
  ownerName: string;
  phone: string;
  address: string;
  primaryCurrency: 'KHR' | 'USD';
}

export type OnboardingStep = 'welcome' | 'business_info' | 'currency' | 'completion';

export interface SetupChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  actionRoute: string;
  actionText: string;
}
