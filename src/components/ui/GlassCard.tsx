'use client';

import { m } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animate?: boolean;
  hoverEffect?: boolean;
  className?: string;
  delay?: number;
}

export function GlassCard({
  children,
  animate = true,
  hoverEffect = false,
  className = '',
  delay = 0,
  ...props
}: GlassCardProps) {
  const hoverClass = hoverEffect ? 'glass-liquid card-hover-glow' : '';
  const content = (
    <>
      <div className="absolute inset-0 rounded-[24px] bg-[radial-gradient(ellipse_at_top,rgba(196,181,253,0.06)_0%,transparent_45%),radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.12)_0%,transparent_72%)] pointer-events-none"></div>
      <div className="relative z-10">{children}</div>
    </>
  );

  const sharedProps: any = {
    className: `glass-surface glass-shadow relative overflow-hidden rounded-[24px] p-6 transition-all duration-300 ${hoverClass} ${className}`,
    ...props,
  };

  if (animate) {
    const motionProps: any = hoverEffect
      ? {
          whileHover: { scale: 1.02 },
          transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
        }
      : {};

    return (
      <m.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px' }}
        transition={{ delay }}
        {...motionProps}
        {...sharedProps}
      >
        {content}
      </m.div>
    );
  }

  return <div {...sharedProps}>{content}</div>;
}


