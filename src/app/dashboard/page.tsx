import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import Message from '@/models/Message';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConstellationThread } from '@/components/ui/ConstellationThread';
import { FileText, Download, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | GENESIS 2.0',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('genesis_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = verifyToken(token);
  if (!payload || !payload.teamId) {
    redirect('/login');
  }

  await connectDB();
  const team = await Team.findById(payload.teamId).lean();

  if (!team) {
    redirect('/login');
  }

  const messagesCount = await Message.countDocuments({
    $or: [
      { scope: 'broadcast' },
      { scope: 'team', targetTeamId: team._id },
      { scope: 'participant', targetParticipantEmail: { $in: team.members.map((m: any) => m.email) } }
    ],
    read: false
  });

  // Calculate rank dynamically
  // Find how many teams have strictly more points than this team
  const rankCount = await Team.countDocuments({
    paymentStatus: 'verified',
    checkedIn: true,
    scoreboardPoints: { $gt: team.scoreboardPoints }
  });
  
  // Rank is teams with more points + 1
  const currentRank = rankCount + 1;
  const isRanked = team.paymentStatus === 'verified' && team.checkedIn && team.scoreboardPoints > 0;

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">Overview</h1>
        <p className="text-text-muted font-body text-[16px]">Here is the status of your team and event progress.</p>
      </div>
      
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        
        {/* Verification Status Card (Span 4) */}
        <div className="md:col-span-4 relative">
          <GlassCard className="h-full flex flex-col justify-between" hoverEffect={true}>
            {team.paymentStatus === 'verified' && (
              <div className="absolute top-0 left-0 w-full h-[60px] pointer-events-none opacity-50 z-0">
                 <ConstellationThread 
                  pathD="M 10 50 Q 50 10 90 50" 
                  viewBox="0 0 100 100"
                  delay={0.1}
                />
              </div>
            )}
            <div className="relative z-10">
              <div className="text-[12px] font-mono text-text-muted mb-4 uppercase tracking-[0.12em]">Status</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-display font-bold text-white mb-1 capitalize">
                    {team.paymentStatus.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-success">
                    {team.paymentStatus === 'verified' ? 'You are good to go!' : 'Awaiting admin review.'}
                  </div>
                </div>
                {team.paymentStatus === 'verified' && (
                  <Badge variant="success" className="mb-1 bg-success/10 text-success border-success/20 shadow-[0_0_12px_rgba(52,211,153,0.2)]">Verified</Badge>
                )}
                {team.paymentStatus === 'pending_verification' && (
                  <Badge variant="pending" className="mb-1">Pending</Badge>
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Scoreboard Points Card (Span 4) */}
        <div className="md:col-span-4">
          <GlassCard className="h-full flex flex-col justify-between" hoverEffect={true}>
            <div className="text-[12px] font-mono text-text-muted mb-4 uppercase tracking-[0.12em]">Scoreboard</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-4xl font-display font-bold text-pulse drop-shadow-[0_0_12px_rgba(147,51,234,0.4)] mb-1">
                  {team.scoreboardPoints || 0}
                </div>
                <div className="text-sm text-text-muted">Total Points</div>
              </div>
              <Badge variant={isRanked ? (currentRank <= 3 ? 'success' : 'default') : 'default'} className="mb-1">
                {isRanked ? `Rank: #${currentRank}` : 'Rank: N/A'}
              </Badge>
            </div>
          </GlassCard>
        </div>

        {/* Check-In Status Card (Span 4) */}
        <div className="md:col-span-4">
          <GlassCard className="h-full flex flex-col justify-between" hoverEffect={true}>
            <div className="text-[12px] font-mono text-text-muted mb-4 uppercase tracking-[0.12em]">Check-in</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-display font-bold text-white mb-1">
                  {team.checkedIn ? 'Checked In' : 'Not Checked In'}
                </div>
                <div className="text-sm text-text-muted">
                  {team.checkedIn && team.checkedInAt 
                    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(team.checkedInAt as any)) 
                    : 'Event day only'}
                </div>
              </div>
              <Badge variant={team.checkedIn ? 'success' : 'pending'} className="mb-1">
                {team.checkedIn ? 'Done' : 'Pending'}
              </Badge>
            </div>
          </GlassCard>
        </div>

        {/* Guidelines Banner Card (Span 12) */}
        <div className="md:col-span-12">
          <GlassCard className="p-6 relative overflow-hidden" hoverEffect={false}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pulse/20 border border-pulse/30 flex items-center justify-center text-pulse shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-white text-lg tracking-wide uppercase">
                      Buildathon Guidelines
                    </h3>
                    <Badge variant="default" className="text-[10px] uppercase font-mono">Official</Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Start: <span className="text-white font-mono font-medium">01 Aug 2026, 10:00 PM IST</span> &bull; Mandatory Git &bull; Academic Year Tracks
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/dashboard/guidelines"
                  className="px-4 py-2.5 rounded-xl bg-glass border border-glass-border hover:border-pulse/40 text-xs font-bold text-white transition-all inline-flex items-center gap-1.5"
                >
                  <span>View Details</span>
                  <ArrowRight size={14} />
                </Link>
                <a
                  href="/GENESIS_2.0_Buildathon_Guidelines.pdf"
                  download="GENESIS_2.0_Buildathon_Guidelines.pdf"
                  className="px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white transition-all bg-[linear-gradient(135deg,#6d28d9_0%,#a855f7_100%)] border border-pulse/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:shadow-[0_0_25px_rgba(168,85,247,0.45)] inline-flex items-center gap-2"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Inbox Messages (Span 6) */}
        <div className="md:col-span-6">
          <GlassCard className="h-full min-h-[300px] flex flex-col" hoverEffect={true}>
            <div className="text-[12px] font-mono text-text-muted mb-4 uppercase tracking-[0.12em] flex items-center justify-between">
              <span>Inbox Messages</span>
              <span className="bg-ion text-void px-2 py-0.5 rounded-full font-bold">{messagesCount}</span>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <EmptyState 
                title={messagesCount === 0 ? "No new messages" : "You have messages"}
                description="Check the Inbox tab to view your communications."
                className="bg-transparent border-none shadow-none p-0"
              />
            </div>
          </GlassCard>
        </div>

        {/* Team Members (Span 6) */}
        <div className="md:col-span-6">
          <GlassCard className="h-full min-h-[300px] flex flex-col" hoverEffect={true}>
            <div className="text-[12px] font-mono text-text-muted mb-4 uppercase tracking-[0.12em] flex justify-between">
              <span>Team Members</span>
              <span>{team.teamName}</span>
            </div>
            <div className="flex-grow flex flex-col gap-2 mt-2">
              {team.members.map((member: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-glass border border-glass-border">
                  <div>
                    <div className="font-bold text-white">{member.name}</div>
                    <div className="text-xs text-text-muted">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
        
      </div>
    </div>
  );
}
