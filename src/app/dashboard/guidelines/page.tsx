import { GlassCard } from '@/components/ui/GlassCard';
import { FileText, Download, Clock, GitBranch, ShieldCheck, Layers, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Guidelines | GENESIS 2.0',
};

export default function GuidelinesPage() {
  return (
    <div className="space-y-8 relative z-10">
      {/* Header with Download CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-glass-border">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">
            Buildathon Guidelines
          </h1>
          <p className="text-text-muted font-body text-[16px] mt-1">
            Official rules, development windows, track expectations, and evaluation rubric.
          </p>
        </div>
        <a
          href="/GENESIS_2.0_Buildathon_Guidelines.pdf"
          download="GENESIS_2.0_Buildathon_Guidelines.pdf"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold uppercase tracking-[0.14em] text-xs text-white transition-all duration-300 bg-[linear-gradient(135deg,#6d28d9_0%,#a855f7_100%)] border border-[rgba(168,85,247,0.5)] shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 shrink-0 self-start sm:self-auto"
        >
          <Download size={16} />
          Download PDF
        </a>
      </div>

      {/* Philosophy Banner */}
      <GlassCard className="p-6 md:p-8 relative overflow-hidden" hoverEffect={false}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-pulse/20 border border-pulse/30 flex items-center justify-center text-pulse shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-pulse uppercase tracking-[0.2em] font-semibold">Core Principle</div>
            <p className="text-lg md:text-xl font-display font-bold text-white italic">
              &ldquo;Great software isn&apos;t measured by how many technologies it uses, but by how well it is engineered.&rdquo;
            </p>
            <p className="text-sm text-text-muted">
              Don&apos;t just build software. <span className="text-white font-semibold">Engineer it.</span>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Key Quick Facts Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Development Window */}
        <GlassCard className="p-6 flex flex-col justify-between" hoverEffect={true}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock size={20} />
              </div>
              <h2 className="font-display font-bold text-white text-lg tracking-wide uppercase">
                Official Dev Window
              </h2>
            </div>
            <div className="p-3.5 rounded-xl bg-void/60 border border-amber-500/20 text-amber-300 font-mono text-sm font-bold">
              Official Start: 01 August 2026 — 10:00 PM IST
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              No repositories, local project folders, source code, backend/frontend code, or configs may exist prior to this timestamp. The committee verifies commit & repo creation timestamps.
            </p>
          </div>
        </GlassCard>

        {/* Source Code Management */}
        <GlassCard className="p-6 flex flex-col justify-between" hoverEffect={true}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <GitBranch size={20} />
              </div>
              <h2 className="font-display font-bold text-white text-lg tracking-wide uppercase">
                Mandatory GitHub
              </h2>
            </div>
            <ul className="text-xs text-text-muted space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                <span>Dedicated GitHub repository with clean structure</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                <span>Meaningful commit history from all team members</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                <span>Comprehensive README &amp; proper .gitignore files</span>
              </li>
            </ul>
          </div>
        </GlassCard>
      </div>

      {/* Track Expectations Detailed */}
      <GlassCard className="p-6 md:p-8 space-y-6" hoverEffect={false}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-xl tracking-wide uppercase">
              Track Expectations
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Participants compete only within their academic year for fair assessment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Year */}
          <div className="p-5 rounded-xl bg-void/50 border border-glass-border flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold mb-2">
                Second Year Track
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">
                Software Fundamentals
              </h3>
              <p className="text-xs text-text-muted mb-4">
                Full-stack CRUD, auth, password hashing, DB integration, input validation, responsive UI, Git, env vars, README.
              </p>
            </div>
            <div className="text-[11px] text-emerald-400/80 font-mono bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              Bonus: Deployment, search, pagination, image upload, email verify.
            </div>
          </div>

          {/* 3rd Year */}
          <div className="p-5 rounded-xl bg-void/50 border border-glass-border flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-purple-400 uppercase tracking-wider font-bold mb-2">
                Third Year Track
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">
                Production-Ready Web
              </h3>
              <p className="text-xs text-text-muted mb-4">
                Everything in 2nd year + Cloud DB (Atlas, Supabase, Neon), Cloud Storage (Cloudinary, S3), Docker, JWT/OAuth, Rate Limiting, standard architecture (MVC/Microservices).
              </p>
            </div>
            <div className="text-[11px] text-purple-400/80 font-mono bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
              Cloud deploy: Vercel, Render, Railway.
            </div>
          </div>

          {/* 4th Year */}
          <div className="p-5 rounded-xl bg-void/50 border border-glass-border flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-blue-400 uppercase tracking-wider font-bold mb-2">
                Fourth Year Track
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">
                Cloud &amp; DevOps Scale
              </h3>
              <p className="text-xs text-text-muted mb-4">
                AWS/Cloud infra (EC2, ECS, App Runner), RDS/Aurora, CI/CD GitHub Actions, Secrets management, HTTPS, RBAC, query optimization &amp; caching.
              </p>
            </div>
            <div className="text-[11px] text-blue-400/80 font-mono bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
              Teams must justify architecture &amp; trade-offs.
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Evaluation Rubric & Side Quests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4" hoverEffect={false}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h2 className="font-display font-bold text-white text-lg tracking-wide uppercase">
              Evaluation Rubric
            </h2>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Genesis evaluates software engineering, not technology count. Judges assess:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-white">
            <span className="p-2 rounded-lg bg-void/40 border border-glass-border">✓ Correct implementation</span>
            <span className="p-2 rounded-lg bg-void/40 border border-glass-border">✓ Code quality &amp; structure</span>
            <span className="p-2 rounded-lg bg-void/40 border border-glass-border">✓ Architectural clarity</span>
            <span className="p-2 rounded-lg bg-void/40 border border-glass-border">✓ Security &amp; auth</span>
            <span className="p-2 rounded-lg bg-void/40 border border-glass-border">✓ Deployment stability</span>
            <span className="p-2 rounded-lg bg-void/40 border border-glass-border">✓ Technical justification</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4 flex flex-col justify-between" hoverEffect={false}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <Terminal size={20} />
              </div>
              <h2 className="font-display font-bold text-white text-lg tracking-wide uppercase">
                Surprise Side Quests
              </h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Throughout the event, teams will encounter unannounced side challenges testing adaptability, rapid problem-solving, and communication. Participation adds to your overall evaluation and bonus recognitions!
            </p>
          </div>
          <div className="pt-3 border-t border-glass-border flex items-center justify-between">
            <span className="text-xs text-text-muted font-mono">Need the complete handbook?</span>
            <a
              href="/GENESIS_2.0_Buildathon_Guidelines.pdf"
              download="GENESIS_2.0_Buildathon_Guidelines.pdf"
              className="text-xs font-bold text-pulse hover:text-pulse-bright inline-flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              Download PDF
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
