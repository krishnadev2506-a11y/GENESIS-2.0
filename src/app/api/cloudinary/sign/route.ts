import { NextRequest, NextResponse } from 'next/server';
import { getSignedUploadParams } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { folder } = await req.json();
    const params = getSignedUploadParams(folder || 'genesis2.0/misc');
    return NextResponse.json(params);
  } catch (error) {
    console.error('Cloudinary sign error:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
