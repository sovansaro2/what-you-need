import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, MessageSquare, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { label: 'ទំព័រដើម', path: '/home', icon: Home, id: 'nav-home' },
    { label: 'មុខងារ', path: '/features', icon: Grid, id: 'nav-features' },
    { label: 'សន្ទនា', path: '/chat', icon: MessageSquare, id: 'nav-chat' },
    { label: 'គណនី', path: '/account', icon: User, id: 'nav-account' },
  ];

  return (
    <nav id="bottom-navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              id={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-indigo-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
