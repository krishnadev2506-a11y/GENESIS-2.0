import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { TeamChallengePanel } from '@/components/challenges/TeamChallengePanel';
import Settings from '@/models/Settings';

export const dynamic = 'force-dynamic';

export default async function TeamChallengesPage() {
  const token = (await cookies()).get('genesis_token')?.value;
  const auth = token ? verifyToken(token) : null;
  if (!auth?.teamId) redirect('/login');
  await connectDB();
  const team = await Team.findById(auth.teamId, 'featureChallenge situationChallenge').lean();
  if (!team) redirect('/login');
  // @ts-ignore
  const settings = await Settings.getSettings();
  return <TeamChallengePanel initialFeature={team.featureChallenge as any} initialSituation={team.situationChallenge as any} phase1Open={settings.phase1SpinOpen} phase2Open={settings.phase2SpinOpen} />;
}
