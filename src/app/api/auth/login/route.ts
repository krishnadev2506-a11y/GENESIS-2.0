import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import Team from '@/models/Team';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // Use x-forwarded-for or fall back to a generic key to rate limit by IP.
    // Take only the first IP if there are multiple (proxy chain).
    const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
    
    const { allowed, remaining, resetAt } = await checkRateLimit(
      `login:${ip}`,
      { maxRequests: 5, windowMs: 15 * 60 * 1000 } // 5 attempts per 15 minutes
    );

    if (!allowed) {
      const retryAfterSecs = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSecs),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toISOString(),
          },
        }
      );
    }

    await connectDB();
    
    const body = await req.json();
    const loginSchema = z.object({
      identifier: z.string().min(1, 'Identifier is required').max(200),
      password: z.string().min(1, 'Password is required').max(200),
    });

    let identifier, password;
    try {
      const parsed = loginSchema.parse(body);
      identifier = parsed.identifier;
      password = parsed.password;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Try Admin Login First
    const admin = await AdminUser.findOne({ email: identifier });
    
    if (admin) {
      const isMatch = await comparePassword(password, admin.passwordHash);
      if (isMatch) {
        const token = signToken({ id: admin._id.toString(), role: 'admin' });
        const response = NextResponse.json(
          { success: true, redirect: '/admin' },
          { headers: { 'X-RateLimit-Remaining': String(remaining) } }
        );
        setAuthCookie(response, token);
        return response;
      }
    }

    // Try Team Login
    const team = await Team.findOne({
      $or: [
        { 'credentials.username': identifier },
        { email: identifier }
      ]
    });
    
    if (team && team.credentials?.passwordHash) {
      const isMatch = await comparePassword(password, team.credentials.passwordHash);
      if (isMatch) {
        const token = signToken({ id: team._id.toString(), role: 'user', teamId: team._id.toString() });
        const redirect = team.mustResetPassword ? '/dashboard/reset-password' : '/dashboard';
        const response = NextResponse.json(
          { success: true, redirect, mustResetPassword: team.mustResetPassword },
          { headers: { 'X-RateLimit-Remaining': String(remaining) } }
        );
        setAuthCookie(response, token);
        return response;
      }
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Unified login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
