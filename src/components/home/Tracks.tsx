import { GlassCard } from '@/components/ui/GlassCard';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';

const tracks = [
  {
    id: 'foundation',
    badge: 'F',
    year: '2nd Year Students',
    title: 'Foundation',
    color: 'from-[#4ade80] to-[#22c55e]',
    borderColor: 'rgba(74,222,128,0.25)',
    glowColor: 'rgba(74,222,128,0.12)',
    iconBg: 'rgba(74,222,128,0.12)',
    iconBorder: 'rgba(74,222,128,0.3)',
    checkColor: '#4ade80',
    badgeText: 'text-[#4ade80]',
    expectations: [
      'CRUD Application',
      'Database Integration',
      'Basic Authentication',
      'Input Validation',
      'Clean Structure',
      'Basic Deployment',
    ],
    note: 'Cloud infra not expected.',
  },
  {
    id: 'intermediate',
    badge: 'I',
    year: '3rd Year Students',
    title: 'Intermediate',
    color: 'from-[#c4b5fd] to-[#a855f7]',
    borderColor: 'rgba(167,139,250,0.35)',
    glowColor: 'rgba(139,92,246,0.15)',
    iconBg: 'rgba(139,92,246,0.12)',
    iconBorder: 'rgba(167,139,250,0.3)',
    checkColor: '#c4b5fd',
    badgeText: 'text-[#c4b5fd]',
    expectations: [
      'MVC Architecture',
      'ORM & REST API',
      'Error Handling',
      'Role-based Auth',
      'Rate Limiting',
      'API Docs',
    ],
    note: 'Docker/CI-CD is a bonus.',
  },
  {
    id: 'professional',
    badge: 'P',
    year: '4th Year Students',
    title: 'Professional',
    color: 'from-[#fbbf24] to-[#f59e0b]',
    borderColor: 'rgba(251,191,36,0.25)',
    glowColor: 'rgba(245,158,11,0.1)',
    iconBg: 'rgba(251,191,36,0.1)',
    iconBorder: 'rgba(251,191,36,0.3)',
    checkColor: '#fbbf24',
    badgeText: 'text-[#fbbf24]',
    expectations: [
      'Cloud Deployment',
      'Docker & CI/CD',
      'Caching Strategy',
      'Scalable Design',
      'Monitoring & Logs',
      'Architecture Docs',
    ],
    note: 'Must justify technical choices.',
  },
];

export function Tracks() {
  return (
    <section id="tracks" className="relative z-10 mx-auto max-w-7xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-[-8rem] top-[6rem] opacity-65" />
      <div className="section-glow right-[-8rem] bottom-[4rem] opacity-55" />

      <StaggerContainer className="space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp as="p" className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">
            Competition Tracks
          </FadeUp>
          <FadeUp as="h2" className="text-3xl font-display font-bold text-white uppercase tracking-[0.16em] md:text-5xl">
            Your Academic Year, Your Track
          </FadeUp>
          <FadeUp as="p" className="mt-5 text-lg text-text-muted max-w-2xl mx-auto">
            Each track is calibrated to the expected engineering maturity of its year group. Expectations scale accordingly.
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {tracks.map((track, index) => (
            <FadeUp key={track.id}>
              <GlassCard
                delay={index * 0.12}
                hoverEffect
                className="min-h-[480px] flex flex-col p-6 sm:p-8 hover:-translate-y-1 transition-all duration-300 group"
                style={{
                  borderColor: track.borderColor,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.38), 0 0 40px ${track.glowColor}`,
                }}
              >
                {/* Header */}
                <div className="mb-6 flex flex-col items-start gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-display font-bold group-hover:scale-110 transition-transform duration-300"
                    style={{ background: track.iconBg, border: `1px solid ${track.iconBorder}` }}
                  >
                    <span className={`text-xl ${track.badgeText}`}>{track.badge}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${track.badgeText} mb-2`}>
                      {track.year}
                    </p>
                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-[0.06em]">
                      {track.title}
                    </h3>
                  </div>
                </div>

                {/* Divider with gradient */}
                <div
                  className="mb-6 h-px w-full"
                  style={{ background: `linear-gradient(90deg, ${track.borderColor}, transparent)` }}
                />

                {/* Expectations */}
                <ul className="flex-grow space-y-3 mb-6">
                  {track.expectations.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-text-muted leading-relaxed">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: track.checkColor }}
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.78 5.28a.75.75 0 0 0-1.06-1.06L7 7.94 5.28 6.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25z" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Note */}
                <p className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-xs text-text-muted/70 italic leading-relaxed">
                  {track.note}
                </p>
              </GlassCard>
            </FadeUp>
          ))}
        </div>

        {/* Bottom note */}
        <FadeUp>
          <p className="text-center text-sm uppercase tracking-[0.22em] text-text-muted/60">
            Participants compete only within their own academic year track.
          </p>
        </FadeUp>
      </StaggerContainer>
    </section>
  );
}
