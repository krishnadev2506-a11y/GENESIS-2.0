import { ReactNode } from 'react';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';

const buildRules: Array<{ id: string; icon: ReactNode; rule: string; critical?: boolean }> = [
  {
    id: 'post-announcement',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    rule: 'Repo Post-Announcement Only',
  },
  {
    id: 'github-post',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    rule: 'No Pre-Built Repos',
  },
  {
    id: 'commit-inspection',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    rule: 'Commit History Inspected',
  },
  {
    id: 'no-reuse',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    rule: 'No Plagiarism',
  },
  {
    id: 'open-source',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    rule: 'Open-Source Allowed',
  },
  {
    id: 'judges-final',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    rule: 'Judges Decision Final',
  },
];

export function BuildIntegrity() {
  return (
    <section id="rules" className="relative z-10 mx-auto max-w-5xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow right-[-6rem] top-[4rem] opacity-55" />

      <StaggerContainer className="space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp as="p" className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">
            Fair Play
          </FadeUp>
          <FadeUp as="h2" className="text-3xl font-display font-bold text-white uppercase tracking-[0.16em] md:text-5xl">
            Build Integrity Rules
          </FadeUp>
          <FadeUp as="p" className="mt-5 text-lg text-text-muted">
            These rules ensure a level playing field and protect the integrity of the competition.
          </FadeUp>
        </div>

        <FadeUp>
          <div className="glass-surface glass-shadow rounded-[24px] overflow-hidden border border-[rgba(255,255,255,0.08)]">
            {/* Header stripe */}
            <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-8 py-5 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#f87171]" />
              <div className="h-3 w-3 rounded-full bg-[#fbbf24]" />
              <div className="h-3 w-3 rounded-full bg-[#34d399]" />
              <span className="ml-4 text-xs font-mono text-text-muted/50 tracking-wider">build-integrity.rules</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 px-8 py-6">
              {buildRules.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 rounded-full border px-5 py-2.5 transition-transform hover:-translate-y-1 ${
                    item.critical
                      ? 'border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.08)]'
                      : 'border-[rgba(167,139,250,0.25)] bg-[rgba(139,92,246,0.1)]'
                  }`}
                >
                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center ${item.critical ? 'text-[#f87171]' : 'text-accent-secondary'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-display font-bold uppercase tracking-[0.06em] ${item.critical ? 'text-[#f87171]' : 'text-white'}`}>
                    {item.rule}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* AI Usage block */}
        <FadeUp>
          <div className="relative rounded-2xl border border-[rgba(167,139,250,0.25)] bg-[rgba(139,92,246,0.06)] p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-[rgba(167,139,250,0.3)] bg-[rgba(139,92,246,0.12)] text-accent-secondary">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent-secondary">AI Usage Policy</p>
                <h3 className="mb-3 text-xl font-display font-bold text-white tracking-[0.04em]">
                  AI Tools Are Permitted
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-4 hidden"></p>
                <div className="flex flex-wrap gap-2">
                  {['ChatGPT', 'Copilot', 'Cursor', 'Gemini', 'Claude', 'Grok', 'Ollama', '+ others'].map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-[rgba(167,139,250,0.18)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs font-mono text-text-muted/80"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </StaggerContainer>
    </section>
  );
}
