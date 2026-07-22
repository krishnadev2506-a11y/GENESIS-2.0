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

  const foundationPrize = settings?.prizePool?.foundation || 'Will be released soon..';
  const professionalPrize = settings?.prizePool?.professional || 'Will be released soon..';

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 mb-12 sm:mb-20">
      <div className="section-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" />
      
      <div className="text-center mb-12 relative z-10">
        <h2 className="mb-4 text-3xl font-display font-bold text-white tracking-[0.15em] uppercase md:text-5xl">
          Prize <span className="bg-gradient-to-r from-accent-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-md">Pool</span>
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto text-lg">
          Compete for glory, recognition, and epic rewards across both tracks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <FadeUp delay={0.1}>
          <GlassCard 
            hoverEffect 
            className="p-8 sm:p-12 text-center h-full border-t-4 border-t-accent-primary group relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-primary/20 blur-[60px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
            <div className="relative z-10 flex flex-col h-full justify-center">
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-[0.15em] mb-2 drop-shadow-md">Foundation Track</h3>
              <p className="text-sm text-accent-secondary uppercase tracking-[0.2em] mb-8 font-semibold">1st & 2nd Year Students</p>
              
              <div className="bg-void/60 border border-glass-border rounded-[24px] p-8 mb-4 shadow-[0_0_40px_rgba(168,85,247,0.1)_inset]">
                <span className="text-4xl sm:text-5xl font-display font-bold bg-gradient-to-br from-white to-[#c4b5fd] bg-clip-text text-transparent drop-shadow-lg">
                  {foundationPrize}
                </span>
              </div>
            </div>
          </GlassCard>
        </FadeUp>

        <FadeUp delay={0.2}>
          <GlassCard 
            hoverEffect 
            className="p-8 sm:p-12 text-center h-full border-t-4 border-t-emerald-400 group relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
            <div className="relative z-10 flex flex-col h-full justify-center">
              <h3 className="text-2xl font-display font-bold text-white uppercase tracking-[0.15em] mb-2 drop-shadow-md">Professional Track</h3>
              <p className="text-sm text-emerald-400 opacity-90 uppercase tracking-[0.2em] mb-8 font-semibold">3rd & 4th Year Students</p>
              
              <div className="bg-void/60 border border-glass-border rounded-[24px] p-8 mb-4 shadow-[0_0_40px_rgba(52,211,153,0.1)_inset]">
                <span className="text-4xl sm:text-5xl font-display font-bold bg-gradient-to-br from-white to-[#6ee7b7] bg-clip-text text-transparent drop-shadow-lg">
                  {professionalPrize}
                </span>
              </div>
            </div>
          </GlassCard>
        </FadeUp>
      </div>
    </section>
  );
}
