'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Search, BookOpen, BarChart3, RotateCcw, MailWarning } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/lib/errors';
import { ChallengeSpinWheel } from '@/components/challenges/ChallengeSpinWheel';

type Phase = 'feature' | 'situation';
type Challenge = { _id: string; phase: Phase; title: string; problem: string; mission?: string; specialRequirement?: string; oneLineSolution: string; judgeCheck: string; difficulty: number; keywords: string[]; enabled: boolean; usageCount: number };
type Draft = Omit<Challenge, '_id' | 'usageCount'>;
type TeamAllocation = { _id: string; teamName: string; projectIdea?: string; featureChallenge?: { title: string; difficulty: number }; situationChallenge?: { title: string; difficulty: number } };
const emptyDraft = (): Draft => ({ phase: 'feature', title: '', problem: '', mission: '', specialRequirement: '', oneLineSolution: '', judgeCheck: '', difficulty: 5, keywords: [], enabled: true });

export default function ChallengeCatalogueClient() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [teams, setTeams] = useState<TeamAllocation[]>([]);
  const [tab, setTab] = useState<'catalogue' | 'overview' | 'emergency'>('catalogue');
  const [phase, setPhase] = useState<Phase>('feature');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/challenges');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load challenge catalogue');
      setItems(data.challenges);
      setTeams(data.teams || []);
    } catch (err) { setError(getFriendlyErrorMessage(err)); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const reset = () => { setEditing(null); setDraft({ ...emptyDraft(), phase }); setError(''); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...draft, keywords: draft.keywords.filter(Boolean) };
      const res = await fetch(editing ? `/api/admin/challenges/${editing}` : '/api/admin/challenges', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save challenge');
      await load(); reset();
    } catch (err) { setError(getFriendlyErrorMessage(err)); } finally { setSaving(false); }
  };
  const remove = async (challenge: Challenge) => {
    if (!window.confirm(`Remove “${challenge.title}” from the catalogue?`)) return;
    try {
      const res = await fetch(`/api/admin/challenges/${challenge._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to remove challenge');
      await load();
    } catch (err) { setError(getFriendlyErrorMessage(err)); }
  };
  const beginEdit = (challenge: Challenge) => { setEditing(challenge._id); setDraft({ phase: challenge.phase, title: challenge.title, problem: challenge.problem, mission: challenge.mission || '', specialRequirement: challenge.specialRequirement || '', oneLineSolution: challenge.oneLineSolution, judgeCheck: challenge.judgeCheck, difficulty: challenge.difficulty, keywords: challenge.keywords, enabled: challenge.enabled }); setError(''); };
  const resetAllocations = async (targetPhase: Phase) => {
    const label = targetPhase === 'feature' ? 'Phase 1 feature' : 'Phase 2 situation';
    if (!window.confirm(`Reset every ${label} allocation? This permanently clears assigned challenges for all teams, allowing them to spin again.`)) return;
    setActionLoading(`reset-${targetPhase}`); setError('');
    try {
      const res = await fetch('/api/admin/challenges/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phase: targetPhase }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to reset allocations');
      await load();
      window.alert(`${data.resetCount} ${label} allocation(s) reset.`);
    } catch (err) { setError(getFriendlyErrorMessage(err)); } finally { setActionLoading(''); }
  };
  const resetAllCredentials = async () => {
    if (!window.confirm('Reset login passwords for every verified team and email the new temporary credentials to all registered participants? Existing participant passwords will stop working immediately.')) return;
    setActionLoading('credentials'); setError('');
    try {
      const res = await fetch('/api/admin/credentials/reset-all', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to reset and email credentials');
      window.alert(`Credentials reset for ${data.teamCount} teams. Email reached ${data.recipients} participant recipient(s); ${data.failedTeams} team delivery attempt(s) failed.`);
    } catch (err) { setError(getFriendlyErrorMessage(err)); } finally { setActionLoading(''); }
  };
  const filtered = items.filter((item) => item.phase === phase && `${item.title} ${item.problem} ${item.keywords.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const usage = filtered.reduce((total, item) => total + item.usageCount, 0);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="flex items-center gap-3 text-3xl font-display font-bold text-white"><BookOpen className="text-pulse" />Challenge Catalogue</h1><p className="mt-2 max-w-3xl text-sm text-text-muted">Manage the live challenge pool. Allocations prefer the least-used active challenge; matching keywords give a small, deterministic fit preference for a team name or saved project idea.</p></div><div className="rounded-xl border border-ion/25 bg-ion/10 px-4 py-3 text-sm text-ion"><BarChart3 className="mr-2 inline h-4 w-4" />{usage} assignments across this view</div></div>
    {error && <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
    <div className="flex flex-wrap gap-2 rounded-xl border border-glass-border bg-glass/30 p-2"><TabButton active={tab === 'catalogue'} onClick={() => setTab('catalogue')}>Catalogue</TabButton><TabButton active={tab === 'overview'} onClick={() => setTab('overview')}>Assignments & teams</TabButton><TabButton active={tab === 'emergency'} onClick={() => setTab('emergency')}>Emergency spin</TabButton></div>
    {tab === 'overview' ? <AllocationOverview teams={teams} /> : tab === 'emergency' ? <EmergencySpin items={items} teams={teams} onComplete={load} onError={setError} /> : <>
    <section className="grid gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-5 lg:grid-cols-3"><div className="lg:col-span-3"><h2 className="font-display text-lg font-bold text-danger">Administrative resets</h2><p className="mt-1 text-sm text-text-muted">These actions affect all teams. Each action asks for confirmation before it runs.</p></div><button onClick={() => void resetAllocations('feature')} disabled={Boolean(actionLoading)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-bold text-danger transition hover:bg-danger/20 disabled:opacity-50"><RotateCcw className="h-4 w-4" />{actionLoading === 'reset-feature' ? 'Resetting…' : 'Reset Phase 1 allocations'}</button><button onClick={() => void resetAllocations('situation')} disabled={Boolean(actionLoading)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm font-bold text-danger transition hover:bg-danger/20 disabled:opacity-50"><RotateCcw className="h-4 w-4" />{actionLoading === 'reset-situation' ? 'Resetting…' : 'Reset Phase 2 allocations'}</button><button onClick={() => void resetAllCredentials()} disabled={Boolean(actionLoading)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-3 text-sm font-bold text-white transition hover:bg-danger/80 disabled:opacity-50"><MailWarning className="h-4 w-4" />{actionLoading === 'credentials' ? 'Sending credentials…' : 'Reset & email all credentials'}</button></section>
    <div className="flex flex-wrap gap-3"><button onClick={() => { setPhase('feature'); reset(); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${phase === 'feature' ? 'bg-pulse text-white' : 'bg-white/5 text-text-muted'}`}>Phase 1 · Features</button><button onClick={() => { setPhase('situation'); reset(); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${phase === 'situation' ? 'bg-ion text-void' : 'bg-white/5 text-text-muted'}`}>Phase 2 · Situations</button></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass/30"><div className="flex flex-col gap-3 border-b border-glass-border p-5 sm:flex-row sm:items-center sm:justify-between"><div className="font-display text-lg font-bold text-white">{filtered.length} challenges</div><label className="flex items-center gap-2 rounded-lg border border-glass-border bg-void/50 px-3 py-2 text-text-muted"><Search className="h-4 w-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search challenges" className="w-full bg-transparent text-sm text-white outline-none" /></label></div>{loading ? <p className="p-10 text-text-muted">Loading catalogue…</p> : <div className="divide-y divide-glass-border">{filtered.map((item) => <article key={item._id} className="p-5"><div className="flex gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-bold text-white">{item.title}</h2><span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{item.difficulty}/10</span><span className={`rounded-full px-2 py-0.5 text-xs ${item.enabled ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{item.enabled ? 'Active' : 'Disabled'}</span><span className="rounded-full bg-pulse/10 px-2 py-0.5 text-xs text-pulse">Used {item.usageCount}×</span></div><p className="mt-2 text-sm leading-relaxed text-text-muted">{item.problem}</p><p className="mt-3 text-xs text-text-muted">Keywords: {item.keywords.join(', ') || 'Automatic'}</p></div><div className="flex h-fit gap-1"><button aria-label={`Edit ${item.title}`} onClick={() => beginEdit(item)} className="rounded-lg p-2 text-text-muted hover:bg-white/10 hover:text-white"><Pencil className="h-4 w-4" /></button><button aria-label={`Remove ${item.title}`} onClick={() => void remove(item)} className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button></div></div></article>)}{filtered.length === 0 && <p className="p-10 text-center text-text-muted">No challenges match this view.</p>}</div>}</section>
      <aside className="h-fit rounded-2xl border border-glass-border bg-glass/30 p-5"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg font-bold text-white">{editing ? 'Edit challenge' : 'Add challenge'}</h2>{editing && <button onClick={reset} className="rounded-lg p-2 text-text-muted hover:text-white"><X className="h-4 w-4" /></button>}</div><form onSubmit={save} className="space-y-3"><Field label="Title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} required /><Field label="Problem" value={draft.problem} multiline onChange={(value) => setDraft({ ...draft, problem: value })} required /><Field label={phase === 'feature' ? 'Special requirement' : 'Mission'} value={phase === 'feature' ? draft.specialRequirement || '' : draft.mission || ''} multiline onChange={(value) => setDraft(phase === 'feature' ? { ...draft, specialRequirement: value } : { ...draft, mission: value })} /><Field label="One-line solution" value={draft.oneLineSolution} multiline onChange={(value) => setDraft({ ...draft, oneLineSolution: value })} required /><Field label="Judge check" value={draft.judgeCheck} multiline onChange={(value) => setDraft({ ...draft, judgeCheck: value })} required /><label className="block text-sm text-text-muted">Difficulty <input type="number" min="1" max="10" value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-glass-border bg-void/50 px-3 py-2 text-white outline-none" /></label><Field label="Matching keywords, comma separated" value={draft.keywords.join(', ')} onChange={(value) => setDraft({ ...draft, keywords: value.split(',').map((word) => word.trim().toLowerCase()).filter(Boolean) })} /><label className="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />Available for new allocations</label><button disabled={saving} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-pulse px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{saving ? 'Saving…' : editing ? 'Save changes' : 'Add challenge'}</button></form></aside>
    </div></>}
  </div>;
}

function Field({ label, value, onChange, multiline = false, required = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; required?: boolean }) {
  const base = 'mt-1 w-full rounded-lg border border-glass-border bg-void/50 px-3 py-2 text-sm text-white outline-none focus:border-pulse';
  return <label className="block text-sm text-text-muted">{label}{multiline ? <textarea required={required} value={value} onChange={(e) => onChange(e.target.value)} className={`${base} min-h-20 resize-y`} /> : <input required={required} value={value} onChange={(e) => onChange(e.target.value)} className={base} />}</label>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? 'bg-pulse text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}>{children}</button>;
}

function AllocationOverview({ teams }: { teams: TeamAllocation[] }) {
  const featureUnassigned = teams.filter((team) => !team.featureChallenge);
  const situationUnassigned = teams.filter((team) => !team.situationChallenge);
  return <section className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Stat label="Phase 1 waiting" value={featureUnassigned.length} /><Stat label="Phase 2 waiting" value={situationUnassigned.length} /></div><div className="overflow-hidden rounded-2xl border border-glass-border bg-glass/30"><div className="border-b border-glass-border p-5"><h2 className="font-display text-xl font-bold text-white">Team allocation overview</h2><p className="mt-1 text-sm text-text-muted">Every team’s current Phase 1 feature and Phase 2 situation assignment.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-glass-border text-xs uppercase tracking-wider text-text-muted"><tr><th className="px-5 py-4">Team</th><th className="px-5 py-4">Project idea</th><th className="px-5 py-4">Phase 1 feature</th><th className="px-5 py-4">Phase 2 situation</th></tr></thead><tbody className="divide-y divide-glass-border">{teams.map((team) => <tr key={team._id}><td className="px-5 py-4 font-semibold text-white">{team.teamName}</td><td className="max-w-64 truncate px-5 py-4 text-text-muted">{team.projectIdea || '—'}</td><td className="px-5 py-4">{team.featureChallenge ? <Assignment title={team.featureChallenge.title} difficulty={team.featureChallenge.difficulty} accent="pulse" /> : <span className="text-danger">Unassigned</span>}</td><td className="px-5 py-4">{team.situationChallenge ? <Assignment title={team.situationChallenge.title} difficulty={team.situationChallenge.difficulty} accent="ion" /> : <span className="text-danger">Unassigned</span>}</td></tr>)}</tbody></table></div></div></section>;
}

function EmergencySpin({ items, teams, onComplete, onError }: { items: Challenge[]; teams: TeamAllocation[]; onComplete: () => Promise<void>; onError: (message: string) => void }) {
  const [phase, setPhase] = useState<Phase>('feature');
  const [teamId, setTeamId] = useState('');
  const [result, setResult] = useState('');
  const unassignedTeams = teams.filter((team) => !(phase === 'feature' ? team.featureChallenge : team.situationChallenge));
  const available = items.filter((item) => item.phase === phase && item.enabled && item.usageCount === 0);
  const selectedTeam = unassignedTeams.find((team) => team._id === teamId) || unassignedTeams[0];
  const allocate = async () => {
    if (!selectedTeam) return;
    setResult(''); onError('');
    try {
      const res = await fetch('/api/admin/challenges/allocate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamId: selectedTeam._id, phase }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to allocate challenge');
      setResult(`${selectedTeam.teamName} received: ${data.assignment.title}`);
      await onComplete();
    } catch (err) { onError(getFriendlyErrorMessage(err)); }
  };
  return <section className="space-y-6"><div><h2 className="font-display text-2xl font-bold text-white">Emergency distribution</h2><p className="mt-1 text-sm text-text-muted">Use this only when a participant cannot access their own wheel. It uses only currently unallocated entries, preserving the fairest remaining pool.</p></div><div className="flex gap-2"><TabButton active={phase === 'feature'} onClick={() => { setPhase('feature'); setTeamId(''); setResult(''); }}>Phase 1 feature wheel</TabButton><TabButton active={phase === 'situation'} onClick={() => { setPhase('situation'); setTeamId(''); setResult(''); }}>Phase 2 situation wheel</TabButton></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="rounded-2xl border border-glass-border bg-glass/30 p-6"><label className="block text-sm text-text-muted">Unassigned team<select value={selectedTeam?._id || ''} onChange={(event) => setTeamId(event.target.value)} className="mt-2 w-full rounded-lg border border-glass-border bg-void/50 px-3 py-2 text-white outline-none"><option value="">Select a team</option>{unassignedTeams.map((team) => <option key={team._id} value={team._id}>{team.teamName}</option>)}</select></label><ChallengeSpinWheel phase={phase} entries={available.map((item) => item.title)} disabled={!selectedTeam || available.length === 0} onSpinStart={() => setResult('')} onSpinComplete={allocate} />{result && <p className="mt-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{result}</p>}</div><div className="rounded-2xl border border-glass-border bg-glass/30 p-5"><h3 className="font-display text-lg font-bold text-white">Unallocated {phase === 'feature' ? 'features' : 'situations'} ({available.length})</h3><div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto pr-1">{available.map((item) => <article key={item._id} className="rounded-xl border border-glass-border bg-void/30 p-3"><p className="font-semibold text-white">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-text-muted">{item.problem}</p></article>)}{available.length === 0 && <p className="text-sm text-text-muted">No unallocated entries remain for this phase.</p>}</div></div></div></section>;
}

function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-danger/25 bg-danger/5 p-5"><p className="text-sm text-text-muted">{label}</p><p className="mt-2 text-3xl font-display font-bold text-danger">{value}</p></div>; }
function Assignment({ title, difficulty, accent }: { title: string; difficulty: number; accent: 'pulse' | 'ion' }) { return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accent === 'pulse' ? 'bg-pulse/10 text-pulse' : 'bg-ion/10 text-ion'}`}><span>{title}</span><span>{difficulty}/10</span></span>; }
