import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';

const phases = [
  {
    id: 'announcement',
    phase: '01',
    label: 'Announcement',
    detail: 'Teams are notified of the official start. GitHub repos must be created from this point forward.',
    date: 'TBA',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'development',
    phase: '02',
    label: 'Dev Window',
    detail: 'Teams start building. Continuous commits expected. Meaningful commit history required.',
    date: 'TBA',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: 'buildathon-day',
    phase: '03',
    label: 'Buildathon Day',
    detail: 'Feature completion, bug fixes, performance & security improvements, deployment, documentation, and final presentation.',
    date: 'August 7 & 8',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    highlight: true,
    subItems: [
      'Feature completion',
      'Bug fixes',
      'Performance & security improvements',
      'Deployment',
      'Documentation',
      'Final presentation',
    ],
  },
  {
    id: 'judging',
    phase: '04',
    label: 'Judging',
    detail: 'Judges review live demos, inspect source code, and ask technical questions about architecture and engineering decisions.',
    date: 'August 8',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'results',
    phase: '05',
    label: 'Results',
    detail: 'Winners announced per track. All participants receive feedback on their engineering implementation.',
    date: 'August 8',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

export function BuildathonTimeline() {
  return (
    <section id="timeline" className="relative z-10 mx-auto max-w-5xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-1/2 top-1/3 -translate-x-1/2 opacity-60" />

      <StaggerContainer className="space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp as="p" className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">
            Event Phases
          </FadeUp>
          <FadeUp as="h2" className="text-3xl font-display font-bold text-white uppercase tracking-[0.16em] md:text-5xl">
            Schedule &amp; Timeline
          </FadeUp>
          <FadeUp as="p" className="mt-5 text-lg text-text-muted">
            Exact dates will be published with the official announcement. Fill in once confirmed.
          </FadeUp>
        </div>

        <FadeUp>
          <div className="relative">
            {/* Vertical spine */}
            <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-[linear-gradient(180deg,transparent,rgba(167,139,250,0.4)_10%,rgba(167,139,250,0.4)_90%,transparent)] hidden sm:block" />

            <div className="space-y-16 md:space-y-24">
              {phases.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`relative flex flex-col sm:flex-row items-center justify-between gap-6 group ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Spacer for desktop */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />

                  {/* Timeline node */}
                  <div className="hidden sm:flex flex-col items-center md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
                    <div
                      className={`relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-105 ${
                        phase.highlight
                          ? 'bg-[linear-gradient(135deg,#6d28d9,#a855f7)] border-[rgba(168,85,247,0.6)] shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white'
                          : 'bg-[rgba(139,92,246,0.1)] border-[rgba(167,139,250,0.25)] text-accent-secondary'
                      }`}
                    >
                      {phase.icon}
                    </div>
                  </div>

                  {/* Card */}
                  <div className="w-full sm:w-[calc(100%-5rem)] md:w-[calc(50%-3rem)]">
                    <div
                      className={`flex-1 glass-surface glass-shadow rounded-[20px] p-6 transition-all duration-300 group-hover:border-[rgba(167,139,250,0.3)] ${
                        phase.highlight
                          ? 'border-[rgba(168,85,247,0.35)] bg-[rgba(109,40,217,0.08)]'
                          : 'border-[rgba(255,255,255,0.08)]'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3 sm:hidden">
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${
                              phase.highlight
                                ? 'bg-[linear-gradient(135deg,#6d28d9,#a855f7)] border-[rgba(168,85,247,0.6)] text-white'
                                : 'bg-[rgba(139,92,246,0.1)] border-[rgba(167,139,250,0.25)] text-accent-secondary'
                            }`}
                          >
                            {phase.icon}
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-[0.22em] ${phase.highlight ? 'text-accent-primary' : 'text-accent-secondary'}`}>
                            Phase {phase.phase}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="hidden sm:flex items-center gap-2 mb-2">
                            <span className={`text-xs font-bold uppercase tracking-[0.22em] ${phase.highlight ? 'text-accent-primary' : 'text-accent-secondary'}`}>
                              Phase {phase.phase}
                            </span>
                            {phase.highlight && (
                              <span className="rounded-full bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-primary">
                                Main Event
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-display font-bold text-white tracking-[0.04em] mb-2" title={phase.detail}>
                            {phase.label}
                          </h3>

                          {phase.subItems && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {phase.subItems.map((item) => (
                                <span
                                  key={item}
                                  className="rounded-full border border-[rgba(167,139,250,0.2)] bg-[rgba(139,92,246,0.08)] px-3 py-1 text-xs text-text-muted"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 text-left sm:text-right mt-2 sm:mt-0">
                          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-3 py-2">
                            <svg className="h-4 w-4 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-mono font-bold text-white">{phase.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </StaggerContainer>
    </section>
  );
}
