import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import Certificate from '@/models/Certificate';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');

    const eventId = req.nextUrl.searchParams.get('eventId') || 'GENESIS_2.0';

    const teams = await Team.find({})
      .select('teamName members _id')
      .lean();

    const teamsWithCertificates: { teamId: string; teamName: string; count: number }[] = [];
    const teamsWithoutCertificates: { teamId: string; teamName: string; memberCount: number }[] = [];

    for (const team of teams as any[]) {
      const count = await Certificate.countDocuments({
        teamId: team._id,
        eventId,
      });

      if (count > 0) {
        teamsWithCertificates.push({
          teamId: team._id.toString(),
          teamName: team.teamName,
          count,
        });
      } else {
        teamsWithoutCertificates.push({
          teamId: team._id.toString(),
          teamName: team.teamName,
          memberCount: (team.members || []).length,
        });
      }
    }

    return NextResponse.json({ teamsWithCertificates, teamsWithoutCertificates });
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Insufficient permissions'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Missing teams GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
