import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAuth, generateCredentials, hashPassword } from '@/lib/auth';
import { sendRegistrationConfirmed } from '@/lib/mail';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const payload = await requireAuth(req, 'admin');
    
    const { id } = await params;
    const team = await Team.findById(id);
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    if (team.paymentStatus !== 'verified') {
      return NextResponse.json({ error: 'Team must be verified to have credentials' }, { status: 400 });
    }
    
    const beforeData = team.toObject();
    
    // Generate new credentials
    const { username, password } = generateCredentials(team.teamName);
    const passwordHash = await hashPassword(password);
    
    // Update team
    team.credentials = { username, passwordHash, temporaryPassword: password };
    team.mustResetPassword = true;
    
    await team.save();
    
    // Send email with credentials
    try {
      const allMemberEmails = team.members.map((m: any) => m.email).filter(Boolean);
      await sendRegistrationConfirmed(allMemberEmails, team.teamName, username, password);
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }
    
    // Audit log
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(payload.id),
      action: 'RESET_CREDENTIALS',
      targetCollection: 'Team',
      targetId: team._id,
      before: { credentials: 'REDACTED' },
      after: { credentials: 'REDACTED' },
    });
    
    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Reset credentials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
