import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import Team from '@/models/Team';
import { requireAuth } from '@/lib/auth';
import { sendAdminMessage, sendAdminMessageBatch } from '@/lib/mail';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await requireAuth(req); // Both user and admin
    
    const query: Record<string, unknown> = {};
    
    // If user, only show messages targeted to them or broadcast
    if (payload.role === 'user') {
      query.$or = [
        { scope: 'broadcast' },
        { scope: 'team', targetTeamId: new mongoose.Types.ObjectId(payload.teamId) }
      ];
    }
    
    const messages = await Message.find(query)
      .sort({ sentAt: -1 })
      .populate('sentByAdminId', 'name email');
      
    return NextResponse.json(messages);
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
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
    
    const newMessage = await Message.create({
      scope,
      targetTeamId: scope === 'team' ? new mongoose.Types.ObjectId(targetTeamId) : null,
      targetParticipantEmail: scope === 'participant' ? targetParticipantEmail : undefined,
      subject,
      body: messageBody,
      sentByAdminId: new mongoose.Types.ObjectId(payload.id),
    });
    
    // Optional: send email as well
    if (sendEmail) {
      if (scope === 'broadcast') {
        const teams = await Team.find({ registrationStatus: 'confirmed' }).select('email');
        const emails = teams.map(t => t.email);
        
        // Use batch sending to avoid rate limits and timeouts during stress testing
        // Resend allows up to 100 emails per batch
        const chunkSize = 100;
        const chunks = [];
        for (let i = 0; i < emails.length; i += chunkSize) {
          chunks.push(emails.slice(i, i + chunkSize));
        }
        
        try {
          const promises = chunks.map(chunk => sendAdminMessageBatch(chunk, subject, messageBody));
          await Promise.allSettled(promises);
        } catch (err) {
          console.error('Failed to send broadcast emails:', err);
        }
      } else if (scope === 'team' && targetTeamId) {
        const team = await Team.findById(targetTeamId);
        if (team && team.members && team.members.length > 0) {
          try {
            const allMemberEmails = team.members.map((m: any) => m.email).filter(Boolean);
            if (allMemberEmails.length > 0) {
              await sendAdminMessageBatch(allMemberEmails, subject, messageBody);
            }
          } catch (err) {
            console.error('Failed to send admin message:', err);
          }
        }
      } else if (scope === 'participant' && targetParticipantEmail) {
        try {
          await sendAdminMessage(targetParticipantEmail, subject, messageBody);
        } catch (err) {
          console.error('Failed to send participant email:', err);
        }
      }
    }
    
    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

