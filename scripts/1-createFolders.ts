/**
 * scripts/1-createFolders.ts
 *
 * Reads all teams from MongoDB and creates local folder structure on disk
 * so you can paste certificate PDFs into the right places.
 *
 * Usage:
 *   npx tsx scripts/1-createFolders.ts <eventId> <eventName>
 *
 * Example:
 *   npx tsx scripts/1-createFolders.ts GENESIS_2.0 GENESIS_2.0
 *
 * Output:
 *   ./local-certs/<eventName>/<teamName_sanitized>__<teamId>/
 *   Inside each: one .txt placeholder per member.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ---- Inline Team model (avoids Next.js import chain issues in standalone scripts) ----
const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    college: { type: String },
    semester: { type: String },
    isLeader: { type: Boolean, default: false },
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true },
    members: [TeamMemberSchema],
  },
  { strict: false, timestamps: true }
);

const Team = mongoose.models.Team || mongoose.model('Team', TeamSchema);

// ---- Utility: sanitize a string for use in a folder name ----
function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

async function main() {
  const eventId = process.argv[2];
  const eventName = process.argv[3];

  if (!eventId || !eventName) {
    console.error('Usage: npx tsx scripts/1-createFolders.ts <eventId> <eventName>');
    console.error('Example: npx tsx scripts/1-createFolders.ts GENESIS_2.0 GENESIS_2.0');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌  Missing MONGODB_URI in .env.local');
    process.exit(1);
  }

  console.log(`\n🔌  Connecting to MongoDB…`);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅  Connected.\n');

  const teams = await Team.find({}).lean();

  if (teams.length === 0) {
    console.log('⚠️  No teams found in database. Nothing to create.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const basePath = path.resolve(process.cwd(), 'local-certs', sanitize(eventName));
  fs.mkdirSync(basePath, { recursive: true });

  console.log(`📁  Base folder: ${basePath}\n`);
  console.log(
    '─'.repeat(90)
  );
  console.log(
    `${'TEAM NAME'.padEnd(35)} ${'MEMBERS'.padStart(7)}  FOLDER PATH`
  );
  console.log('─'.repeat(90));

  let totalFolders = 0;
  let totalPlaceholders = 0;

  for (const team of teams as any[]) {
    const teamId = team._id.toString();
    const folderName = `${sanitize(team.teamName)}__${teamId}`;
    const teamFolder = path.join(basePath, folderName);

    fs.mkdirSync(teamFolder, { recursive: true });
    totalFolders++;

    const members: any[] = team.members || [];

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const placeholderName = `${i}_${sanitize(member.name)}_PASTE_CERTIFICATE_HERE.txt`;
      const placeholderPath = path.join(teamFolder, placeholderName);

      if (!fs.existsSync(placeholderPath)) {
        fs.writeFileSync(
          placeholderPath,
          `Replace this file with the PDF certificate for ${member.name} (member index ${i}) from team ${team.teamName}.\n` +
            `Rename the PDF to: ${i}_${sanitize(member.name)}.pdf\n`
        );
        totalPlaceholders++;
      }
    }

    console.log(
      `${team.teamName.substring(0, 34).padEnd(35)} ${String(members.length).padStart(7)}  ${teamFolder}`
    );
  }

  console.log('─'.repeat(90));
  console.log(
    `\n✅  Done. Created ${totalFolders} team folders and ${totalPlaceholders} placeholder files.\n`
  );
  console.log(
    `📌  Next step: paste the PDF certificate for each member into the correct team folder.`
  );
  console.log(
    `    Name each PDF: <memberIndex>_<memberName_sanitized>.pdf`
  );
  console.log(
    `    Example: 0_Alice_Smith.pdf, 1_Bob_Jones.pdf\n`
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
