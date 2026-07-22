'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';
import { IThemeRelease } from '@/models/Settings';
import { m } from 'framer-motion';

const Icons = {
  announcement: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="ann-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="ann-highlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d="M11 5l8-3v18l-8-3H5a2 2 0 01-2-2V7a2 2 0 012-2h6z" fill="url(#ann-body)" transform="translate(1, 2)" />
      <path d="M11 4l8-3v18l-8-3H5a2 2 0 01-2-2V6a2 2 0 012-2h6z" fill="url(#ann-highlight)" />
      <ellipse cx="19" cy="10" rx="3" ry="9" fill="#1e3a8a" />
    </svg>
  ),
  development: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="dev-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        <linearGradient id="dev-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect x="1" y="15" width="22" height="4" rx="2" fill="url(#dev-base)" transform="translate(0,2)" />
      <rect x="3" y="4" width="18" height="12" rx="1" fill="url(#dev-base)" transform="translate(0,1)" />
      <rect x="4" y="5" width="16" height="10" fill="url(#dev-screen)" />
      <path d="M9 8l-2 2 2 2m6-4l2 2-2 2" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  eventDay: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="trophy-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
      <path d="M7 21h10v-2H7v2zm5-18c-3.3 0-6 2.7-6 6v1c0 2.2 1.3 4.1 3.2 5.1L10 17v2h4v-2l.8-1.9c1.9-1 3.2-2.9 3.2-5.1V9c0-3.3-2.7-6-6-6z" fill="url(#trophy-gold)" transform="translate(0, 1)" />
      <path d="M7 20h10v-2H7v2zm5-18c-3.3 0-6 2.7-6 6v1c0 2.2 1.3 4.1 3.2 5.1L10 16v2h4v-2l.8-1.9c1.9-1 3.2-2.9 3.2-5.1V8c0-3.3-2.7-6-6-6z" fill="#fef08a" />
    </svg>
  ),
  ai: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="ai-pink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="16" height="14" rx="3" fill="url(#ai-pink)" transform="translate(0,1)" />
      <rect x="4" y="5" width="16" height="14" rx="3" fill="#fbcfe8" />
      <circle cx="8" cy="11" r="2" fill="#831843" />
      <circle cx="16" cy="11" r="2" fill="#831843" />
      <rect x="10" y="15" width="4" height="2" fill="#831843" />
      <path d="M12 5V2m-3 3V3m6 2V3" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  lightning: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="light-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M13 3L4 14h7v7l9-11h-7l4-7h-10z" fill="url(#light-grad)" transform="translate(1,1)" />
      <path d="M12 2L3 13h7v7l9-11h-7l4-7h-10z" fill="#fde68a" />
    </svg>
  ),
  shield: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="shield-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#shield-red)" transform="translate(0,1)" />
      <path d="M12 21s8-4 8-10V4l-8-3-8 3v7c0 6 8 10 8 10z" fill="#fca5a5" />
      <path d="M12 21V1L4 4v7c0 6 8 10 8 10z" fill="#fecaca" opacity="0.3" />
    </svg>
  ),
  interview: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="bubble1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="bubble2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <path d="M21 11c0 3.3-2.7 6-6 6h-1l-4 3v-3c-2.3 0-4.3-1.6-4.8-3.7-.1-.4-.2-.8-.2-1.3 0-3.3 2.7-6 6-6s6 2.7 6 6z" fill="url(#bubble1)" transform="translate(0,1)" />
      <path d="M9 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6c0 .4-.1.9-.2 1.3-.5 2.1-2.5 3.7-4.8 3.7H9v3l-4-3c.4 0 .7.1 1 .1h3z" fill="url(#bubble2)" />
    </svg>
  ),
  resume: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="doc-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="url(#doc-grad)" transform="translate(1,1)" />
      <path d="M13 2H5a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#f8fafc" />
      <path d="M13 2v6h6" fill="#cbd5e1" />
      <rect x="7" y="10" width="10" height="2" rx="1" fill="#94a3b8" />
      <rect x="7" y="14" width="7" height="2" rx="1" fill="#94a3b8" />
    </svg>
  ),
  ui: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="ui-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <path d="M12 2l2.4 7.6 7.6 2.4-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="url(#ui-grad)" transform="translate(0,1)" />
      <path d="M12 1l2.4 7.6 7.6 2.4-7.6 2.4L12 21l-2.4-7.6L2 11l7.6-2.4z" fill="#bae6fd" />
      <circle cx="12" cy="11" r="3" fill="#0284c7" />
    </svg>
  ),
  stopwatch: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
      <defs>
        <linearGradient id="stopwatch-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="13" r="9" fill="url(#stopwatch-grad)" transform="translate(0,1)" />
      <circle cx="12" cy="12" r="9" fill="#e2e8f0" />
      <path d="M12 12l4-4" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="1" width="4" height="3" rx="1" fill="#64748b" />
    </svg>
  )
};

interface EventJourneyProps {
  route: 'foundation' | 'professional';
  theme: IThemeRelease;
}

export function EventJourney({ route, theme }: EventJourneyProps) {
  const isProfessional = route === 'professional';

  const stations = isProfessional
    ? [
        { name: 'AI Engineering Battle', icon: <Icons.ai /> },
        { name: 'Constraint Drop', icon: <Icons.lightning /> },
        { name: 'Red Team Attack', icon: <Icons.shield /> },
        { name: 'Lightning Feature', icon: <Icons.stopwatch /> },
        { name: 'Mock Technical Interview', icon: <Icons.interview /> },
        { name: 'Resume Analysis', icon: <Icons.resume /> },
      ]
    : [
        { name: 'AI Engineering Battle', icon: <Icons.ai /> },
        { name: 'Constraint Drop', icon: <Icons.lightning /> },
        { name: 'Red Team Attack', icon: <Icons.shield /> },
        { name: 'Lightning Feature', icon: <Icons.stopwatch /> },
        { name: 'Best UI/UX', icon: <Icons.ui /> },
      ];

  const colorPrimary = isProfessional ? 'text-purple-400' : 'text-blue-400';
  const colorGlow = isProfessional ? 'rgba(168,85,247,0.15)' : 'rgba(96,165,250,0.15)';
  const colorBorder = isProfessional ? 'rgba(168,85,247,0.3)' : 'rgba(96,165,250,0.3)';
  const bgGradient = isProfessional 
    ? 'from-[#1a0b2e] to-[#0c0814]' 
    : 'from-[#0f172a] to-[#0c0814]';
  const blobColor1 = isProfessional ? 'bg-purple-600/20' : 'bg-blue-600/20';
  const blobColor2 = isProfessional ? 'bg-indigo-600/20' : 'bg-cyan-600/20';

  return (
    <div className={`relative min-h-screen pt-24 pb-32 overflow-hidden bg-gradient-to-b ${bgGradient}`}>
      
      {/* 3D Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <m.div
          animate={{ 
            x: [0, 100, 0, -100, 0], 
            y: [0, 50, -50, 50, 0],
            rotate: [0, 90, 180, 270, 360] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className={`absolute top-0 -left-64 w-[600px] h-[600px] rounded-full blur-[120px] ${blobColor1}`}
        />
        <m.div
          animate={{ 
            x: [0, -150, 0, 150, 0], 
            y: [0, -100, 100, -100, 0],
            rotate: [360, 270, 180, 90, 0] 
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className={`absolute bottom-0 -right-64 w-[800px] h-[800px] rounded-full blur-[150px] ${blobColor2}`}
        />
        {/* Abstract Grid Layer for depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-20%)' }}
        />
      </div>

      <StaggerContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        
        {/* Header Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <FadeUp>
            <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-white/10 via-white/30 to-white/10 mb-4 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <div className={`px-5 py-2 rounded-full bg-black/40 backdrop-blur-md text-xs sm:text-sm font-bold uppercase tracking-[0.3em] ${colorPrimary}`}>
                {isProfessional ? 'Professional Route Details' : 'Foundation Route Details'}
              </div>
            </div>
          </FadeUp>
          
          <FadeUp as="h1" className="text-4xl md:text-6xl lg:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tight drop-shadow-sm">
            {theme.published ? theme.title : (isProfessional ? 'PRO TRACK' : 'FOUNDATION')}
          </FadeUp>
          
          <FadeUp as="p" className="text-xl md:text-2xl text-white/70 italic font-light">
            {theme.published ? theme.tagline : 'Theme will be revealed soon'}
          </FadeUp>

          {theme.published && theme.description && (
            <FadeUp as="p" className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto mt-8 font-medium">
              {theme.description}
            </FadeUp>
          )}
        </div>

        {/* Timeline Section */}
        <div className="relative">
          <FadeUp className="text-center mb-16">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-[0.2em] opacity-90">Execution Timeline</h2>
            <div className={`h-1 w-24 mx-auto mt-6 rounded-full bg-gradient-to-r ${isProfessional ? 'from-purple-500/0 via-purple-500 to-purple-500/0' : 'from-blue-500/0 via-blue-500 to-blue-500/0'}`} />
          </FadeUp>

          <div className="space-y-8 relative">
            {/* Phases */}
            {[
              { phase: 'Phase 1', title: 'Announcement', desc: 'Problem statements and themes are released to the participants. Teams start brainstorming their approach.', icon: <Icons.announcement /> },
              { phase: 'Phase 2', title: 'Pre-Event Development', desc: 'Teams develop their core applications before the event day. Code quality, architecture, and basic functionality are established.', icon: <Icons.development /> },
              { phase: 'Phase 3', title: 'Event Day', desc: 'The main event. Teams integrate surprise twists, complete challenge stations, and defend their architectures.', icon: <Icons.eventDay /> }
            ].map((step, index) => (
              <FadeUp key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-md shadow-xl hover:border-white/15 transition-all duration-500">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500"
                      style={{ background: colorGlow, border: `1px solid ${colorBorder}` }}
                    >
                      {step.icon}
                    </div>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className={`text-xs md:text-sm font-bold uppercase tracking-widest ${colorPrimary} mb-2`}>{step.phase}</div>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3 tracking-wide">{step.title}</h3>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl">{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

        {/* Challenge Stations */}
        <div className="pt-10">
          <FadeUp className="text-center mb-16">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-[0.2em] opacity-90">Challenge Stations</h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              During the event day, teams will rotate through various technical challenge stations to earn points and prove their engineering mettle.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {stations.map((station, i) => (
              <FadeUp key={station.name}>
                <div className="relative group h-full">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div 
                    className="relative p-6 md:p-8 h-full flex flex-col items-center text-center justify-center gap-4 transition-transform duration-500 hover:-translate-y-2 rounded-3xl border border-white/5 bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden"
                  >
                    {/* Animated sweep inside the card */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] group-hover:animate-[sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] -translate-x-full pointer-events-none" />
                    
                    <div 
                      className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                      style={{ background: colorGlow, border: `1px solid ${colorBorder}` }}
                    >
                      {station.icon}
                    </div>
                    <h4 className="text-sm md:text-base font-display font-bold text-white/90 tracking-wide">{station.name}</h4>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

      </StaggerContainer>
    </div>
  );
}
