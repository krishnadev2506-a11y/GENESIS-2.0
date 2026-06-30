'use client';

import { m } from 'framer-motion';
import React from 'react';

interface SegmentedToggleProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedToggle({ options, value, onChange, className = '' }: SegmentedToggleProps) {
  const activeIndex = options.findIndex(opt => opt.value === value);

  return (
    <div className={`relative flex p-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] ${className}`}>
      {/* Animated background pill */}
      <m.div
        className="absolute top-1 bottom-1 bg-[rgba(139,92,246,0.3)] border border-accent-primary rounded-[12px] shadow-[0_0_15px_rgba(139,92,246,0.2)]"
        initial={false}
        animate={{
          left: `calc(${activeIndex * (100 / options.length)}% + 4px)`,
          width: `calc(${100 / options.length}% - 8px)`,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <m.button
            key={option.value}
            type="button"
            className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors rounded-[12px] focus:outline-none ${
              isActive ? 'text-white' : 'text-text-muted hover:text-text-primary'
            }`}
            onClick={() => onChange(option.value)}
            whileTap={{ scale: 0.96 }}
          >
            {option.label}
          </m.button>
        );
      })}
    </div>
  );
}
