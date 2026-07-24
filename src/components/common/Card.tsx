import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all',
    bordered: 'bg-white border border-slate-200 rounded-2xl p-4',
    flat: 'bg-slate-50 rounded-2xl p-4',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
