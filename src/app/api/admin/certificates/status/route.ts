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

    const result = await Promise.all(
      teams.map(async (team: any) => {
        const certs = await Certificate.find({
          teamId: team._id,
          eventId,
        })
          .select('memberIndex memberName status dispatchedAt fileUrl')
          .lean();

        const certByIndex: Record<number, any> = {};
        for (const cert of certs) {
          certByIndex[(cert as any).memberIndex] = cert;
        }

        const members = (team.members || []).map((member: any, i: number) => {
          const cert = certByIndex[i];
          return {
            memberIndex: i,
            memberName: member.name,
            status: cert ? cert.status : 'missing',
            dispatchedAt: cert?.dispatchedAt ?? null,
            fileUrl: cert?.fileUrl ?? null,
          };
        });

        return {
          teamId: team._id,
          teamName: team.teamName,
          members,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Insufficient permissions'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Certificates status GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
