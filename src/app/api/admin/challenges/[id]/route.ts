import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import ChallengeDefinition from '@/models/ChallengeDefinition';
import Team from '@/models/Team';
import { keywordList } from '@/lib/challenge-catalog';

const updateSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(), problem: z.string().trim().min(10).max(1000).optional(),
  mission: z.string().trim().max(1000).optional().or(z.literal('')), specialRequirement: z.string().trim().max(1000).optional().or(z.literal('')),
  oneLineSolution: z.string().trim().min(10).max(1000).optional(), judgeCheck: z.string().trim().min(10).max(1000).optional(),
  difficulty: z.coerce.number().int().min(1).max(10).optional(), keywords: z.array(z.string().trim().min(2).max(40)).max(24).optional(), enabled: z.boolean().optional(),
});

function respond(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || 'Invalid challenge' }, { status: 400 });
  if (error instanceof Error && ['Authentication required', 'Insufficient permissions'].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 403 });
  if ((error as any)?.code === 11000) return NextResponse.json({ error: 'A challenge with this phase and title already exists' }, { status: 409 });
  console.error('Admin challenge update error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB(); await requireAuth(req, 'admin');
    const input = updateSchema.parse(await req.json());
    const { id } = await params;
    const values: any = { ...input };
    if (input.keywords) values.keywords = input.keywords.map((item) => item.toLowerCase());
    if (!input.keywords && (input.title || input.problem)) values.keywords = keywordList(`${input.title || ''} ${input.problem || ''}`);
    ['mission', 'specialRequirement'].forEach((key) => { if (values[key] === '') values[key] = undefined; });
    const challenge = await ChallengeDefinition.findByIdAndUpdate(id, { $set: values }, { new: true, runValidators: true });
    if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    return NextResponse.json({ challenge });
  } catch (error) { return respond(error); }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB(); await requireAuth(req, 'admin');
    const { id } = await params;
    const challenge = await ChallengeDefinition.findById(id).lean();
    if (!challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    const used = await Team.exists({
      $or: [
        { 'featureChallenge.id': id }, { 'situationChallenge.id': id },
        { 'featureChallenge.title': challenge.title }, { 'situationChallenge.title': challenge.title },
      ],
    });
    if (used) return NextResponse.json({ error: 'This challenge is already assigned and cannot be removed. Disable it to keep the audit trail.' }, { status: 409 });
    await ChallengeDefinition.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) { return respond(error); }
}
