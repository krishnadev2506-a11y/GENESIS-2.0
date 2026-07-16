'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import React, { ReactNode } from 'react';

interface LazyLoadSectionProps {
  children: ReactNode;
  minHeight?: string;
}

export function LazyLoadSection({ children, minHeight = '500px' }: LazyLoadSectionProps) {
  const { ref, hasIntersected } = useIntersectionObserver();

  return (
    <section ref={ref as React.RefObject<HTMLDivElement>} style={{ minHeight: hasIntersected ? 'auto' : minHeight }}>
      {hasIntersected ? children : null}
    </section>
  );
}
