import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ExportParticipantsButtons } from '@/components/admin/ExportParticipantsButtons';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';

export const metadata = {
  title: 'Admin Dashboard | GENESIS 2.0',
};

// Force dynamic rendering since data changes frequently
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await connectDB();
  
  const [
    totalTeams,
    pendingVerification,
    verified,
    checkedIn,
    recentTeams,
    registrationData
  ] = await Promise.all([
    Team.countDocuments(),
    Team.countDocuments({ paymentStatus: 'pending_verification' }),
    Team.countDocuments({ paymentStatus: 'verified' }),
    Team.countDocuments({ checkedIn: true }),
    Team.find().sort({ createdAt: -1 }).limit(5).lean(),
    Team.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          registrations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Format aggregated data for the chart
  const chartData = registrationData.map((item: any) => {
    const dateObj = new Date(item._id);
    return {
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(dateObj),
      registrations: item.registrations,
      fullDate: item._id // keep for sorting just in case
    };
  });

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide uppercase">Command Center</h1>
          <p className="text-text-muted font-body text-[16px]">High-level metrics and system status.</p>
        </div>
        <ExportParticipantsButtons />
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        
        {/* Total Teams (Span 3) */}
        <div className="md:col-span-3">
          <GlassCard className="h-full flex flex-col justify-between" hoverEffect={true}>
            <div className="text-[12px] font-mono text-text-muted mb-4 uppercase tracking-[0.12em]">Total Teams</div>
            <div className="text-4xl font-display font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">{totalTeams}</div>
          </GlassCard>
        </div>
        
        {/* Pending Verification (Span 3) */}
        <div className="md:col-span-3">
          <GlassCard className="h-full flex flex-col justify-between bg-pending/5 border-pending/20" hoverEffect={true}>
            <div className="text-[12px] font-mono text-pending mb-4 uppercase tracking-[0.12em]">Pending</div>
            <div className="text-4xl font-display font-bold text-pending drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">{pendingVerification}</div>
          </GlassCard>
        </div>
        
        {/* Verified Teams (Span 3) */}
        <div className="md:col-span-3">
          <GlassCard className="h-full flex flex-col justify-between bg-success/5 border-success/20" hoverEffect={true}>
            <div className="text-[12px] font-mono text-success mb-4 uppercase tracking-[0.12em]">Verified</div>
            <div className="text-4xl font-display font-bold text-success drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">{verified}</div>
          </GlassCard>
        </div>

        {/* Checked In (Span 3) */}
        <div className="md:col-span-3">
          <GlassCard className="h-full flex flex-col justify-between bg-starlight/5 border-starlight/20" hoverEffect={true}>
            <div className="text-[12px] font-mono text-starlight mb-4 uppercase tracking-[0.12em]">Checked In</div>
            <div className="text-4xl font-display font-bold text-starlight drop-shadow-[0_0_12px_rgba(196,181,253,0.3)]">{checkedIn}</div>
          </GlassCard>
        </div>

        {/* Analytics Chart (Span 12) */}
        <div className="md:col-span-12 mt-4 min-h-[400px]">
          <AnalyticsChart data={chartData} />
        </div>

        {/* Data Table Area (Span 12) */}
        <div className="md:col-span-12 mt-4">
          <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
            <div className="p-6 border-b border-glass-border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-glass/30">
              <h2 className="text-xl font-display font-bold text-white uppercase">Recent Registrations</h2>
              <ExportParticipantsButtons />
            </div>
            
            {recentTeams.length === 0 ? (
              <EmptyState 
                title="No teams found"
                description="No teams have registered yet."
                className="bg-transparent border-none shadow-none py-16"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-text-primary">
                  <thead className="bg-void/40 border-b border-glass-border uppercase font-mono text-[10px] tracking-wider text-text-muted">
                    <tr>
                      <th className="px-6 py-4">Team Name</th>
                      <th className="px-6 py-4">College</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTeams.map((team: any) => (
                      <tr key={team._id.toString()} className="border-b border-glass-border/50 hover:bg-glass/20 transition-colors">
                        <td className="px-6 py-4 font-bold">{team.teamName}</td>
                        <td className="px-6 py-4 text-text-muted">{team.college}</td>
                        <td className="px-6 py-4">
                          <Badge 
                            variant={team.paymentStatus === 'verified' ? 'success' : team.paymentStatus === 'pending_verification' ? 'pending' : 'danger'}
                          >
                            {team.paymentStatus.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-text-muted">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
