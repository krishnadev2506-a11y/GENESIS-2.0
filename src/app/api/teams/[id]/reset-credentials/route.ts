import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAuth, generateCredentials, hashPassword } from '@/lib/auth';
import { sendTeamCredentials } from '@/lib/mail';
import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

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
    
    // Preserve existing username if already assigned, otherwise generate one
    const username = team.credentials?.username || generateCredentials(team.teamName).username;
    const { password } = generateCredentials(team.teamName);
    const passwordHash = await hashPassword(password);

    // Update team credentials
    team.credentials = { username, passwordHash, temporaryPassword: password };
    team.mustResetPassword = true;

    await team.save();

    // Gather all recipient emails (all members + team root email)
    const allMemberEmails = Array.from(
      new Set([...(team.members || []).map((m: any) => m.email), team.email].filter(Boolean))
    );

    let emailResult = { success: false, sentCount: 0, errors: [] as string[] };
    if (allMemberEmails.length > 0) {
      emailResult = await sendTeamCredentials(allMemberEmails, team.teamName, username, password, true);
    } else {
      emailResult.errors.push('No recipient email addresses found on this team record');
      logger.warn(`No email addresses found for team ${team._id} (${team.teamName}) during credential reset.`);
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
    
    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      sentCount: emailResult.sentCount,
      emailErrors: emailResult.errors,
      team
    });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.error('Reset credentials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
