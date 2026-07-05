import React, { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    
    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label} {props.required && <span className="text-accent-primary">*</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`
              w-full bg-[rgba(20,15,45,0.4)] backdrop-blur-md border border-[rgba(139,92,246,0.2)] 
              rounded-[14px] px-4 min-h-[48px] text-white placeholder:text-text-muted/50
              transition-all duration-300 outline-none font-body text-[14px]
              focus:bg-[rgba(20,15,45,0.6)] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] focus:shadow-[0_0_24px_rgba(168,85,247,0.4)]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isPassword ? 'pr-12' : ''}
              ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_16px_rgba(248,113,113,0.3)]' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
        {!error && helperText && <p className="text-sm text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

