'use client';

import { useQuery } from '@tanstack/react-query';
import { m, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';

export function PrizePoolBanner() {
  return (
    <div className="relative w-full z-20 mt-12 mb-20 flex justify-center">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl px-4 sm:px-6 relative"
      >
        <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-10 gap-8 sm:gap-10 w-full rounded-[1.5rem] sm:rounded-3xl border border-white/[0.08] bg-[#0c0814] shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden group">
          
          {/* Animated Background Sweeps & Glows */}
          <div className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ background: 'radial-gradient(120% 120% at 0% 0%, rgba(168, 85, 247, 0.2) 0%, transparent 50%), radial-gradient(120% 120% at 100% 100%, rgba(45, 212, 191, 0.2) 0%, transparent 50%)' }} />
          
          {/* Light sweep animation */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 group-hover:animate-[sweep_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] -translate-x-full pointer-events-none" />

          {/* Top & Bottom rim lights */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" />
          <div className="absolute bottom-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-teal-400/20 to-transparent opacity-50" />

          {/* Text Content */}
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <h3 className="text-[10px] sm:text-xs font-display font-bold uppercase tracking-[0.25em] text-purple-200">
                Prize Pool
              </h3>
            </div>
          </div>

          {/* The Money Element */}
          <div className="relative z-20 flex justify-center items-center">
            {/* Outer glow container */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-teal-500/30 blur-2xl rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative flex items-center gap-4 sm:gap-6 bg-white/[0.03] border border-white/10 px-6 sm:px-10 py-5 sm:py-6 rounded-[1.25rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl group-hover:bg-white/[0.05] group-hover:border-white/20 transition-all duration-500">
              
              {/* 3D Coin/Medallion */}
              <m.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.6),0_0_30px_rgba(45,212,191,0.3)]"
              >
                {/* Outer metallic rim */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-emerald-400 to-teal-500 opacity-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.5)]" />
                
                {/* Inner embossed face */}
                <div className="relative w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#1b102b] to-[#0d2224] flex items-center justify-center shadow-[inset_0_-3px_5px_rgba(255,255,255,0.15),inset_0_3px_6px_rgba(0,0,0,0.7),0_3px_5px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute -top-1 -left-1 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
                  
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 font-black text-2xl sm:text-3xl relative z-10 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)] mt-[1px]">
                    ₹
                  </span>
                </div>
              </m.div>

              {/* Amount */}
              <div className="flex items-center">
                <span className="text-[2.75rem] leading-none sm:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-50 to-teal-200 drop-shadow-[0_0_25px_rgba(45,212,191,0.5)] tracking-tight">
                  15k
                </span>
              </div>
              
              {/* Sparkle SVG */}
              <m.div 
                animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 text-teal-300 drop-shadow-[0_0_12px_rgba(45,212,191,1)]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </m.div>

            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
}
