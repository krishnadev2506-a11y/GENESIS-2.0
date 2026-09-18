import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const admin = await requireAuth(req, 'admin');
    const body = await req.json();
    if (body.phase !== 'feature' && body.phase !== 'situation') return NextResponse.json({ error: 'Invalid challenge phase' }, { status: 400 });
    const field = body.phase === 'feature' ? 'featureChallenge' : 'situationChallenge';
    const result = await Team.updateMany({ [field]: { $exists: true } }, { $unset: { [field]: 1 } });
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(admin.id), action: body.phase === 'feature' ? 'RESET_FEATURE_ALLOCATIONS' : 'RESET_SITUATION_ALLOCATIONS',
      targetCollection: 'Team', targetId: new mongoose.Types.ObjectId(admin.id), before: { assignedCount: result.modifiedCount }, after: { assignedCount: 0 },
    });
    return NextResponse.json({ success: true, resetCount: result.modifiedCount });
  } catch (error: any) {
    if (['Authentication required', 'Insufficient permissions'].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 403 });
    console.error('Challenge allocation reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
