'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { ConstellationThread } from '@/components/ui/ConstellationThread';

const sessions = [
  {
    badge: 'FE',
    title: 'Frontend Basics',
    description: 'HTML, CSS, JavaScript, and modern UI practices for building beautiful, usable interfaces.',
  },
  {
    badge: 'BE',
    title: 'Backend Essentials',
    description: 'APIs, data flow, and server-side foundations to power your product under real constraints.',
  },
  {
    badge: 'CLD',
    title: 'Cloud Fundamentals',
    description: 'Deployment, hosting, and production-minded workflows that take a demo to a real launch.',
  },
  {
    badge: 'OPS',
    title: 'Team Tools',
    description: 'Git, collaboration, and planning systems that help your team move fast without chaos.',
  },
];

export function SkillUpSessions() {
  return (
    <section id="skill-up" className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow right-[-8rem] top-[2rem] opacity-65" />
      <div className="text-center mb-16">
        <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">Mentor Powered</p>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-[0.14em] uppercase mb-4">
          Skill-Up Sessions
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto text-lg">
          Short, hands-on workshops that keep every team moving with confidence throughout the event.
        </p>
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[200px] -translate-y-1/2 z-0 opacity-40">
          <ConstellationThread
            pathD="M 12.5% 50% L 37.5% 50% L 62.5% 50% L 87.5% 50%"
            viewBox="0 0 100 100"
            delay={0.2}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
          {sessions.map((session, index) => (
            <GlassCard key={session.title} delay={index * 0.1} hoverEffect className="flex h-full flex-col p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(167,139,250,0.22)] bg-[linear-gradient(180deg,rgba(139,92,246,0.16),rgba(255,255,255,0.04))] text-sm font-display tracking-[0.22em] text-accent-secondary shadow-[0_0_26px_rgba(139,92,246,0.16)]">
                {session.badge}
              </div>
              <h3 className="mb-3 text-xl font-display font-bold text-white uppercase tracking-[0.06em]">{session.title}</h3>
              <p className="flex-grow text-text-muted leading-7">{session.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
