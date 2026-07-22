'use client';

import { useQuery } from '@tanstack/react-query';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';
import Link from 'next/link';
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';

function TrackCard({ track, index }: { track: any; index: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
      className="relative w-full h-full perspective-[1500px]"
    >
      <m.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full min-h-[400px] sm:min-h-[480px] flex flex-col p-6 sm:p-10 md:p-12 hover:-translate-y-2 sm:hover:-translate-y-3 transition-transform duration-700 group overflow-hidden rounded-[1.5rem] sm:rounded-3xl border md:[transform-style:preserve-3d]"
        style={{
          borderColor: track.borderColor,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.5), 0 0 50px ${track.glowColor}`,
          background: 'linear-gradient(145deg, rgba(25,15,45,0.4) 0%, rgba(10,5,15,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          rotateX,
          rotateY,
        }}
      >
        {/* Hairline glowing top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1px] opacity-30 group-hover:opacity-80 transition-opacity duration-700" 
          style={{ background: `linear-gradient(90deg, transparent, ${track.checkColor}, transparent)` }} 
        />

        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
        />

        {/* Large Background Glow that follows hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none mix-blend-screen"
          style={{ background: `radial-gradient(circle at 80% 20%, ${track.checkColor}40, transparent 60%)` }}
        />

        {/* Light sweep animation */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 group-hover:animate-[sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] -translate-x-full pointer-events-none" />

        {/* 3D Decorative Element */}
        <div 
          className="absolute top-6 right-6 sm:top-10 sm:right-10 w-20 h-20 sm:w-32 sm:h-32 opacity-10 sm:opacity-20 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none md:[transform:translateZ(-40px)]"
        >
          <m.div 
            animate={{ rotateY: 360, rotateX: 360 }}
            transition={{ duration: 25 + index * 5, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-2xl border flex items-center justify-center backdrop-blur-sm md:[transform-style:preserve-3d]"
            style={{ 
              borderColor: track.iconBorder,
              background: track.iconBg,
            }}
          >
            <div className="absolute inset-2 border rounded-xl md:[transform:translateZ(20px)]" style={{ borderColor: track.borderColor }} />
            <div className="absolute inset-4 border rounded-lg md:[transform:translateZ(40px)]" style={{ borderColor: track.borderColor }} />
          </m.div>
        </div>

        {/* Header Section */}
        <div className="mb-auto flex flex-col items-start gap-4 relative z-10 w-full pointer-events-none md:[transform:translateZ(30px)]">
          
          <div className="w-full relative z-10 flex flex-col items-start">
            <div 
              className="px-3 sm:px-4 py-1.5 rounded-full border mb-4 sm:mb-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] shadow-lg"
              style={{ 
                borderColor: track.iconBorder,
                background: track.iconBg,
                color: track.checkColor
              }}
            >
              {track.year}
            </div>
            
            <h3 className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-display font-black uppercase tracking-wide mb-5 sm:mb-8 bg-gradient-to-br ${track.color} bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,255,255,0.15)]`}>
              {track.title}
            </h3>
            
            {/* Theme Display Box */}
            <div className="w-full relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/5 bg-black/40 p-4 sm:p-6 backdrop-blur-md group-hover:border-white/15 transition-all duration-700 shadow-inner md:[transform:translateZ(20px)]">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${track.checkColor}, transparent)` }} />
              <h4 className="text-base xs:text-lg sm:text-2xl font-display text-white mb-2 font-medium tracking-wide flex items-center gap-2 sm:gap-3">
                {track.themeTitle === 'Revealing soon' && (
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: track.checkColor }}></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ backgroundColor: track.checkColor }}></span>
                  </span>
                )}
                <span>{track.themeTitle}</span>
              </h4>
              <p className="text-xs sm:text-sm text-text-muted italic max-w-sm">{track.themeTagline}</p>
            </div>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="mt-8 sm:mt-10 relative z-20 md:[transform:translateZ(40px)]">
          <Link 
            href={track.route} 
            className="relative block w-full overflow-hidden rounded-xl font-bold uppercase tracking-widest text-[11px] xs:text-xs sm:text-sm py-4 transition-all duration-500 group/btn cursor-pointer"
            style={{ 
              background: `linear-gradient(90deg, ${track.checkColor}15, transparent)`,
              border: `1px solid ${track.checkColor}40`,
              color: 'white',
            }}
          >
            {/* Continuous background animation */}
            <div className="absolute inset-0 opacity-20 animate-[sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] -translate-x-full pointer-events-none" />
            
            {/* Hover gradient fill */}
            <div 
              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `linear-gradient(90deg, ${track.checkColor}60, ${track.checkColor}10)` }}
            />
            <span className="relative z-10 flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 group-hover/btn:gap-4 transition-all duration-500 drop-shadow-md px-2 text-center pointer-events-none">
              Details
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 transform group-hover/btn:translate-x-1 transition-transform duration-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </m.div>
    </m.div>
  );
}

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
    return { title: 'Revealing soon', tagline: 'Stay tuned for updates' };
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
      note: 'Must justify technical choices.',
    },
  ];

  return (
    <section id="tracks" className="relative z-10 mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-[-8rem] top-[6rem] opacity-65" />
      <div className="section-glow right-[-8rem] bottom-[4rem] opacity-55" />

      <StaggerContainer className="space-y-10 sm:space-y-16">
        <div className="mx-auto max-w-3xl text-center">
          <FadeUp as="p" className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">
            Competition Tracks
          </FadeUp>
          <FadeUp as="h2" className="text-3xl font-display font-bold text-white uppercase tracking-[0.16em] md:text-5xl">
            Your Academic Year, Your Track
          </FadeUp>
          <FadeUp as="p" className="mt-5 text-base sm:text-lg text-text-muted max-w-2xl mx-auto">
            Each track is calibrated to the expected engineering maturity of its year group. Expectations scale accordingly.
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {tracks.map((track, index) => (
            <TrackCard key={track.id} track={track} index={index} />
          ))}
        </div>

        {/* Bottom note */}
        <FadeUp>
          <p className="text-center text-xs sm:text-sm uppercase tracking-[0.22em] text-text-muted/60">
            Participants compete only within their own academic year track.
          </p>
        </FadeUp>
      </StaggerContainer>
    </section>
  );
}
