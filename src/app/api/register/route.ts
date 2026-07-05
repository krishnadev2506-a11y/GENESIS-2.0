import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { sendRegistrationReceived } from '@/lib/mail';
import { z } from 'zod';

const registerSchema = z.object({
  teamName: z.string().min(2).max(50),
  college: z.string().min(2),
  semester: z.string(),
  contactNumber: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  email: z.string().email(),
  foodPreference: z.enum(['veg', 'non-veg']),
  members: z.array(z.object({
    name: z.string().min(2),
    role: z.string(),
    email: z.string().email(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
    college: z.string().min(2),
    semester: z.string(),
    foodPreference: z.enum(['veg', 'non-veg']),
    isLeader: z.boolean(),
  })).min(4).max(6),
  paymentScreenshotUrl: z.string().url(),
  paymentScreenshotPublicId: z.string(),
  transactionId: z.string().min(4),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
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
      await sendRegistrationReceived(allMemberEmails, validatedData.teamName);
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
