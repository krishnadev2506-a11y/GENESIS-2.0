'use client';

import { m} from 'framer-motion';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center font-body font-semibold uppercase tracking-[0.14em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-none';

  const sizeStyles = {
    sm: 'px-4 min-h-[44px] text-[14px]',
    md: 'px-6 min-h-[44px] text-[14px]',
    lg: 'px-8 min-h-[48px] text-[16px]',
  };

  const radius = 'rounded-full';

  const variantStyles = {
    primary: 'bg-[linear-gradient(135deg,#7C3AED_0%,#8B5CF6_55%,#C4B5FD_100%)] text-white border border-[rgba(255,255,255,0.14)] shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_42px_rgba(167,139,250,0.55)] hover:-translate-y-0.5 violet-text-glow',
    secondary: 'glass-surface text-text-primary border border-glass-border hover:border-[rgba(167,139,250,0.22)] hover:bg-[rgba(255,255,255,0.08)]',
    ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-[rgba(255,255,255,0.05)] border border-transparent',
    danger: 'bg-[rgba(248,113,113,0.1)] text-danger border border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.15)]',
  };

  const tapProps = !disabled && !isLoading ? {
    whileTap: { scale: 0.96 }
  } : {};

  const hoverProps = !disabled && !isLoading ? {
    whileHover: { scale: 1.05 }
  } : {};

  return (
    <m.button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${radius} ${className}`}
      disabled={disabled || isLoading}
      {...(tapProps as any)}
      {...(hoverProps as any)}
      {...(props as any)}
    >
      {variant === 'primary' && !disabled && !isLoading && (
        <m.div
          className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.16)] to-transparent skew-x-[-20deg]"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ 
            x: '100%', 
            opacity: 1,
            transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } 
          }}
        />
      )}

      {isLoading ? (
        <div className="flex items-center space-x-2 relative z-10">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Wait...</span>
        </div>
      ) : (
        <span className="relative z-10 whitespace-nowrap">{children}</span>
      )}
    </m.button>
  );
}
