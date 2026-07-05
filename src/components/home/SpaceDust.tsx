'use client';

import { m } from 'framer-motion';
import { useEffect, useState } from 'react';

export function SpaceDust() {
  const [mounted, setMounted] = useState(false);
  const [dustParticles, setDustParticles] = useState<Array<{left: string, top: string, delay: string, duration: string, size: string, opacity: number}>>([]);

  useEffect(() => {
    setMounted(true);
    setDustParticles(
      Array.from({ length: 30 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${20 + Math.random() * 30}s`,
        size: Math.random() > 0.5 ? 'h-1 w-1' : 'h-1.5 w-1.5',
        opacity: 0.15 + Math.random() * 0.4
      }))
    );
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {dustParticles.map((dust, i) => (
        <m.div
          key={i}
          className={`absolute ${dust.size} rounded-full bg-pulse-bright`}
          style={{ left: dust.left, top: dust.top, opacity: dust.opacity }}
          animate={{ 
            y: ['0vh', '-100vh'], 
            x: ['0px', i % 2 === 0 ? '80px' : '-80px'] 
          }}
          transition={{ 
            duration: parseFloat(dust.duration), 
            delay: parseFloat(dust.delay), 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        />
      ))}
    </div>
  );
}
