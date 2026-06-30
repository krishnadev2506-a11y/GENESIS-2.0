'use client';

import { m} from 'framer-motion';

interface ConstellationThreadProps {
  pathD: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  delay?: number;
}

export function ConstellationThread({
  pathD,
  className = '',
  width = '100%',
  height = '100%',
  viewBox = '0 0 100 100',
  delay = 0,
}: ConstellationThreadProps) {
// If reduced motion is enabled, just show the path statically via opacity transition
  const variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { 
        pathLength: { duration: 1.2, ease: "easeInOut", delay },
        opacity: { duration: 0.2, delay } 
      } 
    }
  };

  return (
    <div className={`absolute pointer-events-none z-0 ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox={viewBox} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Glow layer (blurred, low opacity) */}
        <m.path
          d={pathD}
          stroke="var(--color-ion)"
          strokeWidth="3"
          strokeOpacity="0.3"
          strokeLinecap="round"
          style={{ filter: 'blur(3px)' }}
          variants={variants as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        />
        
        {/* Core thread (sharp, solid) */}
        <m.path
          d={pathD}
          stroke="var(--color-ion)"
          strokeWidth="1.5"
          strokeLinecap="round"
          variants={variants as any}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        />
      </svg>
    </div>
  );
}


