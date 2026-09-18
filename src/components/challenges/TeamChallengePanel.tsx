'use client';

import { useState } from 'react';
import { Sparkles, ShieldCheck, LoaderCircle } from 'lucide-react';

type Phase = 'feature' | 'situation';
interface Assignment { title: string; problem: string; mission?: string; specialRequirement?: string; oneLineSolution: string; judgeCheck: string; difficulty: number; assignedAt: string; }

export function TeamChallengePanel({ initialFeature, initialSituation }: { initialFeature?: Assignment; initialSituation?: Assignment }) {
  const [feature, setFeature] = useState(initialFeature);
  const [situation, setSituation] = useState(initialSituation);
  const [loading, setLoading] = useState<Phase | null>(null);
  const [error, setError] = useState('');

  const spin = async (phase: Phase) => {
    setLoading(phase); setError('');
    try {
      const response = await fetch('/api/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phase }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to assign challenge');
      if (phase === 'feature') setFeature(data.assignment); else setSituation(data.assignment);
    } catch (err: any) { setError(err.message || 'Unable to assign challenge'); } finally { setLoading(null); }
  };

  const renderPhase = (phase: Phase, assignment?: Assignment) => {
    const isFeature = phase === 'feature';
    const label = isFeature ? 'Phase 1 · Feature challenge' : 'Phase 2 · Situation challenge';
    const accent = isFeature ? 'border-pulse/30 bg-pulse/5' : 'border-ion/30 bg-ion/5';
    if (!assignment) return <section className={`rounded-2xl border ${accent} p-6`}><p className="text-xs font-mono uppercase tracking-[.14em] text-text-muted">{label}</p><h2 className="mt-2 text-xl font-display font-bold text-white">Ready to spin</h2><p className="mt-2 text-sm text-text-muted">Your team can generate this assignment once. The result is saved permanently.</p><button onClick={() => spin(phase)} disabled={loading !== null} className={`mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:opacity-50 ${isFeature ? 'bg-pulse hover:bg-pulse/80' : 'bg-ion text-void hover:bg-ion/80'}`}>{loading === phase ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading === phase ? 'Spinning…' : `Spin ${isFeature ? 'Phase 1' : 'Phase 2'}`}</button></section>;
    return <section className={`rounded-2xl border ${accent} p-6`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-mono uppercase tracking-[.14em] text-text-muted">{label}</p><h2 className="mt-2 text-2xl font-display font-bold text-white">{assignment.title}</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{assignment.difficulty} / 10</span></div><div className="mt-5 space-y-4 text-sm leading-relaxed"><div><h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Problem</h3><p className="mt-1 text-white/85">{assignment.problem}</p></div><div><h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{isFeature ? 'Special requirement' : 'Mission'}</h3><p className="mt-1 text-white/85">{assignment.specialRequirement || assignment.mission}</p></div><div><h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">One-line solution</h3><p className="mt-1 text-white/85">{assignment.oneLineSolution}</p></div><div><h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Judge check</h3><p className="mt-1 text-white/85">{assignment.judgeCheck}</p></div></div><p className="mt-5 flex items-center gap-2 text-xs text-success"><ShieldCheck className="h-4 w-4" />Saved and locked on {new Date(assignment.assignedAt).toLocaleString()}</p></section>;
  };

  return <div className="space-y-6"><div><h1 className="text-3xl font-display font-bold text-white">Your challenges</h1><p className="mt-2 text-text-muted">Spin each phase once. Your result is secured by the event server.</p></div>{error && <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}<div className="grid gap-6 lg:grid-cols-2">{renderPhase('feature', feature)}{renderPhase('situation', situation)}</div></div>;
}
