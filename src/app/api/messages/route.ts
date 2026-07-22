import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import Team from '@/models/Team';
import { requireAuth } from '@/lib/auth';
import { sendAdminMessage, sendAdminMessageBatch } from '@/lib/mail';
import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await requireAuth(req); // Both user and admin
    
    const query: Record<string, unknown> = {};
    
    // If user, only show messages targeted to them or broadcast
    if (payload.role === 'user') {
      const team = await Team.findById(payload.teamId).select('members.email').lean();
      const memberEmails = team?.members?.map((m: any) => m.email) || [];
      query.$or = [
        { scope: 'broadcast' },
        { scope: 'team', targetTeamId: new mongoose.Types.ObjectId(payload.teamId) },
        { scope: 'participant', targetParticipantEmail: { $in: memberEmails } }
      ];
    }
    
    const messages = await Message.find(query)
      .sort({ sentAt: -1 })
      .lean()
      .populate('sentByAdminId', 'name email');
      
    return NextResponse.json(messages);
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.error('Messages GET error:', error);
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await requireAuth(req, 'admin');
    
    const body = await req.json();
    const { scope, targetTeamId, targetParticipantEmail, subject, body: messageBody, sendEmail } = body;
    
    if (!subject || !messageBody) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    if (!['broadcast', 'team', 'participant'].includes(scope)) {
      return NextResponse.json({ error: 'Invalid scope. Must be: broadcast, team, or participant' }, { status: 400 });
    }

    if (scope === 'team' && !targetTeamId) {
      return NextResponse.json({ error: 'targetTeamId is required for team scope' }, { status: 400 });
    }

    if (scope === 'participant' && !targetParticipantEmail) {
      return NextResponse.json({ error: 'targetParticipantEmail is required for participant scope' }, { status: 400 });
    }
    
    const newMessage = await Message.create({
      scope,
      targetTeamId: scope === 'team' ? new mongoose.Types.ObjectId(targetTeamId) : null,
      targetParticipantEmail: scope === 'participant' ? targetParticipantEmail : undefined,
      subject,
      body: messageBody,
      sentByAdminId: new mongoose.Types.ObjectId(payload.id),
    });

    logger.info(`Message created: ${newMessage._id} - Scope: ${scope}`);
    
    // Optional: send email as well
    if (sendEmail) {
      logger.info(`Sending ${scope} message emails...`);
      try {
        if (scope === 'broadcast') {
            const teams = await Team.find({}).select('members.email').lean();
            // Collect all member emails from all confirmed teams, deduplicate
            const emails = Array.from(new Set(teams.flatMap(t => t.members?.map((m: any) => m.email) || []).filter(Boolean)));
            
            logger.info(`Broadcast message: sending to ${emails.length} participants`);
            await sendAdminMessageBatch(emails, subject, messageBody);
            logger.info(`Broadcast message emails sent.`);
        } else if (scope === 'team' && targetTeamId) {
            const team = await Team.findById(targetTeamId).select('members.email teamName').lean();
            if (team && team.members && team.members.length > 0) {
              const allMemberEmails = team.members.map((m: any) => m.email).filter(Boolean);
              logger.info(`Team message: sending to ${allMemberEmails.length} members of team ${team.teamName}`);
              await sendAdminMessageBatch(allMemberEmails, subject, messageBody);
              logger.info(`Team message sent successfully`);
            }
        } else if (scope === 'participant' && targetParticipantEmail) {
            logger.info(`Participant message: sending to ${targetParticipantEmail}`);
            await sendAdminMessage(targetParticipantEmail, subject, messageBody);
            logger.info(`Participant message sent successfully to ${targetParticipantEmail}`);
        }
      } catch (emailError) {
        logger.error(`Failed to send ${scope} message emails:`, emailError);
        // The message is saved, but emailing failed.
        // We can return a partial success or a specific error to the admin.
        return NextResponse.json({ 
          success: false, 
          message: newMessage,
          error: 'Message saved, but failed to send emails. Please check the logs.'
        }, { status: 207 }); // 207 Multi-Status
      }
    }
    
    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error: any) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.error('Messages POST error:', error);
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
