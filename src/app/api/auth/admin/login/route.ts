import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';

const rateLimit = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    // Simple rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const limit = rateLimit.get(ip);
    
    if (limit && now < limit.resetTime) {
      if (limit.count >= 5) {
        return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
      }
      limit.count++;
    } else {
      rateLimit.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 mins
    }

    await connectDB();
    
    const body = await req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const admin = await AdminUser.findOne({ email });
    
    if (!admin) {
      console.log('Admin login failed: User not found for email', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const isMatch = await comparePassword(password, admin.passwordHash);
    
    if (!isMatch) {
      console.log('Admin login failed: Password mismatch for email', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = signToken({ id: admin._id.toString(), role: 'admin' });
    const response = NextResponse.json({ success: true });
    
    setAuthCookie(response, token);
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
