import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div id="not-found-page" className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 id="not-found-code" className="text-5xl font-black text-slate-300 mb-2">404</h1>
      <h2 id="not-found-title" className="text-lg font-bold text-slate-800 mb-1">Page Not Found</h2>
      <p id="not-found-message" className="text-xs text-slate-500 mb-6 max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        id="not-found-home-btn"
        to="/home"
        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-colors shadow-xs"
      >
        Return to Home
      </Link>
    </div>
  );
};
