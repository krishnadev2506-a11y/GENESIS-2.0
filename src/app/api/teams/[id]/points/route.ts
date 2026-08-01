import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

const STATION_KEYS = [
  'debugArena',
  'systemDesignSprint',
  'codeReviewChallenge',
  'aiEngineeringChallenge',
  'deploymentSprint',
] as const;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('genesis_token')?.value || cookieStore.get('genesis_admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    // Support both legacy single-points update and new per-station update
    if (typeof body.points === 'number') {
      // Legacy: set scoreboardPoints directly
      const updatedTeam = await Team.findByIdAndUpdate(
        id,
        { scoreboardPoints: body.points },
        { returnDocument: 'after' }
      );
      if (!updatedTeam) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, team: updatedTeam });
    }

    // New: per-station scores
    const { stationScores } = body;
    if (!stationScores || typeof stationScores !== 'object') {
      return NextResponse.json({ error: 'stationScores object is required' }, { status: 400 });
    }

    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Build update object — only update the 5 allowed station keys
    const updateObj: Record<string, number> = {};
    let totalPoints = 0;

    for (const key of STATION_KEYS) {
      const value = stationScores[key];
      if (value !== undefined) {
        if (typeof value !== 'number' || value < 0) {
          return NextResponse.json({ error: `Invalid score for ${key}: must be a non-negative number` }, { status: 400 });
        }
        updateObj[`stationScores.${key}`] = value;
      }
    }

    // Re-read all station scores after applying updates to compute total
    const currentScores = team.stationScores || {
      debugArena: 0, systemDesignSprint: 0, codeReviewChallenge: 0,
      aiEngineeringChallenge: 0, deploymentSprint: 0,
    };

    for (const key of STATION_KEYS) {
      if (updateObj[`stationScores.${key}`] !== undefined) {
        totalPoints += updateObj[`stationScores.${key}`];
      } else {
        totalPoints += (currentScores as any)[key] || 0;
      }
    }

    updateObj['scoreboardPoints'] = totalPoints;

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (error: any) {
    console.error('Failed to update points:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

