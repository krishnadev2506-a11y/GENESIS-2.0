import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';
const rateLimit = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const limit = rateLimit.get(ip);
    
    if (limit && now < limit.resetTime) {
      if (limit.count >= 5) {
        return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
      }
      limit.count++;
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    }

    await connectDB();
    
    const body = await req.json();
    const loginSchema = z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
    });

    let username, password;
    try {
      const parsed = loginSchema.parse(body);
      username = parsed.username;
      password = parsed.password;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const team = await Team.findOne({ 'credentials.username': username });
    
    if (!team || !team.credentials?.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const isMatch = await comparePassword(password, team.credentials.passwordHash);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = signToken({ id: team._id.toString(), role: 'user', teamId: team._id.toString() });
    
    const response = NextResponse.json({ 
      success: true,
      mustResetPassword: team.mustResetPassword
    });
    
    setAuthCookie(response, token);
    
    return response;
  } catch (error) {
    console.error('User login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
