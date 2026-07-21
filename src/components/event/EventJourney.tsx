'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { StaggerContainer } from '@/components/ui/StaggerContainer';
import { FadeUp } from '@/components/ui/FadeUp';
import { IThemeRelease } from '@/models/Settings';

interface EventJourneyProps {
  route: 'foundation' | 'professional';
  theme: IThemeRelease;
}

export function EventJourney({ route, theme }: EventJourneyProps) {
  const isProfessional = route === 'professional';

  const stations = isProfessional
    ? [
        { name: 'Debug Arena', icon: '🐛' },
        { name: 'System Design Sprint', icon: '🏗️' },
        { name: 'Code Review Challenge', icon: '👀' },
        { name: 'AI Engineering Challenge', icon: '🤖' },
        { name: 'Deployment Sprint', icon: '🚀' },
        { name: 'Mock Technical Interview', icon: '🗣️' },
      ]
    : [
        { name: 'Debug Arena', icon: '🐛' },
        { name: 'System Design Sprint', icon: '🏗️' },
        { name: 'Code Review Challenge', icon: '👀' },
        { name: 'AI Engineering Challenge', icon: '🤖' },
        { name: 'Deployment Sprint', icon: '🚀' },
      ];

  const colorPrimary = isProfessional ? 'text-pulse-bright' : 'text-emerald-400';
  const colorGlow = isProfessional ? 'rgba(168,85,247,0.15)' : 'rgba(52,211,153,0.15)';
  const colorBorder = isProfessional ? 'rgba(168,85,247,0.3)' : 'rgba(52,211,153,0.3)';

  return (
    <div className="py-24 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-pulse-bright/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      <StaggerContainer className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <FadeUp>
            <div className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium uppercase tracking-widest ${colorPrimary} mb-4`}>
              {isProfessional ? 'Professional Route' : 'Foundation Route'}
            </div>
          </FadeUp>
          
          <FadeUp as="h1" className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
            {theme.published ? theme.title : (isProfessional ? 'Genesis 2.0 - Professional' : 'Genesis 2.0 - Foundation')}
          </FadeUp>
          
          <FadeUp as="p" className="text-xl md:text-2xl text-text-muted italic">
            {theme.published ? theme.tagline : 'Theme will be revealed soon'}
          </FadeUp>

          {theme.published && theme.description && (
            <FadeUp as="p" className="text-text-muted leading-relaxed mt-6">
              {theme.description}
            </FadeUp>
          )}
        </div>

        {/* Timeline Section */}
        <div className="relative mt-20 space-y-12">
          {/* Timeline connecting line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent -translate-x-1/2" />

          {/* Phase 1 */}
          <FadeUp className="relative flex flex-col md:flex-row items-start md:items-center gap-8 group">
            <div className="md:w-1/2 md:text-right md:pr-12 pl-16 md:pl-0 order-2 md:order-1">
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-pulse-bright transition-colors">Phase 1: Announcement</h3>
              <p className="text-text-muted">Problem statements and themes are released to the participants. Teams start brainstorming their approach.</p>
            </div>
            <div className="absolute left-0 md:left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-void shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10 order-1 md:order-2">
              <span className="text-2xl">📣</span>
            </div>
            <div className="md:w-1/2 md:pl-12 order-3 hidden md:block" />
          </FadeUp>

          {/* Phase 2 */}
          <FadeUp className="relative flex flex-col md:flex-row items-start md:items-center gap-8 group">
            <div className="md:w-1/2 md:pr-12 hidden md:block" />
            <div className="absolute left-0 md:left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-void shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10 order-1 md:order-2">
              <span className="text-2xl">💻</span>
            </div>
            <div className="md:w-1/2 pl-16 md:pl-12 order-2 md:order-3">
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-pulse-bright transition-colors">Phase 2: Pre-Event Development</h3>
              <p className="text-text-muted">Teams develop their core applications before the event day. Code quality, architecture, and basic functionality are established.</p>
            </div>
          </FadeUp>

          {/* Phase 3 */}
          <FadeUp className="relative flex flex-col md:flex-row items-start md:items-center gap-8 group">
            <div className="md:w-1/2 md:text-right md:pr-12 pl-16 md:pl-0 order-2 md:order-1">
              <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-pulse-bright transition-colors">Phase 3: Event Day</h3>
              <p className="text-text-muted">The main event. Teams integrate surprise twists, complete challenge stations, and defend their architectures.</p>
            </div>
            <div className="absolute left-0 md:left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-void shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10 order-1 md:order-2">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="md:w-1/2 md:pl-12 order-3 hidden md:block" />
          </FadeUp>
        </div>

        {/* Challenge Stations */}
        <div className="pt-16">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white uppercase tracking-widest mb-4">Event Day Challenge Stations</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              During the event day, teams will rotate through various technical challenge stations to earn points and prove their engineering mettle.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station, i) => (
              <FadeUp key={station.name}>
                <GlassCard
                  delay={i * 0.1}
                  hoverEffect
                  className="p-6 h-full flex flex-col items-center text-center justify-center gap-4 transition-all duration-300 hover:scale-105"
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2"
                    style={{ background: colorGlow, border: `1px solid ${colorBorder}` }}
                  >
                    {station.icon}
                  </div>
                  <h4 className="text-lg font-display font-semibold text-white">{station.name}</h4>
                </GlassCard>
              </FadeUp>
            ))}
          </div>
        </div>

      </StaggerContainer>
    </div>
  );
}
