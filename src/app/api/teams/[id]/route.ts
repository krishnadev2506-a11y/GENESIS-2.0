import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { requireAuth } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const { id } = await params;
    
    const team = await Team.findById(id).select('-credentials.passwordHash');
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    return NextResponse.json(team);
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Team GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const payload = await requireAuth(req, 'admin');
    
    const { id } = await params;
    const body = await req.json();
    
    const team = await Team.findById(id);
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    const beforeData = team.toObject();
    
    // Allowed fields to update directly
    const allowedUpdates = ['teamName', 'college', 'semester', 'contactNumber', 'email', 'foodPreference', 'members', 'scoreboardPoints', 'checkedIn'];
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        (team as any)[field] = body[field];
      }
    });
    
    await team.save();
    
    // Create audit log
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(payload.id),
      action: 'UPDATE_TEAM',
      targetCollection: 'Team',
      targetId: team._id,
      before: beforeData,
      after: team.toObject(),
    });
    
    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Team PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
    
    const teamData = team.toObject();
    
    await Team.findByIdAndDelete(id);
    
    // Create audit log
    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(payload.id),
      action: 'DELETE_TEAM',
      targetCollection: 'Team',
      targetId: team._id,
      before: teamData,
    });
    
    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Team DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
