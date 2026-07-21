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
      query.$or = [
        { scope: 'broadcast' },
        { scope: 'team', targetTeamId: new mongoose.Types.ObjectId(payload.teamId) },
        { scope: 'participant', targetParticipantEmail: payload.email }
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
      
      if (scope === 'broadcast') {
        try {
          const teams = await Team.find({ registrationStatus: 'confirmed' }).select('members').lean();
          // Collect all member emails from all confirmed teams, deduplicate
          const emails = Array.from(new Set(teams.flatMap(t => t.members?.map((m: any) => m.email) || []).filter(Boolean)));
          
          logger.info(`Broadcast message: sending to ${emails.length} participants`);
          
          // Use batch sending to avoid rate limits and timeouts during stress testing
          const chunkSize = 100;
          const chunks = [];
          for (let i = 0; i < emails.length; i += chunkSize) {
            chunks.push(emails.slice(i, i + chunkSize));
          }
          
          const promises = chunks.map(chunk => sendAdminMessageBatch(chunk, subject, messageBody));
          const results = await Promise.allSettled(promises);
          
          const succeeded = results.filter(r => r.status === 'fulfilled').length;
          const failed = results.filter(r => r.status === 'rejected').length;
          
          logger.info(`Broadcast email results: ${succeeded} batches succeeded, ${failed} failed`);
        } catch (err) {
          logger.error('Failed to send broadcast emails:', err);
          console.error('Failed to send broadcast emails:', err);
        }
      } else if (scope === 'team' && targetTeamId) {
        try {
          const team = await Team.findById(targetTeamId);
          if (team && team.members && team.members.length > 0) {
            const allMemberEmails = team.members.map((m: any) => m.email).filter(Boolean);
            logger.info(`Team message: sending to ${allMemberEmails.length} members of team ${team.teamName}`);
            await sendAdminMessageBatch(allMemberEmails, subject, messageBody);
            logger.info(`Team message sent successfully`);
          }
        } catch (err) {
          logger.error(`Failed to send team message for team ${targetTeamId}:`, err);
          console.error('Failed to send team message:', err);
        }
      } else if (scope === 'participant' && targetParticipantEmail) {
        try {
          logger.info(`Participant message: sending to ${targetParticipantEmail}`);
          await sendAdminMessage(targetParticipantEmail, subject, messageBody);
          logger.info(`Participant message sent successfully to ${targetParticipantEmail}`);
        } catch (err) {
          logger.error(`Failed to send participant email to ${targetParticipantEmail}:`, err);
          console.error('Failed to send participant email:', err);
        }
      }
    }
    
    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.error('Messages POST error:', error);
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

