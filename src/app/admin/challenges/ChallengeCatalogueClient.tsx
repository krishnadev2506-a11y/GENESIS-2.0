'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, X, Search, BookOpen, BarChart3 } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/lib/errors';

type Phase = 'feature' | 'situation';
type Challenge = { _id: string; phase: Phase; title: string; problem: string; mission?: string; specialRequirement?: string; oneLineSolution: string; judgeCheck: string; difficulty: number; keywords: string[]; enabled: boolean; usageCount: number };
type Draft = Omit<Challenge, '_id' | 'usageCount'>;
const emptyDraft = (): Draft => ({ phase: 'feature', title: '', problem: '', mission: '', specialRequirement: '', oneLineSolution: '', judgeCheck: '', difficulty: 5, keywords: [], enabled: true });

export default function ChallengeCatalogueClient() {
  const [items, setItems] = useState<Challenge[]>([]);
  const [phase, setPhase] = useState<Phase>('feature');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/challenges');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load challenge catalogue');
      setItems(data.challenges);
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
  const filtered = items.filter((item) => item.phase === phase && `${item.title} ${item.problem} ${item.keywords.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const usage = filtered.reduce((total, item) => total + item.usageCount, 0);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="flex items-center gap-3 text-3xl font-display font-bold text-white"><BookOpen className="text-pulse" />Challenge Catalogue</h1><p className="mt-2 max-w-3xl text-sm text-text-muted">Manage the live challenge pool. Allocations prefer the least-used active challenge; matching keywords give a small, deterministic fit preference for a team name or saved project idea.</p></div><div className="rounded-xl border border-ion/25 bg-ion/10 px-4 py-3 text-sm text-ion"><BarChart3 className="mr-2 inline h-4 w-4" />{usage} assignments across this view</div></div>
    {error && <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
    <div className="flex flex-wrap gap-3"><button onClick={() => { setPhase('feature'); reset(); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${phase === 'feature' ? 'bg-pulse text-white' : 'bg-white/5 text-text-muted'}`}>Phase 1 · Features</button><button onClick={() => { setPhase('situation'); reset(); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${phase === 'situation' ? 'bg-ion text-void' : 'bg-white/5 text-text-muted'}`}>Phase 2 · Situations</button></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass/30"><div className="flex flex-col gap-3 border-b border-glass-border p-5 sm:flex-row sm:items-center sm:justify-between"><div className="font-display text-lg font-bold text-white">{filtered.length} challenges</div><label className="flex items-center gap-2 rounded-lg border border-glass-border bg-void/50 px-3 py-2 text-text-muted"><Search className="h-4 w-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search challenges" className="w-full bg-transparent text-sm text-white outline-none" /></label></div>{loading ? <p className="p-10 text-text-muted">Loading catalogue…</p> : <div className="divide-y divide-glass-border">{filtered.map((item) => <article key={item._id} className="p-5"><div className="flex gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-bold text-white">{item.title}</h2><span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{item.difficulty}/10</span><span className={`rounded-full px-2 py-0.5 text-xs ${item.enabled ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{item.enabled ? 'Active' : 'Disabled'}</span><span className="rounded-full bg-pulse/10 px-2 py-0.5 text-xs text-pulse">Used {item.usageCount}×</span></div><p className="mt-2 text-sm leading-relaxed text-text-muted">{item.problem}</p><p className="mt-3 text-xs text-text-muted">Keywords: {item.keywords.join(', ') || 'Automatic'}</p></div><div className="flex h-fit gap-1"><button aria-label={`Edit ${item.title}`} onClick={() => beginEdit(item)} className="rounded-lg p-2 text-text-muted hover:bg-white/10 hover:text-white"><Pencil className="h-4 w-4" /></button><button aria-label={`Remove ${item.title}`} onClick={() => void remove(item)} className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button></div></div></article>)}{filtered.length === 0 && <p className="p-10 text-center text-text-muted">No challenges match this view.</p>}</div>}</section>
      <aside className="h-fit rounded-2xl border border-glass-border bg-glass/30 p-5"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg font-bold text-white">{editing ? 'Edit challenge' : 'Add challenge'}</h2>{editing && <button onClick={reset} className="rounded-lg p-2 text-text-muted hover:text-white"><X className="h-4 w-4" /></button>}</div><form onSubmit={save} className="space-y-3"><Field label="Title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} required /><Field label="Problem" value={draft.problem} multiline onChange={(value) => setDraft({ ...draft, problem: value })} required /><Field label={phase === 'feature' ? 'Special requirement' : 'Mission'} value={phase === 'feature' ? draft.specialRequirement || '' : draft.mission || ''} multiline onChange={(value) => setDraft(phase === 'feature' ? { ...draft, specialRequirement: value } : { ...draft, mission: value })} /><Field label="One-line solution" value={draft.oneLineSolution} multiline onChange={(value) => setDraft({ ...draft, oneLineSolution: value })} required /><Field label="Judge check" value={draft.judgeCheck} multiline onChange={(value) => setDraft({ ...draft, judgeCheck: value })} required /><label className="block text-sm text-text-muted">Difficulty <input type="number" min="1" max="10" value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-glass-border bg-void/50 px-3 py-2 text-white outline-none" /></label><Field label="Matching keywords, comma separated" value={draft.keywords.join(', ')} onChange={(value) => setDraft({ ...draft, keywords: value.split(',').map((word) => word.trim().toLowerCase()).filter(Boolean) })} /><label className="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />Available for new allocations</label><button disabled={saving} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-pulse px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{saving ? 'Saving…' : editing ? 'Save changes' : 'Add challenge'}</button></form></aside>
    </div>
  </div>;
}

function Field({ label, value, onChange, multiline = false, required = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; required?: boolean }) {
  const base = 'mt-1 w-full rounded-lg border border-glass-border bg-void/50 px-3 py-2 text-sm text-white outline-none focus:border-pulse';
  return <label className="block text-sm text-text-muted">{label}{multiline ? <textarea required={required} value={value} onChange={(e) => onChange(e.target.value)} className={`${base} min-h-20 resize-y`} /> : <input required={required} value={value} onChange={(e) => onChange(e.target.value)} className={base} />}</label>;
}
