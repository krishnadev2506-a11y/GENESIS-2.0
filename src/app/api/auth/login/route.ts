import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
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
      identifier: z.string().min(1, 'Identifier is required'),
      password: z.string().min(1, 'Password is required'),
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
        const response = NextResponse.json({ success: true, redirect: '/admin' });
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
        const response = NextResponse.json({ success: true, redirect, mustResetPassword: team.mustResetPassword });
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
