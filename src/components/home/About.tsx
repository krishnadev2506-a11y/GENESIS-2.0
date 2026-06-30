'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { m } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

const processItems = [
  {
    num: '01',
    title: 'Assemble',
    desc: 'Form a team of 4-6 members with diverse skills and build a balanced crew for the challenge.',
  },
  {
    num: '02',
    title: 'Build',
    desc: 'Collaborate on a full-stack product in a fast, immersive sprint powered by mentors and workshops.',
  },
  {
    num: '03',
    title: 'Deploy',
    desc: 'Ship your prototype, pitch the outcome, and experience role-based teamwork under pressure.',
  },
];

const features = [
  {
    title: 'Role-Based Teamwork',
    desc: 'Step into focused roles like design, backend, frontend, and product while working as one unit.',
    icon: (
      <svg className="w-6 h-6 text-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    title: 'Workshops',
    desc: 'Short guided sessions keep every team moving, learning, and making progress throughout the event.',
    icon: (
      <svg className="w-6 h-6 text-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    title: 'Prizes',
    desc: 'Compete for recognition, rewards, and standout moments during the event weekend.',
    icon: (
      <svg className="w-6 h-6 text-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function About() {
  return (
    <section id="about" className="relative z-10 mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="section-glow left-[-10rem] top-[4rem] opacity-70" />
      <div className="section-glow right-[-8rem] bottom-[10rem] opacity-60" />

      <m.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '0px' }}
        className="space-y-16"
      >
        <div className="mx-auto max-w-3xl text-center">
          <m.h2 variants={fadeUp as any} className="text-3xl md:text-5xl font-display font-bold text-white uppercase tracking-[0.16em]">
            The Process
          </m.h2>
          <m.p variants={fadeUp as any} className="mt-5 text-text-muted text-lg">
            A clean, high-energy path from team formation to launch, wrapped in the same cosmic system as the hero.
          </m.p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {processItems.map((item) => (
            <m.div key={item.num} variants={fadeUp as any}>
              <GlassCard hoverEffect className="h-full p-8">
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-6xl font-display font-bold text-transparent" style={{ WebkitTextStroke: '1.6px rgba(196,181,253,0.8)' }}>
                    {item.num}
                  </span>
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(167,139,250,0.55),transparent)]" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3 uppercase tracking-[0.08em]">{item.title}</h3>
                <p className="text-text-muted leading-7">{item.desc}</p>
              </GlassCard>
            </m.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 auto-rows-[250px]">
          <m.div variants={fadeUp as any} className="md:col-span-2 md:row-span-2">
            <GlassCard hoverEffect className="h-full flex flex-col justify-end p-8 md:p-10">
              <div className="mb-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-[rgba(167,139,250,0.3)] bg-[rgba(139,92,246,0.12)]">
                <svg className="w-7 h-7 text-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="mb-4 text-sm uppercase tracking-[0.24em] text-accent-secondary">Core Experience</p>
              <h3 className="mb-4 text-4xl font-display font-bold text-white uppercase tracking-[0.08em]">High-Tech Environment</h3>
              <p className="text-lg text-text-muted leading-8">Immerse yourself in a simulated product environment where teamwork, motion, glow, and pace all reinforce the brand.</p>
            </GlassCard>
          </m.div>

          {features.map((feature) => (
            <m.div key={feature.title} variants={fadeUp as any} className={feature.title === 'Role-Based Teamwork' ? 'md:col-span-2' : ''}>
              <GlassCard hoverEffect className="h-full flex flex-col justify-center p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] border border-[rgba(167,139,250,0.24)] bg-[rgba(139,92,246,0.1)]">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-display font-bold text-white uppercase tracking-[0.06em]">{feature.title}</h3>
                <p className="text-text-muted">{feature.desc}</p>
              </GlassCard>
            </m.div>
          ))}
        </div>
      </m.div>
    </section>
  );
}
