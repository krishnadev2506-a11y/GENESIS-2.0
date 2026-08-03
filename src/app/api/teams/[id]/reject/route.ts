import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAuth } from '@/lib/auth';
import { sendAdminMessageBatch } from '@/lib/mail';
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
    
    let reason = "The payment screenshot uploaded was invalid or unreadable. Please check your transaction details and try again.";
    
    try {
      const body = await req.text();
      if (body) {
        const parsed = JSON.parse(body);
        if (parsed.reason) {
          reason = parsed.reason;
        }
      }
    } catch (e) {
      // Ignore JSON parse errors, just use the default reason
    }
    
    const team = await Team.findById(id);
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    const beforeData = team.toObject();
    
    team.paymentStatus = 'rejected';
    await team.save();
    
    // Send rejection email
    const subject = 'Issue with your GENESIS 2.0 Registration';
    const emailBody = `Hi Team ${team.teamName},\n\nWe encountered an issue while verifying your payment for GENESIS 2.0.\n\nReason: ${reason}\n\nPlease reply to this email or contact the organizers to resolve this issue and complete your registration.\n\nBest regards,\nThe GENESIS 2.0 Team`;
    
    try {
      const allMemberEmails = Array.from(
        new Set(
          [
            ...(team.members || []).map((m: any) => m.email?.trim().toLowerCase()),
            team.email?.trim().toLowerCase(),
          ].filter(Boolean)
        )
      );
      if (allMemberEmails.length > 0) {
        await sendAdminMessageBatch(allMemberEmails, subject, emailBody);
      }
    } catch (err) {
      logger.error('Failed to send rejection email:', err);
    }
    
    // Audit log
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(payload.id),
      action: 'REJECT_PAYMENT',
      targetCollection: 'Team',
      targetId: team._id,
      before: beforeData,
      after: team.toObject(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Reject payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
