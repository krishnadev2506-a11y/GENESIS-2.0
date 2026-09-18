import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { generateCredentials, hashPassword, requireAuth } from '@/lib/auth';
import { sendTeamCredentials } from '@/lib/mail';
import Team from '@/models/Team';
import AuditLog from '@/models/AuditLog';
import { logger } from '@/lib/logger';

const CONCURRENCY = 3;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const admin = await requireAuth(req, 'admin');
    const teams = await Team.find({ paymentStatus: 'verified' }, 'teamName email members credentials.username').lean();
    const outcomes = await Promise.all(Array.from({ length: Math.min(CONCURRENCY, teams.length) }, async (_, worker) => {
      let sentTeams = 0; let failedTeams = 0; let recipients = 0;
      for (let index = worker; index < teams.length; index += CONCURRENCY) {
        const team: any = teams[index];
        const username = team.credentials?.username || generateCredentials(team.teamName).username;
        const { password } = generateCredentials(team.teamName);
        const passwordHash = await hashPassword(password);
        await Team.updateOne({ _id: team._id }, { $set: { credentials: { username, passwordHash, temporaryPassword: password }, mustResetPassword: true } });
        const emails = Array.from(new Set([...(team.members || []).map((member: any) => member.email?.trim().toLowerCase()), team.email?.trim().toLowerCase()].filter(Boolean))) as string[];
        const delivery = await sendTeamCredentials(emails, team.teamName, username, password, true);
        recipients += delivery.sentCount;
        if (delivery.success) sentTeams++; else failedTeams++;
      }
      return { sentTeams, failedTeams, recipients };
    }));
    const summary = outcomes.reduce((total, item) => ({ sentTeams: total.sentTeams + item.sentTeams, failedTeams: total.failedTeams + item.failedTeams, recipients: total.recipients + item.recipients }), { sentTeams: 0, failedTeams: 0, recipients: 0 });
    await AuditLog.create({ adminId: new mongoose.Types.ObjectId(admin.id), action: 'RESET_ALL_CREDENTIALS', targetCollection: 'Team', targetId: new mongoose.Types.ObjectId(admin.id), before: { verifiedTeams: teams.length }, after: summary });
    return NextResponse.json({ success: true, teamCount: teams.length, ...summary });
  } catch (error: any) {
    if (['Authentication required', 'Insufficient permissions'].includes(error.message)) return NextResponse.json({ error: error.message }, { status: 403 });
    logger.error('Bulk credential reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
