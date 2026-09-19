import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { TeamChallengePanel } from '@/components/challenges/TeamChallengePanel';
import Settings from '@/models/Settings';

export const dynamic = 'force-dynamic';

async function fetchWheelEntries(phase: 'feature' | 'situation') {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/wheel?phase=${phase}`, {
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.entries || [];
}

export default async function TeamChallengesPage() {
  const token = (await cookies()).get('genesis_token')?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth?.teamId) redirect('/login');
  await connectDB();
  const team = await Team.findById(auth.teamId, 'featureChallenge situationChallenge').lean();
  if (!team) redirect('/login');
  // @ts-ignore
  const settings = await Settings.getSettings();
  const featureWheelEntries = await fetchWheelEntries('feature');
  const situationWheelEntries = await fetchWheelEntries('situation');
  return <TeamChallengePanel initialFeature={team.featureChallenge as any} initialSituation={team.situationChallenge as any} phase1Open={settings.phase1SpinOpen} phase2Open={settings.phase2SpinOpen} featureWheelEntries={featureWheelEntries} situationWheelEntries={situationWheelEntries} />;
}
