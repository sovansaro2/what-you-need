import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AboutView } from '@/modules/settings/components/AboutView';

export const About: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto space-y-4 pb-6">
      <AboutView onBack={() => navigate('/account')} />
    </div>
  );
};
