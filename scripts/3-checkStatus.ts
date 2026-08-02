/**
 * scripts/3-checkStatus.ts
 *
 * Read-only safety check. Prints a per-team, per-member status table showing
 * what is uploaded, what is missing, and what has been dispatched.
 * Never modifies anything in the database.
 *
 * Usage:
 *   npx tsx scripts/3-checkStatus.ts <eventId>
 *
 * Example:
 *   npx tsx scripts/3-checkStatus.ts GENESIS_2.0
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ---- Inline schemas ----

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String },
    role: { type: String },
    email: { type: String },
    isLeader: { type: Boolean },
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  { teamName: { type: String }, members: [TeamMemberSchema] },
  { strict: false, timestamps: true }
);

const CertificateSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    memberIndex: { type: Number },
    memberName: { type: String },
    eventId: { type: String },
    fileUrl: { type: String },
    status: { type: String },
    dispatchedAt: { type: Date },
  },
  { timestamps: true }
);

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);
const Certificate =
  mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);

async function main() {
  const eventId = process.argv[2];

  if (!eventId) {
    console.error('Usage: npx tsx scripts/3-checkStatus.ts <eventId>');
    console.error('Example: npx tsx scripts/3-checkStatus.ts GENESIS_2.0');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌  Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  console.log(`\n🔌  Connecting to MongoDB…`);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅  Connected.\n`);
  console.log(`📋  Certificate Status Report — Event: ${eventId}\n`);

  const teams = await Team.find({}).lean();

  if (teams.length === 0) {
    console.log('⚠️  No teams in database.');
    await mongoose.disconnect();
    process.exit(0);
  }

  let totalPending = 0;
  let totalReady = 0;
  let totalDispatched = 0;
  let totalMissing = 0;

  for (const team of teams as any[]) {
    const teamId = team._id.toString();
    const certs = await Certificate.find({
      teamId: new mongoose.Types.ObjectId(teamId),
      eventId,
    }).lean();

    const certByIndex: Record<number, any> = {};
    for (const cert of certs as any[]) {
      certByIndex[cert.memberIndex] = cert;
    }

    console.log(`\n  ┌─ ${team.teamName} (${(team.members || []).length} members)`);

    const colMember = 'Member Name'.padEnd(30);
    const colStatus = 'Status'.padEnd(12);
    const colDate = 'Dispatched At';
    console.log(`  │  ${colMember} ${colStatus} ${colDate}`);
    console.log(`  │  ${'─'.repeat(65)}`);

    for (let i = 0; i < (team.members || []).length; i++) {
      const member = team.members[i];
      const cert = certByIndex[i];

      let status: string;
      let dispatchedAt = '';

      if (!cert) {
        status = 'MISSING';
        totalMissing++;
      } else if (cert.status === 'dispatched') {
        status = 'dispatched';
        dispatchedAt = cert.dispatchedAt
          ? new Date(cert.dispatchedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          : '—';
        totalDispatched++;
      } else if (cert.status === 'ready') {
        status = 'ready';
        totalReady++;
      } else {
        status = 'pending';
        totalPending++;
      }

      const statusDisplay =
        status === 'dispatched'
          ? `✅ dispatched`
          : status === 'ready'
          ? `🟡 ready`
          : status === 'MISSING'
          ? `❌ MISSING`
          : `⬜ pending`;

      console.log(
        `  │  ${member.name.substring(0, 29).padEnd(30)} ${statusDisplay.padEnd(16)} ${dispatchedAt}`
      );
    }

    console.log(`  └${'─'.repeat(67)}`);
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n📊  Summary`);
  console.log(`    ✅  Dispatched : ${totalDispatched}`);
  console.log(`    🟡  Ready      : ${totalReady}`);
  console.log(`    ⬜  Pending    : ${totalPending}`);
  console.log(`    ❌  Missing    : ${totalMissing}`);
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
