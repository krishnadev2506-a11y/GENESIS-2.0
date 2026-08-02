'use client';

import { m } from 'framer-motion';
import { Download, FileText, GitBranch, Clock, ShieldCheck, Layers, Award } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export function GuidelinesSection() {
  const highlights = [
    {
      icon: Clock,
      title: 'Official Dev Window',
      detail: 'Commences 01 August 2026 at 10:00 PM IST. Repositories, directories, and code must not exist before this time.',
      accent: 'text-amber-400',
      border: 'border-amber-400/20',
      bg: 'bg-amber-400/10',
    },
    {
      icon: GitBranch,
      title: 'Mandatory Git & GitHub',
      detail: 'Dedicated repo, clean commit history, comprehensive README, .gitignore, and active contributions from all members.',
      accent: 'text-purple-400',
      border: 'border-purple-400/20',
      bg: 'bg-purple-400/10',
    },
    {
      icon: ShieldCheck,
      title: 'Evaluation Philosophy',
      detail: 'Judged on software engineering quality, correctness, security, clean architecture, and technical justification.',
      accent: 'text-emerald-400',
      border: 'border-emerald-400/20',
      bg: 'bg-emerald-400/10',
    },
    {
      icon: Layers,
      title: 'Independent Year Tracks',
      detail: '2nd, 3rd, and 4th year tracks compete strictly within their respective academic years for fair assessment.',
      accent: 'text-blue-400',
      border: 'border-blue-400/20',
      bg: 'bg-blue-400/10',
    },
  ];

  return (
    <section id="guidelines" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="section-glow left-[-6rem] top-[10rem] opacity-50" />
      <div className="section-glow right-[-6rem] bottom-[6rem] opacity-40" />

      <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
        <p className="mb-3 text-xs sm:text-sm uppercase tracking-[0.3em] text-accent-primary font-semibold">
          Official Handbook
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white uppercase tracking-[0.12em]">
          Buildathon Guidelines
        </h2>
        <p className="mt-4 text-base sm:text-lg text-text-muted max-w-2xl mx-auto italic">
          &ldquo;Great software isn&apos;t measured by how many technologies it uses, but by how well it is engineered.&rdquo;
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto">
        <GlassCard className="p-6 sm:p-10 md:p-12 relative overflow-hidden" hoverEffect={false}>
          {/* Header & Download CTA */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-glass-border">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-pulse/20 border border-pulse/30 flex items-center justify-center text-pulse shadow-[0_0_20px_rgba(139,92,246,0.25)] shrink-0">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-wide">
                  Genesis 2.0 Handbook
                </h3>
                <p className="text-sm text-text-muted mt-0.5">
                  Complete technical requirements, track expectations, and evaluation rubric.
                </p>
              </div>
            </div>

            {/* Direct Download Button */}
            <a
              href="/GENESIS_2.0_Buildathon_Guidelines.pdf"
              download="GENESIS_2.0_Buildathon_Guidelines.pdf"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-body font-bold uppercase tracking-[0.16em] text-sm text-white transition-all duration-300 bg-[linear-gradient(135deg,#6d28d9_0%,#a855f7_100%)] border border-[rgba(168,85,247,0.5)] shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-1 shrink-0 w-full sm:w-auto"
            >
              <Download size={18} />
              Download Guidelines (PDF)
            </a>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl bg-void/50 border border-glass-border/70 hover:border-glass-border transition-colors flex flex-col gap-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.border} border ${item.accent}`}>
                      <Icon size={18} />
                    </div>
                    <h4 className="font-display font-bold text-white text-base tracking-wide uppercase">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed pl-1">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer Note inside card */}
          <div className="mt-8 pt-6 border-t border-glass-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted font-mono">
            <span>Official start: 01 Aug 2026, 10:00 PM IST</span>
            <span className="text-pulse-bright font-semibold">Objective: Don&apos;t just build software. Engineer it.</span>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
