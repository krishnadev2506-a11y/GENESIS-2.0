'use client';

import { m } from 'framer-motion';
import { staggerContainer } from '@/lib/motion-variants';
import React from 'react';

export function StaggerContainer({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <m.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px' }}
      className={className}
    >
      {children}
    </m.div>
  );
}
