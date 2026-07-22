'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';
import { IThemeRelease } from '@/models/Settings';
import { m } from 'framer-motion';

interface EventJourneyProps {
  route: 'foundation' | 'professional';
  theme: IThemeRelease;
}

export function EventJourney({ route, theme }: EventJourneyProps) {
  const isProfessional = route === 'professional';

  const stations = isProfessional
    ? [
        { name: 'AI Engineering Battle', icon: '🤖' },
        { name: 'Constraint Drop', icon: '⚡' },
        { name: 'Red Team Attack', icon: '🛡️' },
        { name: 'Lightning Feature', icon: '⏱️' },
        { name: 'Mock Technical Interview', icon: '🗣️' },
        { name: 'Resume Analysis', icon: '📄' },
      ]
    : [
        { name: 'AI Engineering Battle', icon: '🤖' },
        { name: 'Constraint Drop', icon: '⚡' },
        { name: 'Red Team Attack', icon: '🛡️' },
        { name: 'Lightning Feature', icon: '⏱️' },
        { name: 'Best UI/UX', icon: '✨' },
      ];

  const colorPrimary = isProfessional ? 'text-purple-400' : 'text-emerald-400';
  const colorGlow = isProfessional ? 'rgba(168,85,247,0.15)' : 'rgba(52,211,153,0.15)';
  const colorBorder = isProfessional ? 'rgba(168,85,247,0.3)' : 'rgba(52,211,153,0.3)';
  const bgGradient = isProfessional 
    ? 'from-[#1a0b2e] to-[#0c0814]' 
    : 'from-[#0b2923] to-[#0c0814]';
  const blobColor1 = isProfessional ? 'bg-purple-600/20' : 'bg-emerald-600/20';
  const blobColor2 = isProfessional ? 'bg-indigo-600/20' : 'bg-teal-600/20';

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
            <div className={`h-1 w-24 mx-auto mt-6 rounded-full bg-gradient-to-r ${isProfessional ? 'from-purple-500/0 via-purple-500 to-purple-500/0' : 'from-emerald-500/0 via-emerald-500 to-emerald-500/0'}`} />
          </FadeUp>

          <div className="space-y-8 relative">
            {/* Phases */}
            {[
              { phase: 'Phase 1', title: 'Announcement', desc: 'Problem statements and themes are released to the participants. Teams start brainstorming their approach.', icon: '📣' },
              { phase: 'Phase 2', title: 'Pre-Event Development', desc: 'Teams develop their core applications before the event day. Code quality, architecture, and basic functionality are established.', icon: '💻' },
              { phase: 'Phase 3', title: 'Event Day', desc: 'The main event. Teams integrate surprise twists, complete challenge stations, and defend their architectures.', icon: '🏆' }
            ].map((step, index) => (
              <FadeUp key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 md:p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-md shadow-xl hover:border-white/15 transition-all duration-500">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500"
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
                      className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center text-3xl drop-shadow-md group-hover:scale-110 transition-transform duration-500"
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
