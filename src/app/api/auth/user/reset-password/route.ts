import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { requireAuth, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await requireAuth(req, 'user');
    
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const team = await Team.findById(payload.teamId);
    
    if (!team || !team.credentials?.passwordHash) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    const isMatch = await comparePassword(currentPassword, team.credentials.passwordHash);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
    }
    
    // Update only the password fields. A full document save can revalidate
    // unrelated legacy registration fields and prevent a participant from
    // completing an otherwise valid password change.
    const passwordHash = await hashPassword(newPassword);
    await Team.updateOne(
      { _id: team._id },
      {
        $set: {
          'credentials.passwordHash': passwordHash,
          mustResetPassword: false,
        },
        $unset: {
          'credentials.temporaryPassword': 1,
        },
      },
      { runValidators: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
