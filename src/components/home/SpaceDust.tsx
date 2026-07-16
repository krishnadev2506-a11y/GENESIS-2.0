'use client';

import { useEffect, useState } from 'react';

export function SpaceDust() {
  const [mounted, setMounted] = useState(false);
  const [dustParticles, setDustParticles] = useState<Array<{left: string, top: string, delay: string, duration: string, size: string, opacity: number, direction: number}>>([]);

  useEffect(() => {
    setMounted(true);
    setDustParticles(
      Array.from({ length: 30 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${20 + Math.random() * 30}s`,
        size: Math.random() > 0.5 ? 'h-1 w-1' : 'h-1.5 w-1.5',
        opacity: 0.15 + Math.random() * 0.4,
        direction: i % 2
      }))
    );
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {dustParticles.map((dust, i) => (
        <div
          key={i}
          className={`absolute ${dust.size} rounded-full bg-pulse-bright`}
          style={{ 
            left: dust.left, 
            top: dust.top, 
            opacity: dust.opacity,
            animation: `dust-float-${dust.direction} ${dust.duration} linear ${dust.delay} infinite`
          }}
        />
      ))}
    </div>
  );
}
