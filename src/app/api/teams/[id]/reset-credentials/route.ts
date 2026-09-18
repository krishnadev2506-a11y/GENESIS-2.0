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

    // Update only the fields owned by this action. Calling `team.save()` validates
    // every field in the record, which can block a credential reset for an older
    // otherwise usable registration that has unrelated legacy data.
    await Team.updateOne(
      { _id: team._id },
      {
        $set: {
          credentials: { username, passwordHash, temporaryPassword: password },
          mustResetPassword: true,
        },
      },
      { runValidators: true }
    );
    team.credentials = { username, passwordHash, temporaryPassword: password };
    team.mustResetPassword = true;

    // Gather all recipient emails (all members + team root email), trimmed and deduplicated
    const allMemberEmails = Array.from(
      new Set(
        [
          ...(team.members || []).map((m: any) => m.email?.trim().toLowerCase()),
          team.email?.trim().toLowerCase(),
        ].filter(Boolean)
      )
    );

    let emailResult = { success: false, sentCount: 0, errors: [] as string[] };
    if (allMemberEmails.length > 0) {
      logger.info(`Resetting credentials for team ${team.teamName} and sending to ${allMemberEmails.length} recipient(s): ${allMemberEmails.join(', ')}`);
      try {
        emailResult = await sendTeamCredentials(allMemberEmails, team.teamName, username, password, true);
      } catch (error: any) {
        // The credentials have already been saved. Report an email failure to the
        // admin instead of turning a successful reset into a server error.
        const message = error?.message || 'Unexpected error while sending credentials email';
        logger.error(`Failed to send reset credentials email for team ${team._id}:`, error);
        emailResult.errors.push(message);
      }
    } else {
      emailResult.errors.push('No recipient email addresses found on this team record');
      logger.warn(`No email addresses found for team ${team._id} (${team.teamName}) during credential reset.`);
    }

    // Audit log
    try {
      await AuditLog.create({
        adminId: new mongoose.Types.ObjectId(payload.id),
        action: 'RESET_CREDENTIALS',
        targetCollection: 'Team',
        targetId: team._id,
        before: { credentials: 'REDACTED' },
        after: { credentials: 'REDACTED' },
      });
    } catch (error) {
      // Auditing must not invalidate an already completed credential reset.
      logger.error(`Failed to create reset credentials audit log for team ${team._id}:`, error);
    }
    
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
