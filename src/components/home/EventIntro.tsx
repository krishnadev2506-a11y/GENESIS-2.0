'use client';

import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';

export function EventIntro() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
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
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full relative"
      >
        <m.div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative overflow-hidden p-8 sm:p-12 md:p-16 rounded-[2rem] border border-white/5 bg-gradient-to-br from-void-alt/90 to-void/90 shadow-2xl backdrop-blur-xl group"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Subtle Grid & Glare */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent-primary/10 blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
            
            {/* 3D Decorative Element */}
            <div 
              className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 shrink-0 pointer-events-none mb-4 md:mb-0"
              style={{ transform: "translateZ(50px)" }}
            >
               <m.div 
                 animate={{ rotateY: 360, rotateX: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(168,85,247,0.3)] backdrop-blur-md flex items-center justify-center"
                 style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                    transformStyle: 'preserve-3d'
                 }}
               >
                 <div className="absolute inset-2 border border-emerald-400/30 rounded-xl" style={{ transform: "translateZ(20px)" }} />
                 <div className="absolute inset-4 border border-accent-primary/40 rounded-lg" style={{ transform: "translateZ(40px)" }} />
                 <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" style={{ transform: "translateZ(60px)" }} />
               </m.div>
            </div>

            {/* Text Content */}
            <div 
              className="flex-1 text-center md:text-left pointer-events-none"
              style={{ transform: "translateZ(30px)" }}
            >
              <h2 className="mb-4 text-3xl font-display font-black uppercase tracking-[0.1em] sm:text-4xl lg:text-5xl drop-shadow-md">
                Welcome to <br className="md:hidden" />
                <span className="bg-gradient-to-r from-accent-primary via-purple-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  GENESIS 2.0
                </span>
              </h2>
              
              <div className="mx-auto md:mx-0 h-1 w-24 bg-gradient-to-r from-accent-primary to-emerald-400 mb-6 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />

              <p className="text-sm leading-relaxed text-text-muted sm:text-base md:text-lg sm:leading-loose">
                An immersive, high-energy buildathon where teams of students collaborate to architect, build, and deploy production-grade applications. Experience intense coding sprints, surprise technical constraints, and real-world architecture defenses.
              </p>
            </div>
          </div>
        </m.div>
      </m.div>
    </section>
  );
}
