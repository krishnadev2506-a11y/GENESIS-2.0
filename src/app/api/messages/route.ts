import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import Team from '@/models/Team';
import { requireAuth } from '@/lib/auth';
import { sendAdminMessage } from '@/lib/mail';
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
    const { scope, targetTeamId, subject, body: messageBody, sendEmail } = body;
    
    if (!subject || !messageBody) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }
    
    const newMessage = await Message.create({
      scope,
      targetTeamId: scope === 'team' ? new mongoose.Types.ObjectId(targetTeamId) : null,
      subject,
      body: messageBody,
      sentByAdminId: new mongoose.Types.ObjectId(payload.id),
    });
    
    // Optional: send email as well
    if (sendEmail) {
      if (scope === 'broadcast') {
        const teams = await Team.find({ registrationStatus: 'confirmed' }).select('email');
        const emails = teams.map(t => t.email);
        
        // In a real app, you might want to batch these or use a mailing list
        // For now, we'll send individually
        // Await all emails using Promise.allSettled to ensure serverless doesn't terminate early
        const promises = emails.map(email => sendAdminMessage(email, subject, messageBody));
        await Promise.allSettled(promises);
      } else if (scope === 'team' && targetTeamId) {
        const team = await Team.findById(targetTeamId);
        if (team) {
          try {
            await sendAdminMessage(team.email, subject, messageBody);
          } catch (err) {
            console.error('Failed to send admin message:', err);
          }
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

