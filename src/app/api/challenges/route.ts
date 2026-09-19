import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import { type ChallengePhase } from '@/lib/challenge-distributor';
import { drawFairChallenge } from '@/lib/challenge-catalog';
import { getPhase1Assignment } from '@/data/phase1-assignments';
import Settings from '@/models/Settings';

const phaseToField = { feature: 'featureChallenge', situation: 'situationChallenge' } as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await connectDB();
    if (auth.role === 'admin') {
      const teams = await Team.find({}, 'teamName featureChallenge situationChallenge').sort({ teamName: 1 }).lean();
      return NextResponse.json({ teams });
    }
    const team = await Team.findById(auth.teamId, 'teamName featureChallenge situationChallenge').lean();
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    return NextResponse.json({ team });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    console.error('Challenge GET error:', error);
    return NextResponse.json({ error: 'Unable to load challenges' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, 'user');
    if (!auth.teamId) return NextResponse.json({ error: 'Team identity is missing' }, { status: 403 });
    const body = await request.json();
    const phase = body?.phase as ChallengePhase;
    if (phase !== 'feature' && phase !== 'situation') return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });

    await connectDB();
    // @ts-ignore
    const settings = await Settings.getSettings();
    const isOpen = phase === 'feature' ? settings.phase1SpinOpen : settings.phase2SpinOpen;
    if (!isOpen) return NextResponse.json({ error: `Phase ${phase === 'feature' ? '1' : '2'} challenge selection is currently closed by the administrators` }, { status: 403 });
    const field = phaseToField[phase];
    const currentTeam = await Team.findById(auth.teamId, 'teamName projectIdea').lean();
    if (!currentTeam) return NextResponse.json({ error: 'Team not found' }, { status: 404 });

    let challenge: Record<string, any>;

    if (phase === 'feature') {
      // Phase 1: use the fixed team→challenge assignment map
      const assigned = getPhase1Assignment(currentTeam.teamName);
      if (!assigned) return NextResponse.json({ error: 'Assignment not found for this team.' }, { status: 404 });
      challenge = {
        id: `phase1-${currentTeam.teamName}`,
        title: assigned.title,
        problem: assigned.problem,
        mission: '',
        specialRequirement: '',
        oneLineSolution: assigned.problem,
        judgeCheck: '',
        difficulty: assigned.difficulty,
        assignedAt: new Date(),
      };
    } else {
      // Phase 2: use existing fair-draw logic (unchanged)
      const selected = await drawFairChallenge(phase, currentTeam);
      challenge = {
        id: selected._id.toString(),
        title: selected.title,
        problem: selected.problem,
        mission: selected.mission,
        specialRequirement: selected.specialRequirement,
        oneLineSolution: selected.oneLineSolution,
        judgeCheck: selected.judgeCheck,
        difficulty: selected.difficulty,
        logicalId: selected.logicalId,
        before: selected.before,
        solutionDirection: selected.solutionDirection,
        after: selected.after,
        metric: selected.metric,
        metricExplanation: selected.metricExplanation,
        category: selected.category,
        assignedAt: new Date(),
      };
    }

    const team = await Team.findOneAndUpdate(
      { _id: auth.teamId, [field]: { $exists: false } },
      { $set: { [field]: challenge } },
      { new: true, projection: { teamName: 1, [field]: 1 } }
    ).lean();

    if (!team) {
      const existing = await Team.findById(auth.teamId, `teamName ${field}`).lean();
      if (!existing) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      return NextResponse.json({ assignment: existing[field], alreadyAssigned: true });
    }
    return NextResponse.json({ assignment: team[field], alreadyAssigned: false });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') return NextResponse.json({ error: 'Not permitted to spin this challenge' }, { status: 403 });
    console.error('Challenge POST error:', error);
    return NextResponse.json({ error: 'Unable to assign challenge' }, { status: 500 });
  }
}
