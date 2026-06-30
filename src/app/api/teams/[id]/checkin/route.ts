import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const payload = await requireAuth(req, 'admin');
    
    const { id } = await params;
    
    const team = await Team.findById(id);
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    if (team.checkedIn) {
      return NextResponse.json({ error: 'Team is already checked in' }, { status: 400 });
    }
    
    const beforeData = team.toObject();
    
    team.checkedIn = true;
    team.checkedInAt = new Date();
    await team.save();
    
    // Audit log
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(payload.id),
      action: 'CHECK_IN_TEAM',
      targetCollection: 'Team',
      targetId: team._id,
      before: beforeData,
      after: team.toObject(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Check-in team error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
