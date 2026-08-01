'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { LeaderboardChart } from '@/components/leaderboard/LeaderboardChart';

interface TeamData {
  _id: string;
  teamName: string;
  college: string;
  scoreboardPoints: number;
}

interface LeaderboardTabsProps {
  teams: TeamData[];
}

export function LeaderboardTabs({ teams }: LeaderboardTabsProps) {
  return (
    <div className="space-y-8">
      {/* Chart */}
      {teams.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LeaderboardChart 
            data={teams.slice(0, 10).map((team, index) => ({ 
              teamName: team.teamName, 
              scoreboardPoints: team.scoreboardPoints,
              rank: index + 1
            }))} 
          />
        </div>
      )}

      {/* Table */}
      <GlassCard className="p-0 overflow-hidden border-pulse/20 shadow-[0_0_40px_rgba(139,92,246,0.15)] animate-in fade-in slide-in-from-bottom-8 duration-700">
        {teams.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-display font-bold text-white mb-2">No Scores Yet</h3>
            <p className="text-text-muted">The competition hasn't awarded any points yet.</p>
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
                {teams.map((team, index) => {
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
  );
}
