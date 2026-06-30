import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import Settings from '@/models/Settings';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');

    const settings = await Settings.getSettings();

    const [
      totalTeams,
      pendingVerification,
      verified,
      rejected,
      checkedIn,
      teamsWithMembers
    ] = await Promise.all([
      Team.countDocuments(),
      Team.countDocuments({ paymentStatus: 'pending_verification' }),
      Team.countDocuments({ paymentStatus: 'verified' }),
      Team.countDocuments({ paymentStatus: 'rejected' }),
      Team.countDocuments({ checkedIn: true }),
      Team.find({}, { members: 1, paymentStatus: 1 })
    ]);

    let totalParticipants = 0;
    let totalRevenue = 0;

    teamsWithMembers.forEach(team => {
      const numMembers = team.members ? team.members.length : 0;
      totalParticipants += numMembers;

      if (team.paymentStatus === 'verified') {
        const extraMembers = Math.max(0, numMembers - settings.baseTeamSize);
        totalRevenue += settings.entryFee + (extraMembers * settings.extraMemberFee);
      }
    });

    return NextResponse.json({
      totalTeams,
      totalParticipants,
      totalRevenue,
      pendingVerification,
      verified,
      rejected,
      checkedIn
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
