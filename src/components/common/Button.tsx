import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'py-2 px-3 text-xs min-h-[40px]',
    md: 'py-2.5 px-4 text-sm min-h-[44px]',
    lg: 'py-3 px-5 text-base min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
      ) : icon ? (
        <span className="mr-2 flex items-center">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
