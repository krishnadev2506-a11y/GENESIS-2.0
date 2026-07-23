'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';

export function RegistrationCTA() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

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
    <section className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 flex justify-center perspective-[2000px]">
      <m.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full relative"
      >
        <m.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden p-10 md:p-20 rounded-[2rem] sm:rounded-[3rem] border border-[rgba(167,139,250,0.2)] bg-gradient-to-br from-void-alt/90 to-void/90 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl group text-center"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />

          {/* Sweeping Light Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 group-hover:animate-[sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-purple-300 to-transparent skew-x-[-25deg] -translate-x-full pointer-events-none" />

          {/* Ambient Glows */}
          <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/2 rounded-full bg-[rgba(147,51,234,0.25)] blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-125" />
          <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/3 translate-y-1/3 rounded-full bg-[rgba(196,181,253,0.15)] blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-125" />

          {/* Foreground Content container */}
          <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
            
            <p className="mb-4 text-xs sm:text-sm uppercase tracking-[0.3em] font-bold text-accent-secondary drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              Ready to Build?
            </p>
            
            <h2 className="mb-6 text-4xl font-display font-black uppercase tracking-[0.12em] md:text-5xl lg:text-6xl bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent drop-shadow-xl">
              Genesis 2.0 <span className="opacity-50 inline-block mx-2">–</span> Buildathon
            </h2>
            
            <p className="mb-12 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-text-muted">
              Build like it&apos;s production. Compete on architecture, code quality, security, and engineering standards.
            </p>

            <div className="mb-12 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-inner group-hover:bg-white/10 transition-colors duration-500 min-w-[200px]">
                <span className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-secondary/80">Event Date</span>
                <span className="text-lg sm:text-xl font-display font-bold text-white tracking-widest">7th & 8th August</span>
                <span className="mt-2 text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-white/50">(No Overnighters)</span>
              </div>
              
              <div className="hidden h-16 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent md:block"></div>
              
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-inner group-hover:bg-white/10 transition-colors duration-500 min-w-[200px]">
                <span className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-secondary/80">Venue</span>
                <span className="text-lg sm:text-xl font-display font-bold text-white tracking-widest">CCF LABS FISAT</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row" style={{ transform: "translateZ(30px)" }}>
              <Link href="/register" id="cta-register-btn">
                <Button size="lg" variant="primary" className="px-14 py-4 text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all">
                  Register Now
                </Button>
              </Link>
            </div>
            
          </div>
        </m.div>
      </m.div>
    </section>
  );
}
