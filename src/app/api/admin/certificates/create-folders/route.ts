import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';
import cloudinary from '@/lib/cloudinary';
import fs from 'fs';
import path from 'path';

function sanitize(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');

    const body = await req.json();
    const { teamIds, eventId } = body;

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json({ error: 'teamIds array is required' }, { status: 400 });
    }
    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const teams = await Team.find({ _id: { $in: teamIds } })
      .select('teamName members _id')
      .lean();

    const basePath = path.resolve(process.cwd(), 'local-certs', sanitize(eventId));
    try {
      fs.mkdirSync(basePath, { recursive: true });
    } catch {}

    const results: {
      teamId: string;
      teamName: string;
      cloudinaryFolder: string;
      localFolder: string;
      status: 'created' | 'already_existed' | 'error';
      error?: string;
    }[] = [];

    for (const team of teams as any[]) {
      const teamId = team._id.toString();
      const folderName = `${sanitize(team.teamName)}__${teamId}`;
      const cloudinaryPath = `certificates/${sanitize(eventId)}/${folderName}`;
      const teamLocalFolder = path.join(basePath, folderName);

      // Create local folder + placeholders if on local server
      try {
        fs.mkdirSync(teamLocalFolder, { recursive: true });
        const members: any[] = team.members || [];
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          const placeholderName = `${i}_${sanitize(member.name)}_PASTE_CERTIFICATE_HERE.txt`;
          const placeholderPath = path.join(teamLocalFolder, placeholderName);
          if (!fs.existsSync(placeholderPath)) {
            fs.writeFileSync(
              placeholderPath,
              `Replace this file with the PDF certificate for ${member.name} (member index ${i}) from team ${team.teamName}.\n` +
                `Rename the PDF to: ${i}_${sanitize(member.name)}.pdf\n`
            );
          }
        }
      } catch (fsErr) {
        // Ignored if on read-only server like Vercel
      }

      try {
        await (cloudinary.api as any).create_folder(cloudinaryPath);
        results.push({
          teamId,
          teamName: team.teamName,
          cloudinaryFolder: cloudinaryPath,
          localFolder: teamLocalFolder,
          status: 'created',
        });
      } catch (err: any) {
        if (
          err?.error?.message?.toLowerCase().includes('already') ||
          err?.message?.toLowerCase().includes('already')
        ) {
          results.push({
            teamId,
            teamName: team.teamName,
            cloudinaryFolder: cloudinaryPath,
            localFolder: teamLocalFolder,
            status: 'already_existed',
          });
        } else {
          results.push({
            teamId,
            teamName: team.teamName,
            cloudinaryFolder: cloudinaryPath,
            localFolder: teamLocalFolder,
            status: 'error',
            error: err?.message || 'Unknown Cloudinary error',
          });
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    if (
      error.message === 'Authentication required' ||
      error.message === 'Insufficient permissions'
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Create folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
