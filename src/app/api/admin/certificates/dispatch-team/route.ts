import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Certificate from '@/models/Certificate';
import Team from '@/models/Team';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');

    const body = await req.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    // Verify team exists
    const team = await Team.findById(teamId).select('teamName').lean();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const readyCerts = await Certificate.find({
      teamId,
      status: 'ready',
    });

    if (readyCerts.length === 0) {
      return NextResponse.json(
        {
          error: 'No certificates ready for this team. Upload first.',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    await Promise.all(
      readyCerts.map((cert) => {
        cert.status = 'dispatched';
        cert.dispatchedAt = now;
        return cert.save();
      })
    );

    return NextResponse.json({
      dispatched: readyCerts.length,
      teamName: (team as any).teamName,
    });
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Insufficient permissions'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Dispatch team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
