import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import Link from 'next/link';
import { LeaderboardTabs } from './LeaderboardTabs';

export const metadata = {
  title: 'Leaderboard | GENESIS 2.0',
  description: 'Live leaderboard for the GENESIS 2.0 Buildathon',
};

// Revalidate every 60 seconds for live updates
export const revalidate = 60;

export default async function LeaderboardPage() {
  let teams: any[] = [];
  let loadError = false;

  try {
    await connectDB();

    // Fetch verified and checked-in teams, sorted by points descending, then by creation date ascending (as tie-breaker)
    const rawTeams = await Team.find({
      paymentStatus: 'verified',
      checkedIn: true,
      scoreboardPoints: { $gt: 0 }
    })
      .sort({ scoreboardPoints: -1, createdAt: 1 })
      .select('teamName college scoreboardPoints route')
      .lean();

    // Format for serialization (ObjectId to string)
    teams = rawTeams.map(t => ({
      ...t,
      _id: t._id.toString()
    }));
  } catch (error) {
    console.error('Leaderboard fetch failed:', error);
    loadError = true;
  }

  return (
    <main className="cosmic-page flex-grow min-h-screen pt-28 sm:pt-32 pb-20">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-glow right-[-8rem] top-[4rem] opacity-70" />
        
        <div className="text-center mb-12">
          <Link href="/">
            <BrandWordmark className="text-2xl tracking-[0.18em] text-white sm:text-3xl sm:tracking-[0.24em] mb-6 inline-block" />
          </Link>
          <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pulse via-white to-pulse-bright uppercase tracking-[0.1em] sm:text-5xl md:text-6xl mb-4">
            Live Leaderboard
          </h1>
          <p className="text-text-muted text-lg font-body max-w-2xl mx-auto">
            Top teams battling it out in the ultimate cosmic buildathon. Ranks are determined by accumulated points from challenges.
          </p>
        </div>

        {loadError ? (
          <div className="py-20 text-center text-red-400 bg-red-900/20 border border-red-500/30 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Failed to load leaderboard</h3>
            <p>Please try refreshing the page in a few moments.</p>
          </div>
        ) : (
          <LeaderboardTabs teams={teams} />
        )}
      </div>
    </main>
  );
}
