'use client';

import { GlassCard } from '@/components/ui/GlassCard';

const games = [
  {
    badge: '01',
    title: 'Speed Typing Challenge',
    description: 'Test your typing speed and accuracy in a fast-paced live showdown.',
  },
  {
    badge: '02',
    title: 'Tech Trivia Battle',
    description: 'Challenge your team with fast knowledge rounds against other builders.',
  },
  {
    badge: '03',
    title: 'Code Golf',
    description: 'Solve programming problems with fewer characters and smarter thinking.',
  },
  {
    badge: '04',
    title: 'Guess the Bug',
    description: 'Spot, explain, and fix broken logic faster than the rest of the field.',
  },
];

export function CompetitionsGames() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="section-glow left-[-6rem] top-[6rem] opacity-60" />

      <div className="mb-16 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.28em] text-accent-secondary">Always On</p>
        <h2 className="mb-4 text-3xl font-display font-bold text-white tracking-[0.14em] uppercase md:text-4xl">
          Competitions & Games
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-text-muted">
          Fast side quests, sharp mini-events, and prize moments woven into the same cosmic atmosphere.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {games.map((game, index) => (
          <GlassCard key={game.title} delay={index * 0.1} hoverEffect className="flex items-start p-6 sm:p-8">
            <div className="mr-5 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-[rgba(167,139,250,0.22)] bg-[linear-gradient(180deg,rgba(139,92,246,0.16),rgba(255,255,255,0.04))] text-lg font-display tracking-[0.18em] text-accent-secondary shadow-[0_0_26px_rgba(139,92,246,0.16)] sm:mr-6">
              {game.badge}
            </div>
            <div>
              <h3 className="mb-2 text-lg font-display font-bold text-white uppercase tracking-[0.06em] sm:text-xl">{game.title}</h3>
              <p className="text-sm text-text-muted sm:text-base">{game.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
