import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const required = [
  {
    id: 'github',
    required: true,
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
    label: 'Repo',
  },
  {
    id: 'deployment',
    required: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    label: 'Link',
  },
  {
    id: 'readme',
    required: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: 'README',
  },
  {
    id: 'presentation',
    required: true,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    label: 'Deck',
  },
  {
    id: 'arch-docs',
    required: false,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    label: 'Architecture',
  },
  {
    id: 'api-docs',
    required: false,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    label: 'API Docs',
  },
];

export function SubmissionRequirements() {
  const requiredItems = required.filter((r) => r.required);
  const optionalItems = required.filter((r) => !r.required);

  return (
    <section id="submissions" className="relative z-10 mx-auto max-w-5xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-[-6rem] top-[6rem] opacity-60" />

      <StaggerContainer className="space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp as="p" className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">
            Checklist
          </FadeUp>
          <FadeUp as="h2" className="text-3xl font-display font-bold text-white uppercase tracking-[0.16em] md:text-5xl">
            Submission Requirements
          </FadeUp>
          <FadeUp as="p" className="mt-5 text-lg text-text-muted">
            Every team must submit the following before the evaluation window closes.
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Required */}
          <FadeUp>
            <div className="glass-surface glass-shadow rounded-[24px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
              <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-6 py-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#f87171]" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white">Required</span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {requiredItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 px-6 py-5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[rgba(167,139,250,0.24)] bg-[rgba(139,92,246,0.1)] text-accent-secondary">
                      {item.icon}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* Recommended */}
          <FadeUp>
            <div className="glass-surface glass-shadow rounded-[24px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
              <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-6 py-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#4ade80]" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white">Recommended</span>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {optionalItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 px-6 py-5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.06)] text-[#4ade80]">
                      {item.icon}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bonus note */}
              <div className="border-t border-[rgba(74,222,128,0.1)] bg-[rgba(74,222,128,0.04)] px-6 py-4">
                <p className="text-xs text-[#4ade80]/70 italic">
                  Strong additional documentation can positively influence engineering decision scores.
                </p>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Final evaluation reminder */}
        <FadeUp>
          <div className="rounded-2xl border border-[rgba(251,191,36,0.2)] bg-[rgba(245,158,11,0.04)] px-8 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)] text-[#fbbf24]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#fbbf24] mb-1">Final Evaluation</p>
                <p className="text-sm text-text-muted leading-relaxed">
                  During evaluation, teams will present their project demonstration, walk through the technical implementation, and be asked to justify engineering decisions. Judges may inspect source code directly.
                </p>
              </div>
              <Link href="/register" className="flex-shrink-0">
                <Button size="sm" variant="primary">Register Now</Button>
              </Link>
            </div>
          </div>
        </FadeUp>
      </StaggerContainer>
    </section>
  );
}
