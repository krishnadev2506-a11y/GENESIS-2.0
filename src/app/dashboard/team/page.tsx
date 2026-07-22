import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Team Details | Dashboard | GENESIS 2.0',
};

export const dynamic = 'force-dynamic';

export default async function TeamDetailsPage() {
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

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">Team Details</h1>
        <p className="text-text-muted font-body text-[16px]">Manage your team members and view your registration info.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Registration Info</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-text-muted uppercase tracking-wider font-mono mb-1">Team Name</div>
              <div className="text-lg text-white font-bold">{team.teamName}</div>
            </div>
            <div>
              <div className="text-sm text-text-muted uppercase tracking-wider font-mono mb-1">Route</div>
              <Badge variant="default" className="uppercase">{team.route}</Badge>
            </div>
            <div>
              <div className="text-sm text-text-muted uppercase tracking-wider font-mono mb-1">College</div>
              <div className="text-white">{team.college || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-text-muted uppercase tracking-wider font-mono mb-1">Primary Email</div>
              <div className="text-white">{team.email}</div>
            </div>
            <div>
              <div className="text-sm text-text-muted uppercase tracking-wider font-mono mb-1">Contact Number</div>
              <div className="text-white">{team.contactNumber || 'N/A'}</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Team Members</h2>
          <div className="space-y-4">
            {team.members.map((member: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-void/50 border border-glass-border">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {member.name}
                    {member.isLeader && <Badge variant="success" className="text-[10px] px-1 py-0">Leader</Badge>}
                  </div>
                  <div className="text-sm text-text-muted">{member.role}</div>
                  <div className="text-sm text-text-muted">{member.email}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
