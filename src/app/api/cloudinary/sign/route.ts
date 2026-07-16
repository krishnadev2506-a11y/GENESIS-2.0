import { NextRequest, NextResponse } from 'next/server';
import { getSignedUploadParams } from '@/lib/cloudinary';
import { rateLimit } from '@/lib/rate-limit';

// Allowlist of folders users are permitted to upload to
const ALLOWED_FOLDERS = ['genesis2.0/payments', 'genesis2.0/misc'];

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }, 'cloudinary_sign');

export async function POST(req: NextRequest) {
  try {
    // Enforce rate limiting instead of requireAuth to allow signups
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = limiter.check(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { folder } = body;

    // Validate the requested folder against the allowlist
    const sanitizedFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'genesis2.0/misc';

    const params = getSignedUploadParams(sanitizedFolder);
    return NextResponse.json(params);
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Invalid or expired token'
    ) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Cloudinary sign error:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
