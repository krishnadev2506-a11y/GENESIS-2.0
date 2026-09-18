import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { ShieldCheck, Circle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Challenge assignments | Admin' };

export default async function AdminChallengesPage() {
  await connectDB();
  const teams = await Team.find({}, 'teamName featureChallenge situationChallenge').sort({ teamName: 1 }).lean();
  return <div className="space-y-8"><div><h1 className="text-3xl font-display font-bold uppercase tracking-wide text-white">Challenge assignments</h1><p className="mt-2 text-text-muted">Server-saved assignments for every participating team.</p></div><div className="overflow-hidden rounded-2xl border border-glass-border bg-glass"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-glass-border text-xs uppercase tracking-wider text-text-muted"><tr><th className="px-5 py-4">Team</th><th className="px-5 py-4">Phase 1 · Feature</th><th className="px-5 py-4">Phase 2 · Situation</th></tr></thead><tbody className="divide-y divide-glass-border">{teams.map((team: any) => <tr key={team._id.toString()}><td className="px-5 py-4 font-semibold text-white">{team.teamName}</td><td className="px-5 py-4">{team.featureChallenge ? <span className="flex items-center gap-2 text-success"><ShieldCheck className="h-4 w-4" />{team.featureChallenge.title}</span> : <span className="flex items-center gap-2 text-text-muted"><Circle className="h-4 w-4" />Not assigned</span>}</td><td className="px-5 py-4">{team.situationChallenge ? <span className="flex items-center gap-2 text-ion"><ShieldCheck className="h-4 w-4" />{team.situationChallenge.title}</span> : <span className="flex items-center gap-2 text-text-muted"><Circle className="h-4 w-4" />Not assigned</span>}</td></tr>)}</tbody></table></div></div></div>;
}
