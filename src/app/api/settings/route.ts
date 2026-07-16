import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Settings contain sensitive data (QR code, email templates, fee amounts)
    // — restrict to admin only.
    await requireAuth(req, 'admin');
    
    // @ts-ignore - mongoose static method typing issues
    const settings = await Settings.getSettings();
    
    return NextResponse.json(settings);
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const body = await req.json();
    
    // @ts-ignore
    const settings = await Settings.getSettings();
    
    Object.keys(body).forEach(key => {
      if ((settings as any)[key] !== undefined) {
        (settings as any)[key] = body[key];
      }
    });
    
    await settings.save();
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
