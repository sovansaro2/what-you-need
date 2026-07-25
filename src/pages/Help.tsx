import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpView } from '@/modules/settings/components/HelpView';

export const Help: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto space-y-4 pb-6">
      <HelpView onBack={() => navigate('/account')} />
    </div>
  );
};
