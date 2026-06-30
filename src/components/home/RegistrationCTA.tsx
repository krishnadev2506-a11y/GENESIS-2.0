'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function RegistrationCTA() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-75" />

      <GlassCard className="relative overflow-hidden border-[rgba(167,139,250,0.18)] p-10 text-center md:p-20">
        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/2 rounded-full bg-[rgba(147,51,234,0.22)] blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-[rgba(196,181,253,0.16)] blur-[80px]" />

        <div className="relative z-10">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">Final Call</p>
          <h2 className="mb-6 text-4xl font-display font-bold text-white uppercase tracking-[0.12em] md:text-5xl">
            Ready to Build the Future?
          </h2>

          <div className="mb-10 flex flex-col items-center justify-center gap-6 md:flex-row md:gap-12">
            <div className="flex flex-col items-center">
              <span className="mb-1 text-sm uppercase tracking-[0.22em] text-text-muted">Date</span>
              <span className="text-xl font-medium text-white">July 10-11, 2026</span>
            </div>
            <div className="hidden h-12 w-px bg-white/20 md:block"></div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-sm uppercase tracking-[0.22em] text-text-muted">Entry Fee</span>
              <span className="text-xl font-medium text-white">Starting at Rs. 600 / Team</span>
            </div>
          </div>

          <p className="mb-8 font-medium text-accent-secondary violet-text-glow">
            Limited spots available � secure your place today.
          </p>

          <Link href="/register">
            <Button size="lg" variant="primary" className="px-12 text-lg">
              Register Now
            </Button>
          </Link>
        </div>
      </GlassCard>
    </section>
  );
}

