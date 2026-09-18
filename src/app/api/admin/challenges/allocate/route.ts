import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import { drawFairChallenge } from '@/lib/challenge-catalog';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    const { teamId, phase } = await req.json();
    if (!teamId || (phase !== 'feature' && phase !== 'situation')) return NextResponse.json({ error: 'Invalid allocation request' }, { status: 400 });
    const field = phase === 'feature' ? 'featureChallenge' : 'situationChallenge';
    const team = await Team.findById(teamId, 'teamName projectIdea featureChallenge situationChallenge').lean();
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    if ((team as any)[field]) return NextResponse.json({ error: 'This team already has an allocation for this phase' }, { status: 409 });
    const selected = await drawFairChallenge(phase, team, true);
    const assignment = { id: selected._id.toString(), title: selected.title, problem: selected.problem, mission: selected.mission, specialRequirement: selected.specialRequirement, oneLineSolution: selected.oneLineSolution, judgeCheck: selected.judgeCheck, difficulty: selected.difficulty, assignedAt: new Date() };
    const updated = await Team.findOneAndUpdate({ _id: teamId, [field]: { $exists: false } }, { $set: { [field]: assignment } }, { new: true, projection: { teamName: 1, [field]: 1 } }).lean();
    if (!updated) return NextResponse.json({ error: 'Allocation was updated by another administrator. Refresh and try again.' }, { status: 409 });
    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    if (['Authentication required', 'Insufficient permissions'].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error('Emergency challenge allocation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
