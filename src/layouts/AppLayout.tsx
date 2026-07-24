import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopAppBar } from '@/components/layout/TopAppBar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export const AppLayout: React.FC = () => {
  return (
    <div id="app-container" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopAppBar />
      <main id="main-content-area" className="flex-1 max-w-md w-full mx-auto p-4 pb-20">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};
