'use client';

import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { FadeUp } from '@/components/ui/FadeUp';

export function PrizePool() {
  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/public');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  const combinedPrize = typeof settings?.prizePool === 'string' ? settings.prizePool : 'Will be released soon..';

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 mb-12 sm:mb-20">
      <div className="section-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" />
      
      <div className="text-center mb-12 relative z-10">
        <h2 className="mb-4 text-3xl font-display font-bold text-white tracking-[0.15em] uppercase md:text-5xl">
          Prize <span className="bg-gradient-to-r from-accent-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-md">Pool</span>
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto text-lg">
          Compete for glory, recognition, and epic rewards across both tracks.
        </p>
      </div>

      <div className="relative z-10">
        <FadeUp>
          <GlassCard 
            hoverEffect 
            className="p-10 sm:p-16 text-center border-t-4 border-t-accent-primary group relative overflow-hidden max-w-4xl mx-auto"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-primary/20 blur-[80px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150 delay-100" />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-[0.15em] mb-4 drop-shadow-md">
                Combined Prize Pool
              </h3>
              <p className="text-sm md:text-base text-accent-secondary uppercase tracking-[0.2em] mb-10 font-semibold max-w-lg mx-auto">
                For Foundation & Professional Tracks
              </p>
              
              <div className="bg-void/60 border border-glass-border rounded-[32px] p-10 md:p-16 w-full shadow-[0_0_50px_rgba(168,85,247,0.15)_inset]">
                <span className="text-5xl sm:text-6xl md:text-7xl font-display font-bold bg-gradient-to-br from-white via-white to-accent-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  {combinedPrize}
                </span>
              </div>
            </div>
          </GlassCard>
        </FadeUp>
      </div>
    </section>
  );
}
