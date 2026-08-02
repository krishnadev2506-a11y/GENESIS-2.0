/**
 * scripts/2-uploadAndSync.ts
 *
 * Scans local-certs/<eventFolder>/ after you have pasted the PDFs,
 * uploads each PDF to Cloudinary, upserts Certificate records in MongoDB,
 * and writes a sync-report.json to the project root.
 *
 * Usage:
 *   npx tsx scripts/2-uploadAndSync.ts <eventFolder> <eventId>
 *
 * Example:
 *   npx tsx scripts/2-uploadAndSync.ts GENESIS_2.0 GENESIS_2.0
 *
 * Idempotent: safe to run multiple times. Already-uploaded certs are skipped.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ---- Inline Certificate schema (avoids Next.js import chain) ----
const CertificateSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    memberIndex: { type: Number, required: true },
    memberName: { type: String, required: true },
    eventId: { type: String, required: true },
    fileUrl: { type: String },
    status: { type: String, enum: ['pending', 'ready', 'dispatched'], default: 'pending' },
    dispatchedAt: { type: Date },
  },
  { timestamps: true }
);
CertificateSchema.index({ teamId: 1, memberIndex: 1, eventId: 1 }, { unique: true });

const Certificate =
  mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);

// ---- Utility ----
function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

interface MissingEntry {
  teamFolder: string;
  placeholderFileName: string;
}

async function main() {
  const eventFolder = process.argv[2];
  const eventId = process.argv[3];

  if (!eventFolder || !eventId) {
    console.error('Usage: npx tsx scripts/2-uploadAndSync.ts <eventFolder> <eventId>');
    console.error('Example: npx tsx scripts/2-uploadAndSync.ts GENESIS_2.0 GENESIS_2.0');
    process.exit(1);
  }

  // Validate env vars
  const requiredEnv = ['MONGODB_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`❌  Missing ${key} in .env.local`);
      process.exit(1);
    }
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log(`\n🔌  Connecting to MongoDB…`);
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅  Connected.\n');

  const basePath = path.resolve(process.cwd(), 'local-certs', eventFolder);

  if (!fs.existsSync(basePath)) {
    console.error(`❌  Folder not found: ${basePath}`);
    console.error(`    Run script 1-createFolders.ts first.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const teamFolders = fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (teamFolders.length === 0) {
    console.log('⚠️  No team folders found inside', basePath);
    await mongoose.disconnect();
    process.exit(0);
  }

  let totalUploaded = 0;
  let totalSkipped = 0;
  const missing: MissingEntry[] = [];

  console.log(`📂  Scanning ${teamFolders.length} team folders…\n`);

  for (const folderName of teamFolders) {
    const parts = folderName.split('__');
    if (parts.length < 2) {
      console.warn(`  ⚠️  Skipping folder (unexpected format): ${folderName}`);
      continue;
    }
    const teamId = parts[parts.length - 1];
    const teamFolderPath = path.join(basePath, folderName);
    const files = fs.readdirSync(teamFolderPath);

    const pdfFiles = files.filter((f) => f.toLowerCase().endsWith('.pdf'));
    const txtFiles = files.filter((f) => f.toLowerCase().endsWith('.txt'));

    console.log(`  📁  ${folderName}`);

    for (const pdfFile of pdfFiles) {
      // Extract memberIndex from first segment before underscore
      const firstUnderscore = pdfFile.indexOf('_');
      if (firstUnderscore === -1) {
        console.warn(`     ⚠️  Cannot parse memberIndex from: ${pdfFile} — skipping`);
        continue;
      }
      const memberIndex = parseInt(pdfFile.substring(0, firstUnderscore), 10);
      if (isNaN(memberIndex)) {
        console.warn(`     ⚠️  memberIndex is not a number in: ${pdfFile} — skipping`);
        continue;
      }

      // Extract memberName from filename between first and last underscore segments
      const withoutExt = pdfFile.replace(/\.pdf$/i, '');
      const segments = withoutExt.split('_');
      // segments[0] is memberIndex, rest is memberName
      const memberName = segments.slice(1).join('_').replace(/_/g, ' ').trim() || `Member ${memberIndex}`;

      const pdfPath = path.join(teamFolderPath, pdfFile);
      const publicId = `${teamId}_${memberIndex}`;
      const cloudinaryFolder = `certificates/${eventFolder}`;

      // Check if already uploaded
      const existing = await Certificate.findOne({
        teamId: new mongoose.Types.ObjectId(teamId),
        memberIndex,
        eventId,
        status: { $in: ['ready', 'dispatched'] },
      });

      if (existing) {
        console.log(`     ✅  [SKIP] ${pdfFile} — already uploaded`);
        totalSkipped++;
        continue;
      }

      // Upload to Cloudinary
      try {
        console.log(`     ⬆️   Uploading: ${pdfFile}…`);
        const result = await cloudinary.uploader.upload(pdfPath, {
          folder: cloudinaryFolder,
          public_id: publicId,
          resource_type: 'raw',
          overwrite: true,
        });

        // Upsert Certificate document
        await Certificate.findOneAndUpdate(
          { teamId: new mongoose.Types.ObjectId(teamId), memberIndex, eventId },
          {
            $set: {
              memberName,
              fileUrl: result.secure_url,
              status: 'ready',
            },
          },
          { upsert: true, new: true }
        );

        console.log(`     ✅  Uploaded → ${result.secure_url}`);
        totalUploaded++;
      } catch (err: any) {
        console.error(`     ❌  Failed to upload ${pdfFile}: ${err.message}`);
      }
    }

    // Remaining .txt files = missing PDFs (members without certificates)
    for (const txtFile of txtFiles) {
      missing.push({ teamFolder: folderName, placeholderFileName: txtFile });
      console.log(`     ⚠️  MISSING: ${txtFile}`);
    }

    console.log('');
  }

  // Write sync-report.json
  const report = {
    eventId,
    eventFolder,
    generatedAt: new Date().toISOString(),
    totalTeams: teamFolders.length,
    totalUploaded,
    totalSkipped,
    totalMissing: missing.length,
    missing,
  };

  const reportPath = path.resolve(process.cwd(), 'sync-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('─'.repeat(60));
  console.log(`\n📊  Sync Report`);
  console.log(`    Teams scanned  : ${teamFolders.length}`);
  console.log(`    Newly uploaded : ${totalUploaded}`);
  console.log(`    Already done   : ${totalSkipped}`);
  console.log(`    Missing PDFs   : ${missing.length}`);
  console.log(`\n📄  Full report saved to: ${reportPath}\n`);

  if (missing.length > 0) {
    console.log('⚠️  Missing certificates:');
    for (const m of missing) {
      console.log(`    ${m.teamFolder} → ${m.placeholderFileName}`);
    }
    console.log('');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
