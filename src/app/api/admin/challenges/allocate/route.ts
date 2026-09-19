import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import { drawFairChallenge } from '@/lib/challenge-catalog';
import { getPhase1Assignment } from '@/data/phase1-assignments';

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

    let assignment: Record<string, any>;

    if (phase === 'feature') {
      // Phase 1: use the fixed team→challenge assignment map
      const assigned = getPhase1Assignment(team.teamName);
      if (!assigned) return NextResponse.json({ error: 'Assignment not found for this team.' }, { status: 404 });
      assignment = { id: `phase1-${team.teamName}`, title: assigned.title, problem: assigned.problem, mission: '', specialRequirement: '', oneLineSolution: assigned.problem, judgeCheck: '', difficulty: assigned.difficulty, assignedAt: new Date() };
    } else {
      // Phase 2: use existing fair-draw logic (unchanged)
      const selected = await drawFairChallenge(phase, team, true);
      assignment = { id: selected._id.toString(), title: selected.title, problem: selected.problem, mission: selected.mission, specialRequirement: selected.specialRequirement, oneLineSolution: selected.oneLineSolution, judgeCheck: selected.judgeCheck, difficulty: selected.difficulty, logicalId: selected.logicalId, before: selected.before, solutionDirection: selected.solutionDirection, after: selected.after, metric: selected.metric, metricExplanation: selected.metricExplanation, category: selected.category, assignedAt: new Date() };
    }

    const updated = await Team.findOneAndUpdate({ _id: teamId, [field]: { $exists: false } }, { $set: { [field]: assignment } }, { new: true, projection: { teamName: 1, [field]: 1 } }).lean();
    if (!updated) return NextResponse.json({ error: 'Allocation was updated by another administrator. Refresh and try again.' }, { status: 409 });
    return NextResponse.json({ success: true, assignment });
  } catch (error: any) {
    if (['Authentication required', 'Insufficient permissions'].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error('Emergency challenge allocation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
