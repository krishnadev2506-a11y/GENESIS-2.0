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

      <m.div className="absolute left-1/2 top-[55%] z-[1] h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(15,12,24,0.4)_0%,#040408_70%)] blur-[1px] sm:top-[50%] sm:h-[28rem] sm:w-[28rem] md:h-[32rem] md:w-[32rem]" style={{ x: farX, y: farY }}>
        <div className="absolute inset-[-5%] rounded-full bg-[conic-gradient(from_210deg,rgba(139,92,246,0.15)_0deg,rgba(255,255,255,0.4)_72deg,rgba(167,139,250,0.2)_118deg,rgba(0,0,0,0)_360deg)] blur-[12px]" />
        <div className="absolute inset-[2%] overflow-hidden rounded-full bg-[#0a0a10]">
          <div className="absolute inset-[-10%] bg-[radial-gradient(circle_at_30%_36%,rgba(139,92,246,0.15)_0%,transparent_30%),linear-gradient(140deg,#09090f_10%,#181126_40%,#030306_100%)] opacity-80" />
        </div>
      </m.div>

      <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-7xl items-center justify-center sm:min-h-[78vh]">
        <div className="w-full max-w-5xl">
          <m.div
            className="glass-surface rounded-[32px] px-7 py-10 text-center shadow-[0_0_100px_rgba(139,92,246,0.18)] sm:rounded-[40px] sm:px-10 sm:py-14 md:px-16 md:py-20 border border-[rgba(255,255,255,0.12)]"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <m.h1 variants={fadeUp as any}>
              <BrandWordmark className="text-3xl tracking-[0.16em] text-white sm:text-5xl sm:tracking-[0.2em] lg:text-7xl lg:tracking-[0.22em]" />
            </m.h1>
            <m.p
              variants={fadeUp as any}
              className="font-display mx-auto mt-6 max-w-4xl text-base font-semibold uppercase tracking-[0.24em] text-text-muted sm:mt-8 sm:text-2xl sm:tracking-[0.3em] lg:text-4xl"
            >
              <span className="block">Code the future</span>
              <span className="block">Code the impossible</span>
            </m.p>
            <m.div variants={fadeUp as any} className="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:gap-5 sm:flex-row">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full min-w-0 sm:min-w-[240px]">Register Your Team</Button>
              </Link>
              <Link href="/schedule" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full min-w-0 sm:min-w-[240px]">Explore Schedule</Button>
              </Link>
            </m.div>
          </m.div>
        </div>
      </div>
    </section>
  );
}




