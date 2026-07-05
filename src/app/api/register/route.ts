import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { sendRegistrationReceived, sendAdminRegistrationAlert } from '@/lib/mail';
import { z } from 'zod';
import { teamRegistrationSchema } from '@/lib/validations/team';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Validate input using centralized Zod schema
    const validatedData = teamRegistrationSchema.parse(body);
    
    // Check duplicates
    const existingTeam = await Team.findOne({
      teamName: { $regex: new RegExp(`^${validatedData.teamName}$`, 'i') }
    });
    
    if (existingTeam) {
      return NextResponse.json({ error: 'Team name already taken' }, { status: 400 });
    }
    
    // Ensure the old unique email index is dropped so duplicate emails are allowed
    try {
      await Team.collection.dropIndex('email_1');
    } catch (e) {
      // Ignore if index doesn't exist
    }
    
    // Create team
    const newTeam = await Team.create({
      ...validatedData,
      paymentStatus: 'pending_verification',
      registrationStatus: 'submitted',
    });
    
    // Send email (await it to ensure serverless functions don't terminate prematurely)
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
