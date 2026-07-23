import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import Settings from '@/models/Settings';
import { sendRegistrationReceived, sendAdminRegistrationAlert } from '@/lib/mail';
import { z } from 'zod';
import { teamRegistrationSchema } from '@/lib/validations/team';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }, 'register_api');

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

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = limiter.check(ip);
    
    if (!rateLimitResult.success && process.env.NODE_ENV !== 'development') {
      logger.security('Rate limit exceeded for registration', { ip });
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString() } }
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

    let amountPaid = 0;
    let isEarlyBird = false;
    const settings = await Settings.findOne({});
    const participantCount = validatedData.members.length;

    if (settings?.pricing) {
      const teamKey = `team${participantCount}` as 'team4' | 'team5' | 'team6';
      const pricingObj = settings.pricing[teamKey];
      
      if (pricingObj) {
        if (settings.earlyBirdEnabled) {
          amountPaid = pricingObj.earlyBirdPrice;
          isEarlyBird = true;
        } else {
          amountPaid = pricingObj.normalPrice;
        }
      }
    }
    
    // Create team
    const newTeam = await Team.create({
      ...validatedData,
      paymentStatus: 'pending_verification',
      registrationStatus: 'submitted',
      amountPaid,
      isEarlyBird
    });
    
    // Send emails (await to prevent premature serverless termination)
    try {
      const leader = validatedData.members.find(m => m.isLeader) || validatedData.members[0];
      const leaderEmails = [leader.email].filter(Boolean);
      const leaderNames = [leader.name].filter(Boolean);
      await Promise.allSettled([
        sendRegistrationReceived(leaderEmails, validatedData.teamName, leaderNames),
        sendAdminRegistrationAlert(validatedData.teamName, validatedData.college || 'N/A', validatedData.members.length)
      ]);
      } catch (err) {
        logger.error('Failed to send registration email', err);
      }
      
      logger.info('Team registered successfully', { teamId: newTeam._id, teamName: newTeam.teamName, route: newTeam.route });
      return NextResponse.json({ success: true, teamId: newTeam._id }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
      }
      logger.error('Registration internal error', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
