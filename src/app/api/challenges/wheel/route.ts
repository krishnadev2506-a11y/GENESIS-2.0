import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import ChallengeDefinition from '@/models/ChallengeDefinition';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase') as 'feature' | 'situation';
    
    if (phase !== 'feature' && phase !== 'situation') {
      return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
    }

    const definitions = await ChallengeDefinition.find({ phase, enabled: true }).lean();
    
    if (phase === 'feature') {
      // For Phase 1, return all enabled challenge titles
      const titles = definitions.map((d: any) => d.title);
      return NextResponse.json({ entries: titles });
    }
    
    if (phase === 'situation') {
      // For Phase 2, return weighted entries based on server catalogue
      const weighted = definitions.flatMap((item: any) => 
        Array.from({ length: item.weight || 1 }, () => item.title)
      );
      return NextResponse.json({ entries: weighted });
    }
    
    return NextResponse.json({ entries: [] });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Wheel entries GET error:', error);
    return NextResponse.json({ error: 'Unable to load wheel entries' }, { status: 500 });
  }
}
