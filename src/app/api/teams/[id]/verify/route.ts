import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAuth, generateCredentials, hashPassword } from '@/lib/auth';
import { sendTeamCredentials, sendAdminVerificationAlert } from '@/lib/mail';
import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

export async function PATCH(
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
    
    if (team.paymentStatus === 'verified') {
      return NextResponse.json({ error: 'Team is already verified' }, { status: 400 });
    }
    
    const beforeData = team.toObject();
    
    // Fallback for older teams that registered before route was required
    if (!team.route) {
      team.route = 'foundation';
    }
    
    // Generate credentials
    const { username, password } = generateCredentials(team.teamName);
    const passwordHash = await hashPassword(password);
    
    // Update team
    team.paymentStatus = 'verified';
    team.registrationStatus = 'confirmed';
    team.credentials = { username, passwordHash, temporaryPassword: password };
    team.mustResetPassword = true;
    
    await team.save();
    
    // Send email with credentials to all members and team root email
    const allMemberEmails = Array.from(
      new Set([...(team.members || []).map((m: any) => m.email), team.email].filter(Boolean))
    );
    
    // Send emails concurrently (we must await to prevent serverless termination)
    await Promise.allSettled([
      sendTeamCredentials(allMemberEmails, team.teamName, username, password, false),
      sendAdminVerificationAlert(team.teamName)
    ]).then(results => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error(`Failed to send email type ${index === 0 ? 'TeamCredentials' : 'AdminVerificationAlert'} for team ${team._id}:`, result.reason);
        }
      });
    });
    
    // Audit log
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(payload.id),
      action: 'VERIFY_PAYMENT',
      targetCollection: 'Team',
      targetId: team._id,
      before: beforeData,
      after: { ...team.toObject(), credentials: 'REDACTED' },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
