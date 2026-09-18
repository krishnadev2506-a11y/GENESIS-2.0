import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import { drawChallenge, type ChallengePhase } from '@/lib/challenge-distributor';

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
    const field = phaseToField[phase];
    const challenge = { ...drawChallenge(phase), assignedAt: new Date() };
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
