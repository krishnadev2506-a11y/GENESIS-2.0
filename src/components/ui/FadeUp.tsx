'use client';

import { m } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';
import React from 'react';

export function FadeUp({ children, className, as = 'div' }: { children: React.ReactNode, className?: string, as?: any }) {
  const MotionComponent = m[as as keyof typeof m] || m.div;
  return (
    // @ts-expect-error - TypeScript struggles with dynamic framer-motion components
    <MotionComponent variants={fadeUp as any} className={className}>
      {children}
    </MotionComponent>
  );
}
