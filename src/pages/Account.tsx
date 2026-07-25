import React from 'react';
import { AccountHub } from '@/modules/settings/components/AccountHub';
import { useSettings } from '@/modules/settings/hooks/useSettings';
import { RouteLoading } from '@/components/loading';

export const Account: React.FC = () => {
  const { businessSettings, loading } = useSettings();

  if (loading) {
    return <RouteLoading message="កំពុងទាញយកទិន្នន័យ..." />;
  }

  return (
    <div id="account-page" className="max-w-md mx-auto space-y-4 pb-6">
      <AccountHub businessSettings={businessSettings} />
    </div>
  );
};
