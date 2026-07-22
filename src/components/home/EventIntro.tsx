'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { FadeUp } from '@/components/ui/FadeUp';

export function EventIntro() {
  return (
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 mb-12 sm:mb-20">
      <FadeUp>
        <GlassCard 
          hoverEffect 
          className="relative overflow-hidden p-8 sm:p-12 text-center group"
          style={{
            background: 'linear-gradient(180deg, rgba(168,85,247,0.08) 0%, rgba(10,10,15,0.6) 100%)',
            borderColor: 'rgba(168,85,247,0.3)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px rgba(168,85,247,0.15)'
          }}
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-primary/20 blur-[80px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
          
          <div className="relative z-10">
            <h2 className="mb-6 text-2xl font-display font-bold uppercase tracking-[0.15em] sm:text-3xl lg:text-4xl">
              Welcome to <span className="bg-gradient-to-r from-[#c4b5fd] to-[#a855f7] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">GENESIS 2.0</span>
            </h2>
            
            <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent mb-8" />

            <p className="mx-auto max-w-4xl text-base leading-relaxed text-text-muted sm:text-lg sm:leading-loose">
              An immersive, high-energy buildathon where teams of students collaborate to architect, build, and deploy production-grade applications. Experience intense coding sprints, surprise technical constraints, and real-world architecture defenses.
            </p>
          </div>
        </GlassCard>
      </FadeUp>
    </section>
  );
}
