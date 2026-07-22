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
    <div className="relative w-full z-20 -mt-4 sm:-mt-8 mb-4 sm:mb-8">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-3xl border border-[rgba(168,85,247,0.3)] bg-void/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-emerald-500/10 to-accent-primary/10 opacity-60 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse pointer-events-none" />
          
          <div className="relative z-10 text-center md:text-left flex-1">
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-[0.25em] text-accent-secondary mb-2 drop-shadow-md">
              Combined Prize Pool
            </h3>
            <p className="text-text-muted text-sm sm:text-base max-w-md mx-auto md:mx-0">
              Compete across both Foundation and Professional tracks for epic rewards and glory.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end">
            <div className="px-8 py-5 rounded-2xl bg-black/50 border border-white/10 shadow-[inset_0_0_20px_rgba(168,85,247,0.2)] group-hover:shadow-[inset_0_0_30px_rgba(52,211,153,0.2)] transition-shadow duration-500">
              <span className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                {prizePool}
              </span>
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
}
