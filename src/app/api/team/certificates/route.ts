import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Certificate from '@/models/Certificate';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await requireAuth(req, 'user');

    if (!payload.teamId) {
      return NextResponse.json({ error: 'Not authenticated as a team' }, { status: 403 });
    }

    const certs = await Certificate.find({
      teamId: new mongoose.Types.ObjectId(payload.teamId),
      status: 'dispatched',
    })
      .select('memberName fileUrl dispatchedAt memberIndex')
      .sort({ memberIndex: 1 })
      .lean();

    // Return empty array — never 404 — if no certs dispatched yet
    return NextResponse.json(
      certs.map((c: any) => ({
        _id: c._id.toString(),
        memberName: c.memberName,
        fileUrl: c.fileUrl,
        dispatchedAt: c.dispatchedAt,
        memberIndex: c.memberIndex,
      }))
    );
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Insufficient permissions'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Team certificates GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
