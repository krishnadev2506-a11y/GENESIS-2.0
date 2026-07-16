import { NextRequest, NextResponse } from 'next/server';
import { getSignedUploadParams } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

// Allowlist of folders users are permitted to upload to
const ALLOWED_FOLDERS = ['genesis2.0/payments', 'genesis2.0/misc'];

export async function POST(req: NextRequest) {
  try {
    // Require a valid session before issuing a Cloudinary signature.
    // This prevents anonymous users from spamming your Cloudinary storage.
    await requireAuth(req);

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
