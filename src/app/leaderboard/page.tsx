import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { GlassCard } from '@/components/ui/GlassCard';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { LeaderboardChart } from '@/components/leaderboard/LeaderboardChart';
import Link from 'next/link';

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
    teams = await Team.find({ 
      paymentStatus: 'verified',
      checkedIn: true,
      scoreboardPoints: { $gt: 0 } 
    })
      .sort({ scoreboardPoints: -1, createdAt: 1 })
      .select('teamName college scoreboardPoints')
      .lean();
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

        {teams.length > 0 && (
          <LeaderboardChart 
            data={teams.slice(0, 10).map((team, index) => ({ 
              teamName: team.teamName, 
              scoreboardPoints: team.scoreboardPoints,
              rank: index + 1
            }))} 
          />
        )}

        <GlassCard className="p-0 overflow-hidden border-pulse/20 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
          {teams.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-display font-bold text-white mb-2">No Scores Yet</h3>
              <p className="text-text-muted">The competition hasn't awarded any points yet. Check back later!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary border-collapse">
                <thead className="bg-void/60 border-b border-glass-border uppercase font-mono text-[10px] tracking-wider text-text-muted">
                  <tr>
                    <th className="px-6 py-5 w-20 text-center">Rank</th>
                    <th className="px-6 py-5">Team</th>
                    <th className="px-6 py-5 hidden sm:table-cell">College</th>
                    <th className="px-6 py-5 text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team: any, index: number) => {
                    const isTop3 = index < 3;
                    return (
                      <tr 
                        key={team._id.toString()} 
                        className={`
                          border-b border-glass-border/50 transition-colors
                          ${index === 0 ? 'bg-pulse/10 hover:bg-pulse/20' : 'hover:bg-glass/20'}
                        `}
                      >
                        <td className="px-6 py-5 text-center">
                          {index === 0 ? <span className="text-2xl" title="1st Place">🥇</span> : 
                           index === 1 ? <span className="text-2xl" title="2nd Place">🥈</span> : 
                           index === 2 ? <span className="text-2xl" title="3rd Place">🥉</span> : 
                           <span className="font-mono font-bold text-text-muted text-lg">{index + 1}</span>}
                        </td>
                        <td className="px-6 py-5">
                          <div className={`font-bold text-lg ${isTop3 ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-text-primary'}`}>
                            {team.teamName}
                          </div>
                          <div className="text-xs text-text-muted sm:hidden mt-1">{team.college}</div>
                        </td>
                        <td className="px-6 py-5 hidden sm:table-cell text-text-muted">
                          {team.college}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className={`font-display font-bold text-2xl ${isTop3 ? 'text-pulse-bright' : 'text-pulse'}`}>
                            {team.scoreboardPoints}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </main>
  );
}
