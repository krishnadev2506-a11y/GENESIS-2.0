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
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">Ready to Build?</p>
          <h2 className="mb-4 text-4xl font-display font-bold text-white uppercase tracking-[0.12em] md:text-5xl">
            Genesis 2.0 – Buildathon
          </h2>
          <p className="mb-10 max-w-xl mx-auto text-text-muted leading-relaxed">
            Build like it&apos;s production. Compete on architecture, code quality, security, and engineering standards.
          </p>

          <div className="mb-10 flex flex-col items-center justify-center gap-6 md:flex-row md:gap-12">
            <div className="flex flex-col items-center">
              <span className="mb-1 text-sm uppercase tracking-[0.22em] text-text-muted">Event Date</span>
              <span className="text-xl font-medium text-white">[DATE TBD]</span>
            </div>
            <div className="hidden h-12 w-px bg-white/20 md:block"></div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-sm uppercase tracking-[0.22em] text-text-muted">Venue</span>
              <span className="text-xl font-medium text-white">[VENUE TBD]</span>
            </div>
            <div className="hidden h-12 w-px bg-white/20 md:block"></div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-sm uppercase tracking-[0.22em] text-text-muted">Reg. Deadline</span>
              <span className="text-xl font-medium text-white">[DEADLINE TBD]</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" id="cta-register-btn">
              <Button size="lg" variant="primary" className="px-12 text-lg">
                Register Now
              </Button>
            </Link>
            <a
              href="/rulebook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              id="cta-rulebook-btn"
            >
              <Button size="lg" variant="secondary" className="flex items-center gap-2">
                <svg className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Rulebook
              </Button>
            </a>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
