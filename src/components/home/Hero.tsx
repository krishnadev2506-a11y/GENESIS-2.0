'use client';

import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { useEffect, useMemo } from 'react';

export function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 18 });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      mouseX.set(0);
      mouseY.set(0);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const farX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const farY = useTransform(smoothY, [-1, 1], [-18, 18]);
  const nearX = useTransform(smoothX, [-1, 1], [-34, 34]);
  const nearY = useTransform(smoothY, [-1, 1], [-34, 34]);

  const stars = useMemo(
    () => [
      { top: '14%', left: '16%', size: 'h-1 w-1', delay: '0s', className: '' },
      { top: '18%', left: '72%', size: 'h-1.5 w-1.5', delay: '1.2s', className: '' },
      { top: '30%', left: '58%', size: 'h-1 w-1', delay: '2.1s', className: 'hidden sm:block' },
      { top: '38%', left: '24%', size: 'h-1.5 w-1.5', delay: '0.7s', className: '' },
      { top: '48%', left: '82%', size: 'h-1 w-1', delay: '1.8s', className: 'hidden sm:block' },
      { top: '56%', left: '12%', size: 'h-1 w-1', delay: '2.8s', className: '' },
      { top: '62%', left: '66%', size: 'h-1.5 w-1.5', delay: '0.4s', className: '' },
      { top: '76%', left: '42%', size: 'h-1 w-1', delay: '1.5s', className: 'hidden sm:block' },
      { top: '22%', left: '88%', size: 'h-1 w-1', delay: '2.4s', className: 'hidden sm:block' },
      { top: '70%', left: '86%', size: 'h-1.5 w-1.5', delay: '0.9s', className: 'hidden sm:block' },
    ],
    []
  );

  const asteroids = [
    { className: 'top-[14%] left-[-2%] h-[88px] w-[88px] opacity-40 sm:top-[18%] sm:left-[6%] sm:h-[110px] sm:w-[110px] sm:opacity-50', style: { x: farX, y: farY }, duration: 7 },
    { className: 'bottom-[16%] right-[-3%] h-[110px] w-[110px] opacity-35 sm:bottom-[18%] sm:right-[8%] sm:h-[140px] sm:w-[140px] sm:opacity-45', style: { x: farX, y: farY }, duration: 8.5 },
    { className: 'top-[19%] right-[-6%] hidden h-[130px] w-[130px] opacity-50 sm:block md:h-[160px] md:w-[160px] md:opacity-60', style: { x: nearX, y: nearY }, duration: 9.5 },
    { className: 'bottom-[20%] left-[-6%] hidden h-[140px] w-[140px] opacity-45 sm:block md:h-[170px] md:w-[170px] md:opacity-55', style: { x: nearX, y: nearY }, duration: 10.5 },
  ];

  return (
    <section className="relative isolate min-h-screen overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(167,139,250,0.14)_0%,transparent_28%),linear-gradient(180deg,rgba(10,10,15,0.72)_0%,rgba(10,10,15,0.2)_35%,rgba(10,10,15,0)_100%)]" />

      <m.div className="absolute inset-x-[10%] top-[15%] h-[25%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(196,181,253,0.15)_0%,rgba(139,92,246,0.1)_25%,transparent_60%)] blur-[40px] sm:inset-x-[15%] sm:h-[30%] sm:blur-[50px]" style={{ x: farX, y: farY }} />

      {stars.map((star) => (
        <span
          key={`${star.top}-${star.left}`}
          className={`absolute ${star.className} ${star.size} rounded-full bg-white/70 animate-twinkle`}
          style={{ top: star.top, left: star.left, animationDelay: star.delay }}
        />
      ))}

      {asteroids.map((asteroid, index) => (
        <m.div
          key={asteroid.className}
          className={`absolute z-[2] ${asteroid.className}`}
          style={asteroid.style}
          animate={{ y: [0, index % 2 === 0 ? -14 : 16, 0], rotate: [0, index % 2 === 0 ? 5 : -6, 0] }}
          transition={{ duration: asteroid.duration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_18px_rgba(139,92,246,0.22)]">
            <path d="M 18,46 L 38,18 L 74,24 L 88,54 L 66,88 L 22,76 L 10,56 Z" fill="#09090F" stroke="rgba(167,139,250,0.45)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 35,34 L 58,28 L 68,52 L 44,66 Z" fill="rgba(139,92,246,0.18)" />
          </svg>
        </m.div>
      ))}

      <m.div className="absolute right-[-10%] top-[40%] z-[1] h-[24rem] w-[24rem] lg:right-[5%] lg:top-[20%] lg:h-[40rem] lg:w-[40rem] rounded-full shadow-[0_0_150px_rgba(168,85,247,0.5)] blur-[1px]" style={{ x: farX, y: farY }}>
        <div className="absolute inset-[-5%] rounded-full bg-[conic-gradient(from_210deg,rgba(168,85,247,0.8)_0deg,rgba(255,255,255,0.9)_72deg,rgba(109,40,217,0.9)_118deg,rgba(0,0,0,0)_360deg)] blur-[20px]" />
        
        <div className="absolute inset-[2%] overflow-hidden rounded-full bg-[#1a103c] shadow-[inset_-30px_-30px_80px_rgba(168,85,247,0.8),inset_30px_30px_80px_rgba(0,0,0,0.8)] border border-[rgba(168,85,247,0.3)]">
          <m.div 
            className="absolute inset-[-50%] bg-[radial-gradient(circle_at_30%_36%,rgba(196,181,253,0.3)_0%,transparent_70%),linear-gradient(140deg,#2d1b4e_10%,#140d21_50%,#0a0a10_100%)] opacity-100"
            animate={{ rotate: 360 }}
            transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-[20%] left-[30%] w-[18%] h-[18%] rounded-full bg-[#150d29] shadow-[inset_6px_6px_14px_rgba(0,0,0,0.7),inset_-2px_-2px_8px_rgba(196,181,253,0.4)]" />
            <div className="absolute top-[45%] left-[60%] w-[14%] h-[14%] rounded-full bg-[#1c1236] shadow-[inset_5px_5px_12px_rgba(0,0,0,0.6),inset_-2px_-2px_6px_rgba(196,181,253,0.3)]" />
            <div className="absolute top-[65%] left-[25%] w-[22%] h-[22%] rounded-full bg-[#110a22] shadow-[inset_8px_8px_16px_rgba(0,0,0,0.8),inset_-3px_-3px_10px_rgba(196,181,253,0.5)]" />
            <div className="absolute top-[35%] left-[75%] w-[8%] h-[8%] rounded-full bg-[#1f143d] shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),inset_-1px_-1px_4px_rgba(196,181,253,0.2)]" />
            <div className="absolute top-[75%] left-[65%] w-[12%] h-[12%] rounded-full bg-[#180f2f] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.65),inset_-2px_-2px_5px_rgba(196,181,253,0.3)]" />
            <div className="absolute top-[15%] left-[55%] w-[10%] h-[10%] rounded-full bg-[#110a22] shadow-[inset_3px_3px_8px_rgba(0,0,0,0.7),inset_-1px_-1px_4px_rgba(196,181,253,0.2)]" />
            <div className="absolute top-[55%] left-[40%] w-[6%] h-[6%] rounded-full bg-[#1a103c] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-1px_-1px_3px_rgba(196,181,253,0.2)]" />
          </m.div>
        </div>
      </m.div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <m.div
            className="text-left pt-20 lg:pt-0"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <m.h1 variants={fadeUp}>
              <BrandWordmark className="text-4xl tracking-[0.16em] text-transparent bg-clip-text bg-gradient-to-r from-[#c4b5fd] via-white to-[#a855f7] sm:text-6xl sm:tracking-[0.2em] lg:text-7xl lg:tracking-[0.22em]" />
            </m.h1>
            <m.p
              variants={fadeUp}
              className="font-display mt-6 max-w-2xl text-lg font-semibold uppercase tracking-[0.24em] text-text-muted sm:mt-8 sm:text-2xl sm:tracking-[0.3em] lg:text-3xl"
            >
              <span className="block">Code the future</span>
              <span className="block text-white/50">Code the impossible</span>
            </m.p>
            <m.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:mt-12 sm:flex-row">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full min-w-0 sm:min-w-[220px]">Register Your Team</Button>
              </Link>
              <Link href="/schedule" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full min-w-0 sm:min-w-[220px]">Explore Schedule</Button>
              </Link>
            </m.div>
          </m.div>
          
          <div className="hidden lg:block relative h-full w-full">
            {/* Visual anchor buffer to prevent text from overlapping the eclipse */}
          </div>
        </div>
      </div>
    </section>
  );
}




