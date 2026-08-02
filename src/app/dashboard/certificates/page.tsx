import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Certificate from '@/models/Certificate';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Award, Download } from 'lucide-react';
import mongoose from 'mongoose';

export const metadata = {
  title: 'Certificates | Dashboard | GENESIS 2.0',
};

export const dynamic = 'force-dynamic';

export default async function CertificatesPage() {
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

  const certs = await Certificate.find({
    teamId: new mongoose.Types.ObjectId(payload.teamId),
    status: 'dispatched',
  })
    .select('memberName fileUrl dispatchedAt memberIndex _id')
    .sort({ memberIndex: 1 })
    .lean();

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">
          Certificates
        </h1>
        <p className="text-text-muted font-body text-[16px]">
          Download your participation certificates for GENESIS 2.0.
        </p>
      </div>

      {certs.length === 0 ? (
        <GlassCard className="p-12 flex justify-center items-center">
          <EmptyState
            icon={<Award size={28} />}
            title="No certificates yet"
            description="Your certificates will appear here once they are released by the organizer."
            className="bg-transparent border-none shadow-none p-0"
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {certs.map((cert: any) => (
            <GlassCard
              key={cert._id.toString()}
              className="p-6 flex flex-col gap-4"
              hoverEffect={true}
            >
              {/* Member Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pulse/20 border border-pulse/30 flex items-center justify-center text-pulse font-display font-bold text-xl shadow-[0_0_12px_rgba(139,92,246,0.25)]">
                  {cert.memberName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white text-lg">{cert.memberName}</div>
                  <div className="text-xs font-mono text-text-muted uppercase tracking-wider">
                    Participant Certificate
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-glass-border" />

              {/* Dispatched date */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider mb-0.5">
                    Released on
                  </div>
                  <div className="text-sm text-white font-medium">
                    {cert.dispatchedAt
                      ? new Intl.DateTimeFormat('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                          timeZone: 'Asia/Kolkata',
                        }).format(new Date(cert.dispatchedAt))
                      : '—'}
                  </div>
                </div>

                {/* Download Button — opens PDF in a new tab */}
                <a
                  href={`/api/team/certificates/${cert._id.toString()}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body font-semibold uppercase tracking-[0.14em] text-[13px] transition-all duration-300 bg-[linear-gradient(135deg,#6d28d9_0%,#a855f7_100%)] text-white border border-[rgba(168,85,247,0.5)] shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.55)] hover:-translate-y-0.5"
                >
                  <Download size={14} />
                  Download
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
