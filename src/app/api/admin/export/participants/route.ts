import { NextRequest, NextResponse } from 'next/server';
import { deflateRawSync } from 'node:zlib';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Team from '@/models/Team';

type ExportFormat = 'csv' | 'xlsx';

type ExportMember = {
  name: string;
  role: string;
  email: string;
  phone: string;
  college: string;
  semester: string;
  isLeader: boolean;
};

type ExportStationScores = {
  debugArena: number;
  systemDesignSprint: number;
  codeReviewChallenge: number;
  aiEngineeringChallenge: number;
  deploymentSprint: number;
  mockTechnicalInterview: number;
};

type ExportTeam = {
  id: string;
  teamName: string;
  route: string;
  college: string;
  semester: string;
  contactNumber: string;
  email: string;
  members: ExportMember[];
  memberCount: number;
  amountPaid: number;
  paymentScreenshotUrl: string;
  paymentScreenshotPublicId: string;
  transactionId: string;
  paymentStatus: 'pending_verification' | 'verified' | 'rejected';
  registrationStatus: 'submitted' | 'confirmed';
  checkedIn: boolean;
  checkedInAt: string | null;
  credentialsUsername: string;
  credentialsTemporaryPassword: string;
  scoreboardPoints: number;
  stationScores: ExportStationScores;
  mustResetPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

type SheetValue = string | number | boolean | null;
type SheetRow = Record<string, SheetValue>;

const teamSheetColumns = [
  { key: 'id', header: 'Team ID' },
  { key: 'teamName', header: 'Team Name' },
  { key: 'route', header: 'Track / Route' },
  { key: 'college', header: 'College' },
  { key: 'semester', header: 'Semester' },
  { key: 'contactNumber', header: 'Team Contact Number' },
  { key: 'email', header: 'Team Email' },
  { key: 'memberCount', header: 'Total Members' },
  { key: 'paymentStatus', header: 'Payment Status' },
  { key: 'amountPaid', header: 'Amount Paid (₹)' },
  { key: 'transactionId', header: 'Transaction ID' },
  { key: 'registrationStatus', header: 'Registration Status' },
  { key: 'checkedIn', header: 'Checked In' },
  { key: 'checkedInAt', header: 'Checked In At' },
  { key: 'credentialsUsername', header: 'Username' },
  { key: 'credentialsTemporaryPassword', header: 'Password (Temp)' },
  { key: 'scoreboardPoints', header: 'Total Points' },
  { key: 'scoreDebugArena', header: 'Debug Arena Score' },
  { key: 'scoreSystemDesign', header: 'System Design Score' },
  { key: 'scoreCodeReview', header: 'Code Review Score' },
  { key: 'scoreAiEngineering', header: 'AI Engineering Score' },
  { key: 'scoreDeployment', header: 'Deployment Score' },
  { key: 'scoreMockInterview', header: 'Mock Interview Score' },
  { key: 'membersSummary', header: 'All Members Summary' },
  // Flattened Leader (Member 1)
  { key: 'leaderName', header: 'Leader Name' },
  { key: 'leaderRole', header: 'Leader Role' },
  { key: 'leaderEmail', header: 'Leader Email' },
  { key: 'leaderPhone', header: 'Leader Phone' },
  { key: 'leaderCollege', header: 'Leader College' },
  { key: 'leaderSemester', header: 'Leader Semester' },
  // Flattened Member 2
  { key: 'member2Name', header: 'Member 2 Name' },
  { key: 'member2Role', header: 'Member 2 Role' },
  { key: 'member2Email', header: 'Member 2 Email' },
  { key: 'member2Phone', header: 'Member 2 Phone' },
  { key: 'member2College', header: 'Member 2 College' },
  { key: 'member2Semester', header: 'Member 2 Semester' },
  // Flattened Member 3
  { key: 'member3Name', header: 'Member 3 Name' },
  { key: 'member3Role', header: 'Member 3 Role' },
  { key: 'member3Email', header: 'Member 3 Email' },
  { key: 'member3Phone', header: 'Member 3 Phone' },
  { key: 'member3College', header: 'Member 3 College' },
  { key: 'member3Semester', header: 'Member 3 Semester' },
  // Flattened Member 4
  { key: 'member4Name', header: 'Member 4 Name' },
  { key: 'member4Role', header: 'Member 4 Role' },
  { key: 'member4Email', header: 'Member 4 Email' },
  { key: 'member4Phone', header: 'Member 4 Phone' },
  { key: 'member4College', header: 'Member 4 College' },
  { key: 'member4Semester', header: 'Member 4 Semester' },
  // Flattened Member 5
  { key: 'member5Name', header: 'Member 5 Name' },
  { key: 'member5Role', header: 'Member 5 Role' },
  { key: 'member5Email', header: 'Member 5 Email' },
  { key: 'member5Phone', header: 'Member 5 Phone' },
  { key: 'member5College', header: 'Member 5 College' },
  { key: 'member5Semester', header: 'Member 5 Semester' },
  // Flattened Member 6
  { key: 'member6Name', header: 'Member 6 Name' },
  { key: 'member6Role', header: 'Member 6 Role' },
  { key: 'member6Email', header: 'Member 6 Email' },
  { key: 'member6Phone', header: 'Member 6 Phone' },
  { key: 'member6College', header: 'Member 6 College' },
  { key: 'member6Semester', header: 'Member 6 Semester' },
  // Metadata
  { key: 'paymentScreenshotUrl', header: 'Payment Screenshot URL' },
  { key: 'createdAt', header: 'Registration Date' },
  { key: 'updatedAt', header: 'Last Updated' },
] as const;

const memberSheetColumns = [
  { key: 'teamId', header: 'Team ID' },
  { key: 'teamName', header: 'Team Name' },
  { key: 'route', header: 'Track / Route' },
  { key: 'teamCollege', header: 'Team College' },
  { key: 'teamSemester', header: 'Team Semester' },
  { key: 'teamContactNumber', header: 'Team Contact Number' },
  { key: 'teamEmail', header: 'Team Email' },
  { key: 'paymentStatus', header: 'Payment Status' },
  { key: 'amountPaid', header: 'Amount Paid (₹)' },
  { key: 'transactionId', header: 'Transaction ID' },
  { key: 'registrationStatus', header: 'Registration Status' },
  { key: 'checkedIn', header: 'Checked In' },
  { key: 'credentialsUsername', header: 'Team Username' },
  { key: 'scoreboardPoints', header: 'Scoreboard Points' },
  { key: 'memberIndex', header: 'Member Index' },
  { key: 'isLeader', header: 'Is Leader' },
  { key: 'name', header: 'Member Name' },
  { key: 'role', header: 'Role' },
  { key: 'email', header: 'Member Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'memberCollege', header: 'Member College' },
  { key: 'memberSemester', header: 'Member Semester' },
] as const;

function toIsoString(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function escapeCsv(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  const normalized = typeof value === 'string' ? value : String(value);
  return `"${normalized.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

function transformTeamToSheetRow(row: ExportTeam): SheetRow {
  const leader = row.members.find((m) => m.isLeader) || row.members[0];
  const membersWithoutLeader = row.members.filter((m) => m !== leader);

  const getMemberAt = (index: number) => {
    // 0 is leader, 1 is 2nd member, etc.
    if (index === 0) return leader;
    return membersWithoutLeader[index - 1];
  };

  const m1 = getMemberAt(0);
  const m2 = getMemberAt(1);
  const m3 = getMemberAt(2);
  const m4 = getMemberAt(3);
  const m5 = getMemberAt(4);
  const m6 = getMemberAt(5);

  const membersSummary = row.members
    .map(
      (m, i) =>
        `${i + 1}. ${m.name} (${m.role}${m.isLeader ? ' - LEADER' : ''}) | Phone: ${m.phone || 'N/A'} | Email: ${m.email} | College: ${m.college || row.college || 'N/A'} (S${m.semester || row.semester || 'N/A'})`
    )
    .join('\n');

  return {
    id: row.id,
    teamName: row.teamName,
    route: row.route ? row.route.charAt(0).toUpperCase() + row.route.slice(1) : 'Foundation',
    college: row.college,
    semester: row.semester,
    contactNumber: row.contactNumber,
    email: row.email,
    memberCount: row.memberCount,
    paymentStatus: row.paymentStatus ? row.paymentStatus.replace('_', ' ').toUpperCase() : 'PENDING',
    amountPaid: row.amountPaid || 0,
    transactionId: row.transactionId || '',
    registrationStatus: row.registrationStatus ? row.registrationStatus.toUpperCase() : 'SUBMITTED',
    checkedIn: row.checkedIn ? 'Yes' : 'No',
    checkedInAt: row.checkedInAt || '',
    credentialsUsername: row.credentialsUsername || '',
    credentialsTemporaryPassword: row.credentialsTemporaryPassword || '',
    scoreboardPoints: row.scoreboardPoints || 0,
    scoreDebugArena: row.stationScores?.debugArena ?? 0,
    scoreSystemDesign: row.stationScores?.systemDesignSprint ?? 0,
    scoreCodeReview: row.stationScores?.codeReviewChallenge ?? 0,
    scoreAiEngineering: row.stationScores?.aiEngineeringChallenge ?? 0,
    scoreDeployment: row.stationScores?.deploymentSprint ?? 0,
    scoreMockInterview: row.stationScores?.mockTechnicalInterview ?? 0,
    membersSummary,
    // Leader
    leaderName: m1?.name || '',
    leaderRole: m1?.role || 'Leader',
    leaderEmail: m1?.email || '',
    leaderPhone: m1?.phone || '',
    leaderCollege: m1?.college || row.college || '',
    leaderSemester: m1?.semester || row.semester || '',
    // Member 2
    member2Name: m2?.name || '',
    member2Role: m2?.role || '',
    member2Email: m2?.email || '',
    member2Phone: m2?.phone || '',
    member2College: m2?.college || row.college || '',
    member2Semester: m2?.semester || row.semester || '',
    // Member 3
    member3Name: m3?.name || '',
    member3Role: m3?.role || '',
    member3Email: m3?.email || '',
    member3Phone: m3?.phone || '',
    member3College: m3?.college || row.college || '',
    member3Semester: m3?.semester || row.semester || '',
    // Member 4
    member4Name: m4?.name || '',
    member4Role: m4?.role || '',
    member4Email: m4?.email || '',
    member4Phone: m4?.phone || '',
    member4College: m4?.college || row.college || '',
    member4Semester: m4?.semester || row.semester || '',
    // Member 5
    member5Name: m5?.name || '',
    member5Role: m5?.role || '',
    member5Email: m5?.email || '',
    member5Phone: m5?.phone || '',
    member5College: m5?.college || row.college || '',
    member5Semester: m5?.semester || row.semester || '',
    // Member 6
    member6Name: m6?.name || '',
    member6Role: m6?.role || '',
    member6Email: m6?.email || '',
    member6Phone: m6?.phone || '',
    member6College: m6?.college || row.college || '',
    member6Semester: m6?.semester || row.semester || '',
    // URLs
    paymentScreenshotUrl: row.paymentScreenshotUrl || '',
    createdAt: row.createdAt || '',
    updatedAt: row.updatedAt || '',
  };
}

function buildCsv(rows: ExportTeam[]) {
  const header = teamSheetColumns.map((col) => escapeCsv(col.header)).join(',');
  const lines = rows.map((row) => {
    const transformed = transformTeamToSheetRow(row);
    return teamSheetColumns.map((column) => escapeCsv(transformed[column.key])).join(',');
  });

  return ['\ufeff' + header, ...lines].join('\n');
}

function xmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function columnName(index: number) {
  let current = index + 1;
  let name = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }

  return name;
}

function dosDateTime(date: Date) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  crcTable[index] = crc >>> 0;
}

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    crc = crcTable[(crc ^ buffer[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(entries: Array<{ name: string; data: Buffer }>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const timestamp = dosDateTime(new Date());

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8');
    const compressed = deflateRawSync(entry.data);
    const crc = crc32(entry.data);

    const localHeader = Buffer.alloc(30 + nameBuffer.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(timestamp.dosTime, 10);
    localHeader.writeUInt16LE(timestamp.dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuffer.copy(localHeader, 30);

    localParts.push(localHeader, compressed);

    const centralHeader = Buffer.alloc(46 + nameBuffer.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(timestamp.dosTime, 12);
    centralHeader.writeUInt16LE(timestamp.dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    nameBuffer.copy(centralHeader, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function buildSheetXml(rows: SheetRow[], columns: ReadonlyArray<{ key: string; header: string }>) {
  const rowXml = [
    `<row r="1">${columns
      .map((column, index) => `<c r="${columnName(index)}1" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(column.header)}</t></is></c>`)
      .join('')}</row>`,
    ...rows.map((row, rowIndex) => {
      const excelRow = rowIndex + 2;
      return `<row r="${excelRow}">${columns
        .map((column, columnIndex) => {
          const value = row[column.key];
          const cellRef = `${columnName(columnIndex)}${excelRow}`;
          if (typeof value === 'number' && Number.isFinite(value)) {
            return `<c r="${cellRef}" t="n"><v>${value}</v></c>`;
          }
          if (typeof value === 'boolean') {
            return `<c r="${cellRef}" t="b"><v>${value ? 1 : 0}</v></c>`;
          }
          return `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
        })
        .join('')}</row>`;
    }),
  ].join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

function buildXlsx(rows: ExportTeam[]) {
  const teamRows: SheetRow[] = rows.map((row) => transformTeamToSheetRow(row));

  const memberRows: SheetRow[] = rows.flatMap((row) =>
    row.members.map((member, index) => ({
      teamId: row.id,
      teamName: row.teamName,
      route: row.route ? row.route.charAt(0).toUpperCase() + row.route.slice(1) : 'Foundation',
      teamCollege: row.college,
      teamSemester: row.semester,
      teamContactNumber: row.contactNumber,
      teamEmail: row.email,
      paymentStatus: row.paymentStatus ? row.paymentStatus.replace('_', ' ').toUpperCase() : 'PENDING',
      amountPaid: row.amountPaid || 0,
      transactionId: row.transactionId || '',
      registrationStatus: row.registrationStatus ? row.registrationStatus.toUpperCase() : 'SUBMITTED',
      checkedIn: row.checkedIn ? 'Yes' : 'No',
      credentialsUsername: row.credentialsUsername || '',
      scoreboardPoints: row.scoreboardPoints || 0,
      memberIndex: index + 1,
      isLeader: member.isLeader ? 'Yes' : 'No',
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone || '',
      memberCollege: member.college || row.college || '',
      memberSemester: member.semester || row.semester || '',
    }))
  );

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Teams" sheetId="1" r:id="rId1"/>
    <sheet name="All Participants" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const sheet1Xml = buildSheetXml(teamRows, teamSheetColumns);
  const sheet2Xml = buildSheetXml(memberRows, memberSheetColumns);

  const entries = [
    { name: '[Content_Types].xml', data: Buffer.from(contentTypesXml, 'utf8') },
    { name: '_rels/.rels', data: Buffer.from(rootRelsXml, 'utf8') },
    { name: 'xl/workbook.xml', data: Buffer.from(workbookXml, 'utf8') },
    { name: 'xl/_rels/workbook.xml.rels', data: Buffer.from(workbookRelsXml, 'utf8') },
    { name: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheet1Xml, 'utf8') },
    { name: 'xl/worksheets/sheet2.xml', data: Buffer.from(sheet2Xml, 'utf8') },
  ];

  return createZip(entries);
}

function buildFilename(format: ExportFormat) {
  const stamp = new Date().toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z');
  return `genesis-teams-export-${stamp}.${format}`;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');

    const format = (req.nextUrl.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv') as ExportFormat;

    const teams = await Team.find().sort({ createdAt: 1 }).lean();

    const participants: ExportTeam[] = teams.map((team: any) => {
      const college: string = team.college ?? '';
      const semester: string = team.semester ?? '';
      const contactNumber: string = team.contactNumber ?? '';

      return {
        id: team._id.toString(),
        teamName: team.teamName,
        route: team.route ?? 'foundation',
        college,
        semester,
        contactNumber,
        email: team.email,
        members: (team.members || []).map((member: any) => {
          const memberCollege: string = member.college ?? '';
          const memberSemester: string = member.semester ?? '';
          const memberPhone: string = member.phone ?? '';

          return {
            name: member.name,
            role: member.role,
            email: member.email,
            phone: memberPhone,
            college: memberCollege,
            semester: memberSemester,
            isLeader: Boolean(member.isLeader),
          };
        }),
        memberCount: team.members?.length ?? 0,
        amountPaid: team.amountPaid ?? 0,
        paymentScreenshotUrl: team.paymentScreenshotUrl ?? '',
        paymentScreenshotPublicId: team.paymentScreenshotPublicId ?? '',
        transactionId: team.transactionId ?? '',
        paymentStatus: team.paymentStatus,
        registrationStatus: team.registrationStatus,
        checkedIn: Boolean(team.checkedIn),
        checkedInAt: toIsoString(team.checkedInAt),
        credentialsUsername: team.credentials?.username ?? '',
        credentialsTemporaryPassword: team.credentials?.temporaryPassword ?? '',
        scoreboardPoints: team.scoreboardPoints ?? 0,
        stationScores: {
          debugArena: team.stationScores?.debugArena ?? 0,
          systemDesignSprint: team.stationScores?.systemDesignSprint ?? 0,
          codeReviewChallenge: team.stationScores?.codeReviewChallenge ?? 0,
          aiEngineeringChallenge: team.stationScores?.aiEngineeringChallenge ?? 0,
          deploymentSprint: team.stationScores?.deploymentSprint ?? 0,
          mockTechnicalInterview: team.stationScores?.mockTechnicalInterview ?? 0,
        },
        mustResetPassword: Boolean(team.mustResetPassword),
        createdAt: toIsoString(team.createdAt) ?? '',
        updatedAt: toIsoString(team.updatedAt) ?? '',
      };
    });

    if (format === 'xlsx') {
      const workbook = buildXlsx(participants);
      return new NextResponse(workbook, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${buildFilename('xlsx')}"`,
        },
      });
    }

    const csv = buildCsv(participants);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${buildFilename('csv')}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to export participants';
    const status = message === 'Authentication required' ? 401 : message === 'Insufficient permissions' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}



