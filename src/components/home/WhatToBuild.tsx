import { GlassCard } from '@/components/ui/GlassCard';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';

const projectTypes = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    label: 'Web Applications',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Mobile Applications',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Desktop Applications',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    label: 'AI-powered Applications',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    label: 'Cloud-based Applications',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    label: 'IoT Applications',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    label: 'Any Other Software Solution',
  },
];

export function WhatToBuild() {
  return (
    <section id="what-to-build" className="relative z-10 mx-auto max-w-7xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow right-[-6rem] top-[4rem] opacity-60" />

      <StaggerContainer className="space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp as="p" className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">
            Open Build Space
          </FadeUp>
          <FadeUp as="h2" className="text-3xl font-display font-bold text-white uppercase tracking-[0.16em] md:text-5xl">
            What to Build
          </FadeUp>
          <FadeUp as="p" className="mt-5 text-lg text-text-muted">
            No restrictions on tech stack, language, or framework. The engineering quality is what matters.
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projectTypes.map((type, index) => (
            <FadeUp key={type.label}>
              <GlassCard
                delay={index * 0.08}
                hoverEffect
                className="flex flex-col items-start gap-4 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(167,139,250,0.24)] bg-[rgba(139,92,246,0.1)] text-accent-secondary">
                  {type.icon}
                </div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-[0.06em]">
                  {type.label}
                </h3>
              </GlassCard>
            </FadeUp>
          ))}
        </div>

        {/* No-restriction callout */}
        <FadeUp>
          <div className="mx-auto max-w-3xl rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[rgba(139,92,246,0.06)] p-6 text-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['React', 'Django', 'Go', 'Rust', 'Flutter', 'Spring Boot', 'FastAPI', 'Next.js', 'Vue', 'Rails', '…anything'].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[rgba(167,139,250,0.18)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-mono tracking-wider text-text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.22em] text-text-muted/70">
              No restriction on tech stack, language, or framework
            </p>
          </div>
        </FadeUp>
      </StaggerContainer>
    </section>
  );
}
