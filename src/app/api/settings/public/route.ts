import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Settings from '@/models/Settings';

/**
 * Public settings endpoint — no auth required.
 * Returns only non-sensitive settings needed by the registration form
 * and event pages: pricing, early bird, food toggle, themes, registration status.
 */

// Use ISR with shorter revalidation for settings changes to reflect quickly
export const revalidate = 60; // Revalidate every minute
export const dynamic = 'force-static';

export async function GET() {
  try {
    await connectDB();
    // @ts-ignore - mongoose static method typing issues
    const settings = await Settings.getSettings();

    const publicSettings = {
      registrationOpen: settings.registrationOpen,
      earlyBirdEnabled: settings.earlyBirdEnabled,
      pricing: settings.pricing,
      foodEnabled: settings.foodEnabled,
      eventDate: settings.eventDate,
      eventEndDate: settings.eventEndDate,
      qrCodeImageUrl: settings.qrCodeImageUrl,
      themeFoundation: settings.themeFoundation,
      themeProfessional: settings.themeProfessional,
      prizePool: settings.prizePool,
      upiId: settings.upiId,
      adminContactNumber: settings.adminContactNumber,
    };

    return NextResponse.json(publicSettings, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Public settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
