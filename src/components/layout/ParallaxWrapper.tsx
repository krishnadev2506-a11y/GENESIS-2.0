'use client';

import { m, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function ParallaxWrapper({ 
  children, 
  offset = 50 
}: { 
  children: React.ReactNode, 
  offset?: number 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ 
    target: ref, 
    offset: ["start end", "end start"] 
  });
  
  // As the element scrolls through the viewport, translate it on the Y axis
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <div ref={ref}>
      <m.div style={{ y }}>
        {children}
      </m.div>
    </div>
  );
}
