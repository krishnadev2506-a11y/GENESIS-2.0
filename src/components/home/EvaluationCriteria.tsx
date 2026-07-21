import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';

const criteria = [
  {
    id: 'functionality',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Functionality',
  },
  {
    id: 'architecture',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    label: 'Architecture',
  },
  {
    id: 'code-quality',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    label: 'Code Quality',
  },
  {
    id: 'security',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Security',
  },
  {
    id: 'deployment',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    label: 'Deployment',
  },
  {
    id: 'database',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    label: 'Database',
  },
  {
    id: 'performance',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'Performance',
  },
  {
    id: 'scalability',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    label: 'Scalability',
  },
  {
    id: 'documentation',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'Docs',
  },
  {
    id: 'engineering-decisions',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    label: 'Engineering',
  },
];

export function EvaluationCriteria() {
  return (
    <section id="evaluation" className="relative z-10 mx-auto max-w-7xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-[-8rem] top-[8rem] opacity-65" />

      <StaggerContainer className="space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp as="p" className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">
            Judging Rubric
          </FadeUp>
          <FadeUp as="h2" className="text-3xl font-display font-bold text-white uppercase tracking-[0.16em] md:text-5xl">
            Evaluation Criteria
          </FadeUp>
          <FadeUp as="p" className="mt-5 text-lg text-text-muted">
            Implementation quality carries significantly more weight than the novelty of the idea.
          </FadeUp>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {criteria.map((item, _index) => (
            <FadeUp key={item.id}>
              <div
                className="flex items-center gap-2 rounded-full border border-[rgba(167,139,250,0.25)] bg-[rgba(139,92,246,0.1)] px-5 py-2.5 transition-transform duration-300 hover:-translate-y-1 hover:border-[rgba(168,85,247,0.5)] hover:bg-[rgba(168,85,247,0.15)]"
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-accent-secondary">
                  {item.icon}
                </div>
                <span className="text-sm font-display font-bold text-white uppercase tracking-[0.06em]">
                  {item.label}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Callout quote */}
        <FadeUp>
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-[rgba(167,139,250,0.25)] bg-[linear-gradient(135deg,rgba(109,40,217,0.12),rgba(139,92,246,0.06))] p-8 text-center">
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-px bg-[linear-gradient(90deg,transparent,rgba(167,139,250,0.6),transparent)]" />
              <svg className="mx-auto mb-5 h-8 w-8 text-accent-secondary opacity-60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-lg font-display font-semibold text-white leading-relaxed tracking-wide">
                A simple application built with excellent engineering practices may score higher than an innovative app with poor implementation.
              </p>
            </div>
          </div>
        </FadeUp>
      </StaggerContainer>
    </section>
  );
}
