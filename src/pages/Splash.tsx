import React from 'react';
import { Link } from 'react-router-dom';

export const Splash: React.FC = () => {
  return (
    <div id="splash-page" className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div id="splash-logo-container" className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
          <span className="text-3xl font-extrabold text-white">W</span>
        </div>
        <h1 id="splash-title" className="text-3xl font-bold tracking-tight mb-2">
          What You Need?
        </h1>
        <p id="splash-subtitle" className="text-slate-400 text-sm max-w-xs">
          Smart inventory, sales, income & expense management platform.
        </p>
      </div>

      <div id="splash-actions" className="space-y-3 w-full max-w-xs mx-auto pb-6">
        <Link
          id="splash-login-btn"
          to="/login"
          className="block w-full text-center py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-md text-sm"
        >
          Sign In
        </Link>
        <Link
          id="splash-register-btn"
          to="/register"
          className="block w-full text-center py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700 text-sm"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};
