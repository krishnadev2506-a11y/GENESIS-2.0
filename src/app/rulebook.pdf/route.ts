import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // @ts-ignore
    const settings = await Settings.getSettings();

    if (settings.rulebookUrl) {
      // Redirect to the Cloudinary URL
      return NextResponse.redirect(settings.rulebookUrl, 302);
    } else {
      // If no rulebook exists, redirect to homepage or return 404
      // We will redirect to homepage with an error query param or just home
      return NextResponse.redirect(new URL('/', req.url));
    }
  } catch (error) {
    console.error('Error fetching rulebook:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}
