import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import ChallengeDefinition from '@/models/ChallengeDefinition';
import Team from '@/models/Team';
import { ensureChallengeCatalog, keywordList } from '@/lib/challenge-catalog';
import Settings from '@/models/Settings';

const challengeSchema = z.object({
  phase: z.enum(['feature', 'situation']),
  title: z.string().trim().min(3).max(120),
  problem: z.string().trim().min(10).max(1000),
  mission: z.string().trim().max(1000).optional().or(z.literal('')),
  specialRequirement: z.string().trim().max(1000).optional().or(z.literal('')),
  oneLineSolution: z.string().trim().min(10).max(1000),
  judgeCheck: z.string().trim().min(10).max(1000),
  difficulty: z.coerce.number().int().min(1).max(10),
  keywords: z.array(z.string().trim().min(2).max(40)).max(24).optional(),
  enabled: z.boolean().optional(),
});

function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || 'Invalid challenge' }, { status: 400 });
  if (error instanceof Error && ['Authentication required', 'Insufficient permissions'].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 403 });
  if ((error as any)?.code === 11000) return NextResponse.json({ error: 'A challenge with this phase and title already exists' }, { status: 409 });
  console.error('Admin challenge catalogue error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    await ensureChallengeCatalog();
    // @ts-ignore
    const settings = await Settings.getSettings();
    const definitions = await ChallengeDefinition.find().sort({ phase: 1, title: 1 }).lean();
    const teams = await Team.find({}, 'teamName projectIdea featureChallenge situationChallenge').sort({ teamName: 1 }).lean();
    const usage = new Map<string, number>();
    teams.forEach((team: any) => ['featureChallenge', 'situationChallenge'].forEach((field) => {
      const title = team[field]?.title?.toLowerCase();
      if (title) usage.set(title, (usage.get(title) || 0) + 1);
    }));
    return NextResponse.json({ challenges: definitions.map((item) => ({ ...item, usageCount: usage.get(item.title.toLowerCase()) || 0 })), teams, selection: { feature: settings.phase1SpinOpen, situation: settings.phase2SpinOpen } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    const input = challengeSchema.parse(await req.json());
    const challenge = await ChallengeDefinition.create({
      ...input,
      mission: input.mission || undefined,
      specialRequirement: input.specialRequirement || undefined,
      keywords: input.keywords?.length ? input.keywords.map((item) => item.toLowerCase()) : keywordList(`${input.title} ${input.problem}`),
    });
    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
