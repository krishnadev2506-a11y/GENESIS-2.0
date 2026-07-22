import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import Message from '@/models/Message';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Inbox | Dashboard | GENESIS 2.0',
};

export const dynamic = 'force-dynamic';

export default async function InboxPage() {
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

  const memberEmails = team.members.map((m: any) => m.email);

  const messages = await Message.find({
    $or: [
      { scope: 'broadcast' },
      { scope: 'team', targetTeamId: team._id },
      { scope: 'participant', targetParticipantEmail: { $in: memberEmails } }
    ]
  }).sort({ sentAt: -1 }).lean();

  // Optionally, you could mark team/participant messages as read here
  // We avoid marking broadcast messages as read to not affect other teams

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">Inbox</h1>
        <p className="text-text-muted font-body text-[16px]">Important updates and messages from the organizers.</p>
      </div>

      <div className="space-y-6">
        {messages.length === 0 ? (
          <GlassCard className="p-12 flex justify-center items-center">
            <EmptyState 
              title="No messages yet" 
              description="You will receive important updates from the organizers here." 
            />
          </GlassCard>
        ) : (
          messages.map((msg: any) => (
            <GlassCard key={msg._id.toString()} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{msg.subject}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant={msg.scope === 'broadcast' ? 'default' : 'success'} className="uppercase text-[10px]">
                      {msg.scope}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(msg.sentAt))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-white whitespace-pre-wrap font-body text-sm leading-relaxed">
                {msg.body}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
