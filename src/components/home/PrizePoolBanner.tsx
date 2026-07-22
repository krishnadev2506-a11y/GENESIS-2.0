'use client';

import { useQuery } from '@tanstack/react-query';
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';

export function PrizePoolBanner() {
  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/public');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  const prizePool = typeof settings?.prizePool === 'string' ? settings.prizePool : 'Will be released soon..';

  // 3D Interactive Cursor Hover Effect setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full z-20 mt-8 mb-12 flex justify-center perspective-[1200px]">
      <m.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-4xl px-4 sm:px-6 relative"
      >
        <m.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-10 gap-6 sm:gap-8 w-full rounded-2xl sm:rounded-[2rem] border border-white/5 bg-gradient-to-br from-[rgba(30,15,50,0.6)] to-[rgba(15,10,25,0.8)] shadow-2xl backdrop-blur-xl group"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Glass Glare Effects */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-[2rem] overflow-hidden pointer-events-none">
             <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-screen pointer-events-none" />
          </div>

          {/* Text Content */}
          <div 
            className="relative z-10 flex-1 text-center md:text-left pointer-events-none"
            style={{ transform: "translateZ(30px)" }}
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-accent-secondary via-emerald-300 to-emerald-500 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              Combined Prize Pool
            </h3>
          </div>

          {/* The Money Element */}
          <div 
            className="relative z-20 flex justify-center items-center pointer-events-none"
            style={{ transform: "translateZ(50px)" }}
          >
            <div className="flex items-center gap-3 sm:gap-4 bg-white/[0.03] border border-white/10 px-5 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-md group-hover:border-emerald-500/20 group-hover:bg-white/[0.05] transition-all duration-500">
              
              {/* 3D Coin/Money Icon */}
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-300 via-emerald-500 to-accent-primary shadow-[0_0_20px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_30px_rgba(52,211,153,0.6)] transition-shadow duration-500">
                <div className="absolute inset-1 rounded-full border border-white/40" />
                <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-void flex items-center justify-center drop-shadow-md">
                  <span className="text-emerald-400 font-black text-sm sm:text-base mt-[1px] ml-[1px]">₹</span>
                </div>
              </div>

              {/* Smaller, neatly aligned amount */}
              <span className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-100 to-emerald-400 drop-shadow-sm">
                {prizePool}
              </span>
              
            </div>
          </div>
        </m.div>
      </m.div>
    </div>
  );
}
