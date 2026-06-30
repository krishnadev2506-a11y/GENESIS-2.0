import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'pending' | 'danger' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-success/10 text-success border-success/20',
    pending: 'bg-pending/10 text-pending border-pending/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    default: 'bg-accent-primary/10 text-accent-secondary border-accent-primary/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] uppercase font-bold tracking-[0.12em] border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
