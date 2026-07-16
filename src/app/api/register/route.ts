import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { sendRegistrationReceived, sendAdminRegistrationAlert } from '@/lib/mail';
import { z } from 'zod';
import { teamRegistrationSchema } from '@/lib/validations/team';

// Max request body size: 1MB. Prevents memory exhaustion from huge payloads.
const MAX_BODY_BYTES = 1 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    // Guard against oversized payloads before reading the body
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Request payload is too large.' },
        { status: 413 }
      );
    }

    await connectDB();
    
    const body = await req.json();
    
    // Validate input using centralized Zod schema
    const validatedData = teamRegistrationSchema.parse(body);
    
    // Check for duplicate team name (case-insensitive)
    const existingTeam = await Team.findOne({
      teamName: { $regex: new RegExp(`^${validatedData.teamName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already taken. Please choose a different name.' }, { status: 400 });
    }
    
    // Create team
    const newTeam = await Team.create({
      ...validatedData,
      paymentStatus: 'pending_verification',
      registrationStatus: 'submitted',
    });
    
    // Send emails (await to prevent premature serverless termination)
    try {
      const allMemberEmails = validatedData.members.map(m => m.email).filter(Boolean);
      await Promise.allSettled([
        sendRegistrationReceived(allMemberEmails, validatedData.teamName),
        sendAdminRegistrationAlert(validatedData.teamName, validatedData.college, validatedData.members.length)
      ]);
    } catch (err) {
      console.error('Failed to send registration email:', err);
    }
    
    return NextResponse.json({ success: true, teamId: newTeam._id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
