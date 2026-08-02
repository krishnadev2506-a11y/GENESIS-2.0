import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import Certificate from '@/models/Certificate';
import cloudinary from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');

    const body = await req.json();
    const { teamId, teamName, eventId } = body;

    if (!teamId || !teamName || !eventId) {
      return NextResponse.json(
        { error: 'teamId, teamName, and eventId are required' },
        { status: 400 }
      );
    }

    // Fetch the team to get latest member list
    const team = await Team.findById(teamId).lean();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Construct expected local folder path
    const sanitizedTeamName = sanitize(teamName);
    const folderName = `${sanitizedTeamName}__${teamId}`;
    const localFolder = path.resolve(
      process.cwd(),
      'local-certs',
      sanitize(eventId),
      folderName
    );

    if (!fs.existsSync(localFolder)) {
      return NextResponse.json(
        {
          error:
            'Local folder not found. Create the folder and paste certificates first.',
          expectedPath: localFolder,
        },
        { status: 400 }
      );
    }

    const files = fs.readdirSync(localFolder);
    const pdfFiles = files.filter((f) => f.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      return NextResponse.json(
        {
          error: 'No PDF files found in the folder. Paste the certificate PDFs first.',
          expectedPath: localFolder,
        },
        { status: 400 }
      );
    }

    const members: any[] = (team as any).members || [];
    const newlyUploaded: { memberIndex: number; memberName: string; fileUrl: string }[] = [];
    const alreadyUploaded: { memberIndex: number; memberName: string }[] = [];

    for (const pdfFile of pdfFiles) {
      const firstUnderscore = pdfFile.indexOf('_');
      if (firstUnderscore === -1) continue;

      const memberIndex = parseInt(pdfFile.substring(0, firstUnderscore), 10);
      if (isNaN(memberIndex)) continue;

      // Determine member name from team.members first (authoritative), fall back to filename
      const memberFromTeam = members[memberIndex];
      const memberName = memberFromTeam?.name || pdfFile.replace(/\.pdf$/i, '').split('_').slice(1).join(' ');

      // Check if already uploaded
      const existing = await Certificate.findOne({
        teamId: new mongoose.Types.ObjectId(teamId),
        memberIndex,
        eventId,
        status: { $in: ['ready', 'dispatched'] },
      });

      if (existing) {
        alreadyUploaded.push({ memberIndex, memberName });
        continue;
      }

      const pdfPath = path.join(localFolder, pdfFile);
      const publicId = `${teamId}_${memberIndex}`;
      const cloudinaryFolder = `certificates/${sanitize(eventId)}`;

      const result = await cloudinary.uploader.upload(pdfPath, {
        folder: cloudinaryFolder,
        public_id: publicId,
        resource_type: 'raw',
        overwrite: true,
      });

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

      newlyUploaded.push({ memberIndex, memberName, fileUrl: result.secure_url });
    }

    // Find members with no certificate at all (missing)
    const missing: { memberIndex: number; memberName: string }[] = [];
    for (let i = 0; i < members.length; i++) {
      const certExists = await Certificate.findOne({
        teamId: new mongoose.Types.ObjectId(teamId),
        memberIndex: i,
        eventId,
      });
      if (!certExists) {
        missing.push({ memberIndex: i, memberName: members[i]?.name || `Member ${i}` });
      }
    }

    return NextResponse.json({
      newlyUploaded: newlyUploaded.length,
      alreadyUploaded: alreadyUploaded.length,
      missing,
      detail: { newlyUploaded, alreadyUploaded },
    });
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Insufficient permissions'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Upload team error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
