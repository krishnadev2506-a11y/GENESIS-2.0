'use client';

import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';

export function EventIntro() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-5deg', '5deg']);

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
    <section className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 mb-12 sm:mb-24 flex justify-center perspective-[1500px]">
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full relative"
      >
        <m.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden p-8 sm:p-12 md:p-16 rounded-[2rem] border border-white/5 bg-gradient-to-br from-void-alt/90 to-void/90 shadow-2xl backdrop-blur-xl group"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Background Grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Top Accent Line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent-primary/10 blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Decorative 3D Cube */}
            <div
              className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 shrink-0 pointer-events-none mb-4 md:mb-0"
              style={{ transform: 'translateZ(50px)' }}
            >
              <m.div
                animate={{ rotateY: 360, rotateX: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur-md flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="absolute inset-2 border border-blue-400/30 rounded-xl"
                  style={{ transform: 'translateZ(20px)' }}
                />
                <div
                  className="absolute inset-4 border border-accent-primary/40 rounded-lg"
                  style={{ transform: 'translateZ(40px)' }}
                />
                <div
                  className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"
                  style={{ transform: 'translateZ(60px)' }}
                />
              </m.div>
            </div>

            {/* Content - Justified */}
            <div
              className="flex-1 text-center md:text-left pointer-events-none"
              style={{ transform: 'translateZ(30px)' }}
            >
              <p className="mb-2 text-xs sm:text-sm uppercase tracking-[0.35em] text-accent-primary font-semibold">
                GENESIS 2.0
              </p>

              <h2 className="mb-3 text-4xl sm:text-5xl lg:text-6xl font-display font-black uppercase tracking-[0.08em] drop-shadow-md">
                <span className="bg-gradient-to-r from-accent-primary via-purple-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  BUILDATHON
                </span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl font-semibold text-white mb-6">
                Build Software. Learn Engineering. Grow as a Developer.
              </p>

              <div className="mx-auto md:mx-0 h-1 w-24 bg-gradient-to-r from-accent-primary to-blue-400 mb-8 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" />

              <div className="space-y-6 text-sm sm:text-base md:text-[17px] leading-relaxed text-text-muted text-justify md:text-left">
                <p>
                  <span className="text-white font-medium">Buildathon</span> is the flagship <span className="text-white font-medium">team-based</span> competition of{' '}
                  <span className="text-white font-medium">Genesis 2.0</span>. 
                  Teams work together with mentors to design, build, and ship real-world software while being evaluated on engineering excellence, code quality, and collaboration.
                </p>

                <p>
                  In addition to the main project, teams can earn extra points through exciting <span className="text-white font-medium">side quests and mini-games </span> 
                   throughout the event. These fun challenges add to your overall score and make the experience even more engaging.
                </p>

                <p>
                  This is a true team game where communication, clean architecture, and consistent delivery matter more than flashy ideas. Whether you're a beginner or seasoned developer, 
                  Buildathon offers real engineering experience in a supportive environment.
                </p>
              </div>

              {/* Prize Pool Teaser */}
              <div className="mt-8 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🏆</span>
                  <p className="uppercase tracking-[2px] text-sm font-semibold text-purple-400">Grand Prize Pool</p>
                </div>
                <p className="text-white font-medium text-lg">Massive rewards await the top teams</p>
                <p className="text-purple-300 text-sm mt-1">Prize pool to be revealed soon</p>
              </div>

              {/* Philosophy */}
              <div className="mt-8 rounded-2xl border border-accent-primary/20 bg-accent-primary/5 backdrop-blur-sm px-6 py-5">
                <p className="text-center md:text-left text-base sm:text-lg font-semibold text-white italic leading-relaxed">
                  "A simple idea, engineered exceptionally well, will always outperform a brilliant idea with poor implementation."
                </p>
              </div>
            </div>
          </div>
        </m.div>
      </m.div>
    </section>
  );
}