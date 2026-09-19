'use client';

import { useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ChallengeSpinWheel } from './ChallengeSpinWheel';

type Phase = 'feature' | 'situation';
interface Assignment {
  title: string; problem: string; mission?: string; specialRequirement?: string; oneLineSolution: string;
  judgeCheck: string; difficulty: number; assignedAt: string; logicalId?: string; before?: string;
  solutionDirection?: string; after?: string; metric?: string; metricExplanation?: string;
}

export function TeamChallengePanel({ initialFeature, initialSituation, phase1Open, phase2Open, featureWheelEntries, situationWheelEntries }: { initialFeature?: Assignment; initialSituation?: Assignment; phase1Open: boolean; phase2Open: boolean; featureWheelEntries?: string[]; situationWheelEntries?: string[] }) {
  const [feature, setFeature] = useState(initialFeature);
  const [situation, setSituation] = useState(initialSituation);
  const [loading, setLoading] = useState<Phase | null>(null);
  const [error, setError] = useState('');
  const pendingSituation = useRef<Assignment | null>(null);

  const beginSpin = (phase: Phase) => { setLoading(phase); setError(''); };
  const request = async (phase: Phase) => {
    const response = await fetch('/api/challenges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phase }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to assign challenge');
    return data.assignment as Assignment;
  };
  const spinFeature = async () => {
    try { setFeature(await request('feature')); }
    catch (err: any) { setError(err.message || 'Unable to assign challenge'); }
    finally { setLoading(null); }
  };
  const prepareSituation = async () => {
    try {
      beginSpin('situation');
      const assignment = await request('situation');
      pendingSituation.current = assignment;
      return assignment.title;
    } catch (err: any) {
      setError(err.message || 'Unable to assign challenge');
      setLoading(null);
      return null;
    }
  };
  const finishSituation = async () => {
    if (pendingSituation.current) setSituation(pendingSituation.current);
    pendingSituation.current = null;
    setLoading(null);
  };

  const detail = (heading: string, value?: string) => value ? <div><h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{heading}</h3><p className="mt-1 text-white/85">{value}</p></div> : null;
  const renderPhase = (phase: Phase, assignment?: Assignment) => {
    const isFeature = phase === 'feature';
    const label = isFeature ? 'Phase 1 · Feature challenge' : 'Phase 2 · Situation challenge';
    const accent = isFeature ? 'border-pulse/30 bg-pulse/5' : 'border-ion/30 bg-ion/5';
    const selectionOpen = isFeature ? phase1Open : phase2Open;
    const wheelEntries = isFeature ? featureWheelEntries : situationWheelEntries;
    if (!assignment) return <section className={`rounded-2xl border ${accent} p-6`}><p className="text-xs font-mono uppercase tracking-[.14em] text-text-muted">{label}</p><h2 className="mt-2 text-xl font-display font-bold text-white">{selectionOpen ? 'Ready to spin' : 'Selection is closed'}</h2><p className="mt-2 text-sm text-text-muted">{selectionOpen ? 'Your team can generate this assignment once. The result is saved permanently.' : 'Challenge selection will be opened by the event administrators.'}</p><ChallengeSpinWheel phase={phase} entries={wheelEntries} disabled={loading !== null || !selectionOpen} onSpinStart={() => isFeature && beginSpin('feature')} prepareSpin={isFeature ? undefined : prepareSituation} onSpinComplete={isFeature ? spinFeature : finishSituation} /></section>;
    if (!isFeature) return <section className={`rounded-2xl border ${accent} p-6`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-mono uppercase tracking-[.14em] text-text-muted">Phase 2 · Situation challenge</p><h2 className="mt-2 text-2xl font-display font-bold text-white">{assignment.title}</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">Hardness {assignment.difficulty} / 10</span></div><div className="mt-5 space-y-4 text-sm leading-relaxed">{detail('Situation', assignment.problem)}{detail('Challenge', assignment.mission)}<div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-white/10 bg-black/10 p-4">{detail('Before', assignment.before)}</div><div className="rounded-xl border border-white/10 bg-black/10 p-4">{detail('After', assignment.after)}</div></div>{detail('Your change', assignment.solutionDirection || assignment.specialRequirement)}{detail('Measure', assignment.metric || assignment.oneLineSolution)}{assignment.metricExplanation && <p className="-mt-2 text-xs text-text-muted">{assignment.metricExplanation}</p>}{detail('Judge check', assignment.judgeCheck)}</div><p className="mt-5 flex items-center gap-2 text-xs text-success"><ShieldCheck className="h-4 w-4" />Saved and locked on {new Date(assignment.assignedAt).toLocaleString()}</p></section>;
    return <section className={`rounded-2xl border ${accent} p-6`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-mono uppercase tracking-[.14em] text-text-muted">{label}</p><h2 className="mt-2 text-2xl font-display font-bold text-white">{assignment.title}</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{assignment.difficulty} / 10</span></div><div className="mt-5 space-y-4 text-sm leading-relaxed">{detail('Problem', assignment.problem)}{detail('Special requirement', assignment.specialRequirement || assignment.mission)}{detail('One-line solution', assignment.oneLineSolution)}{detail('Judge check', assignment.judgeCheck)}</div><p className="mt-5 flex items-center gap-2 text-xs text-success"><ShieldCheck className="h-4 w-4" />Saved and locked on {new Date(assignment.assignedAt).toLocaleString()}</p></section>;
  };

  return <div className="space-y-6"><div><h1 className="text-3xl font-display font-bold text-white">Your challenges</h1><p className="mt-2 text-text-muted">Spin each phase once. Your result is secured by the event server.</p></div>{error && <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}<div className="grid gap-6 lg:grid-cols-2">{renderPhase('feature', feature)}{renderPhase('situation', situation)}</div></div>;
}
