import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAuth, generateCredentials, hashPassword } from '@/lib/auth';
import { sendRegistrationConfirmed, sendVerificationConfirmation } from '@/lib/mail';
import mongoose from 'mongoose';

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
    
    // Send email with credentials
    try {
      const allMemberEmails = team.members.map((m: any) => m.email).filter(Boolean);
      
      // Send credentials to team leader/all members
      await sendRegistrationConfirmed(allMemberEmails, team.teamName, username, password);
      
      // Send verification confirmation to all team members
      await sendVerificationConfirmation(allMemberEmails, team.teamName);
    } catch (err) {
      console.error('Failed to send confirmation emails:', err);
    }
    
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
