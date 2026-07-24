import React from 'react';
import { Bell } from 'lucide-react';

export const TopAppBar: React.FC = () => {
  return (
    <header id="top-app-bar" className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
      <h1 id="app-title" className="text-xl font-bold text-slate-900 tracking-tight font-bokor">
        What You Need?
      </h1>
      <button
        id="notification-button"
        type="button"
        aria-label="Notifications"
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
      >
        <Bell className="w-5 h-5" />
      </button>
    </header>
  );
};
