import React from 'react';
import { AccountHub } from '@/modules/settings/components/AccountHub';
import { useSettings } from '@/modules/settings/hooks/useSettings';

export const Account: React.FC = () => {
  const { businessSettings, loading } = useSettings({ fetchPreferences: false });

  return (
    <div id="account-page" className="max-w-md mx-auto space-y-4 pb-6">
      <AccountHub businessSettings={businessSettings} isLoading={loading} />
    </div>
  );
};

