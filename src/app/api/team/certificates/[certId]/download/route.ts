import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Certificate from '@/models/Certificate';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    await connectDB();
    const payload = await requireAuth(req, 'user');

    if (!payload.teamId) {
      return NextResponse.json({ error: 'Not authenticated as a team' }, { status: 403 });
    }

    const { certId } = await params;

    if (!mongoose.Types.ObjectId.isValid(certId)) {
      return NextResponse.json({ error: 'Invalid certificate ID' }, { status: 400 });
    }

    const cert = await Certificate.findById(certId).lean();

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Security check: the certificate must belong to the requesting team
    if ((cert as any).teamId.toString() !== payload.teamId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    if (!(cert as any).fileUrl) {
      return NextResponse.json(
        { error: 'Certificate file not yet available' },
        { status: 404 }
      );
    }

    // Redirect to the Cloudinary PDF URL
    return NextResponse.redirect((cert as any).fileUrl);
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Insufficient permissions'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Certificate download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
