'use client';

import { useQuery } from '@tanstack/react-query';
import { m } from 'framer-motion';

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

  return (
    <div className="relative w-full z-20 -mt-4 sm:-mt-8 mb-4 sm:mb-12 flex justify-center">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 relative"
      >
        {/* HUD Fragment Base (Asymmetric Glass Shard) */}
        <div 
          className="relative group p-6 sm:p-10 md:pr-40 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            // Diagonal clip on the left edge
            clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)',
            background: 'linear-gradient(135deg, rgba(20,10,35,0.7) 0%, rgba(10,5,15,0.4) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Faint top-left hairline gradient border */}
          <div className="absolute inset-0 pointer-events-none before:absolute before:top-0 before:left-[5%] before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-accent-primary/50 before:to-transparent before:z-10" />

          {/* Subdued glowing nebula bleeding from behind */}
          <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15)_0%,transparent_60%)] pointer-events-none -z-10 mix-blend-screen" />
          
          {/* Diagonal light sweep animation */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 group-hover:animate-[sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] -translate-x-full pointer-events-none" />
          
          <div className="relative z-10 text-center md:text-left flex-1 pl-4 md:pl-10">
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-accent-secondary mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
              Combined Prize Pool
            </h3>
            <p className="text-text-muted text-sm sm:text-base max-w-md mx-auto md:mx-0">
              Compete across both Foundation and Professional tracks for epic rewards and glory.
            </p>
          </div>
        </div>

        {/* Floating Tilted Figure (extracted from the clip-path container) */}
        <div className="absolute top-1/2 left-1/2 md:left-auto md:right-[5%] -translate-x-1/2 md:translate-x-0 -translate-y-1/2 z-30 pointer-events-none drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <m.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [3, 5, 3], y: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="px-6 py-4 md:px-8 md:py-6 relative"
          >
            {/* Bokeh Particles */}
            <div className="absolute -inset-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
              <div className="absolute top-0 right-10 w-2 h-2 rounded-full bg-accent-secondary/60 blur-[1px] animate-pulse" />
              <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-accent-primary/60 blur-[2px] animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-0 w-1.5 h-1.5 rounded-full bg-white/50 blur-[0.5px] animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>

            <span className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-emerald-400 drop-shadow-[0_5px_15px_rgba(168,85,247,0.6)]">
              {prizePool}
            </span>
          </m.div>
        </div>
      </m.div>
    </div>
  );
}
