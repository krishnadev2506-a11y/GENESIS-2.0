import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import Team from '@/models/Team';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
    
    const body = await req.json();
    const loginSchema = z.object({
      identifier: z.string().min(1, 'Identifier is required').max(200),
      password: z.string().min(1, 'Password is required').max(200),
    });

    let identifier, password;
    try {
      const parsed = loginSchema.parse(body);
      identifier = parsed.identifier.trim();
      password = parsed.password.trim();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: (error as any).issues[0].message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // IP-based limit (generous for shared WiFi venues)
    const { allowed: ipAllowed, remaining: ipRemaining, resetAt: ipResetAt } = await checkRateLimit(
      `login_ip:${ip}`,
      { maxRequests: 100, windowMs: 15 * 60 * 1000 } 
    );

    // Identifier-based limit (strict to prevent brute force)
    const { allowed: idAllowed, remaining: idRemaining, resetAt: idResetAt } = await checkRateLimit(
      `login_id:${identifier.toLowerCase()}`,
      { maxRequests: 10, windowMs: 15 * 60 * 1000 } 
    );

    if (!ipAllowed || !idAllowed) {
      const resetAt = !ipAllowed ? ipResetAt : idResetAt;
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
    
    const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Try Admin Login First
    const admin = await AdminUser.findOne({ email: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } });
    
    if (admin) {
      const isMatch = await comparePassword(password, admin.passwordHash);
      if (isMatch) {
        const token = signToken({ id: admin._id.toString(), role: 'admin' });
        const response = NextResponse.json(
          { success: true, redirect: '/admin' },
          { headers: { 'X-RateLimit-Remaining': String(ipRemaining) } }
        );
        setAuthCookie(response, token);
        return response;
      }
    }

    // Try Team Login (matches Team Username, Team Root Email, or any Member Email)
    const team = await Team.findOne({
      $or: [
        { 'credentials.username': { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } },
        { email: { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } },
        { 'members.email': { $regex: new RegExp(`^${escapedIdentifier}$`, 'i') } }
      ]
    }).sort({ 'credentials.passwordHash': -1 });
    
    if (team && team.credentials?.passwordHash) {
      const isMatch = await comparePassword(password, team.credentials.passwordHash);
      if (isMatch) {
        const token = signToken({ id: team._id.toString(), role: 'user', teamId: team._id.toString() });
        const redirect = team.mustResetPassword ? '/dashboard/reset-password' : '/dashboard';
        const response = NextResponse.json(
          { success: true, redirect, mustResetPassword: team.mustResetPassword },
          { headers: { 'X-RateLimit-Remaining': String(ipRemaining) } }
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
