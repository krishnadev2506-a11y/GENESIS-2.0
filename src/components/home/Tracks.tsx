'use client';

import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/GlassCard';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Tracks() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () => {
      const res = await fetch('/api/settings/public');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  const getThemeText = (themeKey: 'themeFoundation' | 'themeProfessional') => {
    if (isLoading || !settings) return { title: 'Loading...', tagline: 'Please wait' };
    const theme = settings[themeKey];
    if (theme?.published) {
      return { title: theme.title, tagline: theme.tagline };
    }
    return { title: 'Will be released soon', tagline: 'Stay tuned for updates' };
  };

  const foundationTheme = getThemeText('themeFoundation');
  const professionalTheme = getThemeText('themeProfessional');

  const tracks = [
    {
      id: 'foundation',
      badge: 'F',
      year: '2nd & 3rd Year Students',
      title: 'Foundation Track',
      themeTitle: foundationTheme.title,
      themeTagline: foundationTheme.tagline,
      route: '/event/foundation',
      color: 'from-[#4ade80] to-[#22c55e]',
      borderColor: 'rgba(74,222,128,0.25)',
      glowColor: 'rgba(74,222,128,0.12)',
      iconBg: 'rgba(74,222,128,0.12)',
      iconBorder: 'rgba(74,222,128,0.3)',
      checkColor: '#4ade80',
      badgeText: 'text-[#4ade80]',
      expectations: [
        'MVC Architecture',
        'Database Integration',
        'Basic Authentication',
        'Input Validation',
        'Clean Structure',
        'Basic Deployment',
      ],
      note: 'Cloud infra not expected.',
    },
    {
      id: 'professional',
      badge: 'P',
      year: '4th Year Students',
      title: 'Professional Track',
      themeTitle: professionalTheme.title,
      themeTagline: professionalTheme.tagline,
      route: '/event/professional',
      color: 'from-[#c4b5fd] to-[#a855f7]',
      borderColor: 'rgba(167,139,250,0.35)',
      glowColor: 'rgba(139,92,246,0.15)',
      iconBg: 'rgba(139,92,246,0.12)',
      iconBorder: 'rgba(167,139,250,0.3)',
      checkColor: '#c4b5fd',
      badgeText: 'text-[#c4b5fd]',
      expectations: [
        'System Design',
        'Cloud Deployment',
        'Docker & CI/CD',
        'AI Integration',
        'Scalable Architecture',
        'Monitoring & Logs',
      ],
      note: 'Must justify technical choices.',
    },
  ];

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

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {tracks.map((track, index) => (
            <FadeUp key={track.id}>
              <GlassCard
                delay={index * 0.12}
                hoverEffect
                className="min-h-[580px] flex flex-col p-6 sm:p-8 hover:-translate-y-1 transition-all duration-300 group"
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
                  <div className="w-full">
                    <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${track.badgeText} mb-2`}>
                      {track.year}
                    </p>
                    <h3 className="text-2xl font-display font-bold text-white uppercase tracking-[0.06em] mb-2">
                      {track.title}
                    </h3>
                    <div className="rounded-lg bg-black/40 border border-white/5 p-4 mb-2">
                      <h4 className="text-lg font-display text-white mb-1">{track.themeTitle}</h4>
                      <p className="text-sm text-text-muted italic">{track.themeTagline}</p>
                    </div>
                  </div>
                </div>

                {/* Divider with gradient */}
                <div
                  className="mb-6 h-px w-full"
                  style={{ background: `linear-gradient(90deg, ${track.borderColor}, transparent)` }}
                />

                {/* Expectations */}
                <ul className="flex-grow space-y-3 mb-8">
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
                <div className="mt-auto space-y-4">
                  <p className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-xs text-text-muted/70 italic leading-relaxed">
                    {track.note}
                  </p>
                  
                  <Link href={track.route} className="block w-full">
                    <Button 
                      variant="secondary" 
                      className="w-full justify-center group/btn"
                      style={{ 
                        borderColor: track.borderColor, 
                        color: track.checkColor 
                      }}
                    >
                      View Event Details
                      <svg
                        className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </div>
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
