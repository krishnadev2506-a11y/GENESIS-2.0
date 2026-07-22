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
                className="relative min-h-[620px] flex flex-col p-6 sm:p-8 md:p-10 hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
                style={{
                  borderColor: track.borderColor,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.4), 0 0 40px ${track.glowColor}`,
                }}
              >
                {/* Subtle background glow that intensifies on hover */}
                <div 
                  className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${track.checkColor}20, transparent 60%)` }}
                />

                {/* Header */}
                <div className="mb-8 flex flex-col items-start gap-5 relative z-10">
                  {/* Background glow for the badge */}
                  <div 
                    className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl opacity-40 mix-blend-screen transition-opacity duration-500 group-hover:opacity-70 pointer-events-none" 
                    style={{ background: track.checkColor }} 
                  />
                  
                  <div
                    className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-display font-bold group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl"
                    style={{ background: track.iconBg, border: `1px solid ${track.iconBorder}` }}
                  >
                    <span className={`text-2xl ${track.badgeText} drop-shadow-md`}>{track.badge}</span>
                  </div>
                  
                  <div className="w-full relative z-10 mt-2">
                    <p className={`text-xs font-bold uppercase tracking-[0.24em] ${track.badgeText} mb-3`}>
                      {track.year}
                    </p>
                    <h3 className={`text-3xl md:text-4xl font-display font-bold uppercase tracking-wide mb-5 bg-gradient-to-r ${track.color} bg-clip-text text-transparent drop-shadow-sm`}>
                      {track.title}
                    </h3>
                    
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/50 p-5 mb-2 backdrop-blur-sm group-hover:border-white/20 transition-all duration-500">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${track.checkColor}, transparent)` }} />
                      <h4 className="text-xl font-display text-white mb-1.5 font-medium tracking-wide flex items-center gap-3">
                        {track.themeTitle === 'Will be released soon' && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: track.checkColor }}></span>
                            <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: track.checkColor }}></span>
                          </span>
                        )}
                        {track.themeTitle}
                      </h4>
                      <p className="text-sm text-text-muted italic">{track.themeTagline}</p>
                    </div>
                  </div>
                </div>

                {/* Divider with gradient */}
                <div
                  className="mb-8 h-[2px] w-full opacity-40 group-hover:opacity-100 transition-opacity duration-500 relative z-10"
                  style={{ background: `linear-gradient(90deg, ${track.checkColor}, transparent)` }}
                />

                {/* Expectations */}
                <ul className="flex-grow space-y-4 mb-10 relative z-10">
                  {track.expectations.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-text-muted leading-relaxed group/item transition-colors hover:text-white">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity" style={{ background: track.checkColor }} />
                        <svg
                          className="relative h-5 w-5 flex-shrink-0 transition-transform group-hover/item:scale-125"
                          style={{ color: track.checkColor }}
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.78 5.28a.75.75 0 0 0-1.06-1.06L7 7.94 5.28 6.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25z" />
                        </svg>
                      </div>
                      <span className="font-medium text-[15px]">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Note and Action */}
                <div className="mt-auto space-y-5 relative z-10">
                  <div className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/5 p-4 group-hover:bg-white/[0.08] transition-colors">
                    <p className="text-[13px] text-text-muted font-medium italic leading-relaxed text-center">
                      {track.note}
                    </p>
                  </div>
                  
                  <Link href={track.route} className="block w-full">
                    <button 
                      className="relative w-full overflow-hidden rounded-xl font-bold uppercase tracking-widest text-sm py-4 transition-all duration-300 group/btn"
                      style={{ 
                        background: `linear-gradient(to right, ${track.checkColor}15, transparent)`,
                        border: `1px solid ${track.checkColor}40`,
                        color: 'white',
                      }}
                    >
                      {/* Hover gradient fill */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                        style={{ background: `linear-gradient(to right, ${track.checkColor}40, ${track.checkColor}10)` }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:gap-4 transition-all duration-300 drop-shadow-md">
                        View Event Details
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </button>
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
