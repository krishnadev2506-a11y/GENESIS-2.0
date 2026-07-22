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
    <div className="relative w-full z-20 mt-12 mb-20 flex justify-center">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl px-4 sm:px-6 relative"
      >
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-10 gap-6 sm:gap-8 w-full rounded-[1.5rem] sm:rounded-3xl border border-white/[0.08] bg-[#0c0814] shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden group">
          
          {/* Subtle purple-to-teal backdrop glow inside the card */}
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: 'radial-gradient(100% 100% at 0% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%), radial-gradient(100% 100% at 100% 100%, rgba(45, 212, 191, 0.1) 0%, transparent 50%)' }} />
          
          {/* Top rim light */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />

          {/* Text Content */}
          <div className="relative z-10 flex-1 text-center md:text-left">
            <h3 className="text-xs sm:text-sm font-display font-bold uppercase tracking-[0.25em] text-text-muted mb-2">
              Prize Pool
            </h3>
            <p className="text-sm sm:text-base text-text-muted/70 max-w-sm mx-auto md:mx-0">
              Reward for exceptional execution and innovation.
            </p>
          </div>

          {/* The Money Element */}
          <div className="relative z-20 flex justify-center items-center">
            <div className="flex items-center gap-4 sm:gap-5 bg-white/[0.02] border border-white/5 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl shadow-inner">
              
              {/* 3D Coin/Medallion */}
              <m.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.15)]"
              >
                {/* Outer rim (purple to teal) */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 opacity-90 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.4)]" />
                
                {/* Inner embossed face */}
                <div className="relative w-[82%] h-[82%] rounded-full bg-gradient-to-br from-[#1f1635] to-[#0f1f22] flex items-center justify-center shadow-[inset_0_-2px_3px_rgba(255,255,255,0.15),inset_0_2px_5px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.5)] overflow-hidden">
                  {/* Directional light glare */}
                  <div className="absolute -top-1 -left-1 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
                  
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 font-black text-xl sm:text-2xl relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    ₹
                  </span>
                </div>
              </m.div>

              {/* Amount */}
              <span className="text-4xl md:text-5xl font-display font-black text-white drop-shadow-md tracking-tight">
                {prizePool}
              </span>
              
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
}
