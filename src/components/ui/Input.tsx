import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    
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
            className={`
              w-full bg-[rgba(20,15,45,0.4)] backdrop-blur-md border border-[rgba(139,92,246,0.2)] 
              rounded-[14px] px-4 min-h-[48px] text-white placeholder:text-text-muted/50
              transition-all duration-300 outline-none font-body text-[14px]
              focus:bg-[rgba(20,15,45,0.6)] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] focus:shadow-[0_0_24px_rgba(168,85,247,0.4)]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_16px_rgba(248,113,113,0.3)]' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
        {!error && helperText && <p className="text-sm text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

