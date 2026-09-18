import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Settings from '@/models/Settings';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    const { phase, open } = await req.json();
    if ((phase !== 'feature' && phase !== 'situation') || typeof open !== 'boolean') return NextResponse.json({ error: 'Invalid selection control' }, { status: 400 });
    // @ts-ignore
    const settings = await Settings.getSettings();
    if (phase === 'feature') settings.phase1SpinOpen = open;
    else settings.phase2SpinOpen = open;
    await settings.save();
    return NextResponse.json({ success: true, phase, open });
  } catch (error: any) {
    if (['Authentication required', 'Insufficient permissions'].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error('Challenge selection update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
