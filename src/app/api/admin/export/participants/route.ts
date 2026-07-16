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
  foodPreference: 'veg' | 'non-veg';
  isLeader: boolean;
};

type ExportTeam = {
  id: string;
  teamName: string;
  college: string;
  semester: string;
  contactNumber: string;
  email: string;
  foodPreference: 'veg' | 'non-veg';
  members: ExportMember[];
  memberCount: number;
  paymentScreenshotUrl: string;
  paymentScreenshotPublicId: string;
  transactionId: string;
  paymentStatus: 'pending_verification' | 'verified' | 'rejected';
  registrationStatus: 'submitted' | 'confirmed';
  checkedIn: boolean;
  checkedInAt: string | null;
  credentialsUsername: string;
  scoreboardPoints: number;
  mustResetPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

type SheetValue = string | number | boolean | null;
type SheetRow = Record<string, SheetValue>;

const csvColumns: Array<keyof ExportTeam> = [
  'id',
  'teamName',
  'college',
  'semester',
  'contactNumber',
  'email',
  'foodPreference',
  'memberCount',
  'members',
  'paymentScreenshotUrl',
  'paymentScreenshotPublicId',
  'transactionId',
  'paymentStatus',
  'registrationStatus',
  'checkedIn',
  'checkedInAt',
  'credentialsUsername',
  'scoreboardPoints',
  'mustResetPassword',
  'createdAt',
  'updatedAt',
];

const teamSheetColumns = [
  { key: 'id', header: 'Team ID' },
  { key: 'teamName', header: 'Team Name' },
  { key: 'college', header: 'College' },
  { key: 'semester', header: 'Semester' },
  { key: 'contactNumber', header: 'Contact Number' },
  { key: 'email', header: 'Team Email' },
  { key: 'foodPreference', header: 'Food Preference' },
  { key: 'memberCount', header: 'Member Count' },
  { key: 'membersJson', header: 'Members JSON' },
  { key: 'paymentScreenshotUrl', header: 'Payment Screenshot URL' },
  { key: 'paymentScreenshotPublicId', header: 'Payment Screenshot Public ID' },
  { key: 'transactionId', header: 'Transaction ID' },
  { key: 'paymentStatus', header: 'Payment Status' },
  { key: 'registrationStatus', header: 'Registration Status' },
  { key: 'checkedIn', header: 'Checked In' },
  { key: 'checkedInAt', header: 'Checked In At' },
  { key: 'credentialsUsername', header: 'Credentials Username' },
  { key: 'scoreboardPoints', header: 'Scoreboard Points' },
  { key: 'mustResetPassword', header: 'Must Reset Password' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'updatedAt', header: 'Updated At' },
] as const;

const memberSheetColumns = [
  { key: 'teamId', header: 'Team ID' },
  { key: 'teamName', header: 'Team Name' },
  { key: 'college', header: 'Team College' },
  { key: 'semester', header: 'Team Semester' },
  { key: 'contactNumber', header: 'Team Contact Number' },
  { key: 'teamEmail', header: 'Team Email' },
  { key: 'memberIndex', header: 'Member Index' },
  { key: 'name', header: 'Member Name' },
  { key: 'role', header: 'Role' },
  { key: 'email', header: 'Member Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'memberCollege', header: 'Member College' },
  { key: 'memberSemester', header: 'Member Semester' },
  { key: 'foodPreference', header: 'Food Preference' },
  { key: 'isLeader', header: 'Is Leader' },
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

  const normalized = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${normalized.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
}

type CsvTeam = Omit<ExportTeam, 'members'> & { members: string };

function buildCsv(rows: ExportTeam[]) {
  const header = csvColumns.join(',');
  const lines = rows.map((row) => {
    const csvRow: CsvTeam = {
      ...row,
      members: JSON.stringify(row.members),
    };

    return csvColumns.map((column) => escapeCsv(csvRow[column])).join(',');
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
    crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
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
  const teamRows: SheetRow[] = rows.map((row) => ({
    id: row.id,
    teamName: row.teamName,
    college: row.college,
    semester: row.semester,
    contactNumber: row.contactNumber,
    email: row.email,
    foodPreference: row.foodPreference,
    memberCount: row.memberCount,
    membersJson: JSON.stringify(row.members),
    paymentScreenshotUrl: row.paymentScreenshotUrl,
    paymentScreenshotPublicId: row.paymentScreenshotPublicId,
    transactionId: row.transactionId,
    paymentStatus: row.paymentStatus,
    registrationStatus: row.registrationStatus,
    checkedIn: row.checkedIn,
    checkedInAt: row.checkedInAt || '',
    credentialsUsername: row.credentialsUsername,
    scoreboardPoints: row.scoreboardPoints,
    mustResetPassword: row.mustResetPassword,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  const memberRows: SheetRow[] = rows.flatMap((row) =>
    row.members.map((member, index) => ({
      teamId: row.id,
      teamName: row.teamName,
      college: row.college,
      semester: row.semester,
      contactNumber: row.contactNumber,
      teamEmail: row.email,
      memberIndex: index + 1,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      memberCollege: member.college,
      memberSemester: member.semester,
      foodPreference: member.foodPreference,
      isLeader: member.isLeader,
    }))
  );

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Teams" sheetId="1" r:id="rId1"/>
    <sheet name="Members" sheetId="2" r:id="rId2"/>
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
  return `participants-export-${stamp}.${format}`;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');

    const format = (req.nextUrl.searchParams.get('format') === 'xlsx'
      ? 'xlsx'
      : 'csv') as ExportFormat;

    const teams = await Team.find().sort({ createdAt: 1 }).lean();

    const participants: ExportTeam[] = teams.map((team) => ({
      id: team._id.toString(),
      teamName: team.teamName,
      college: team.college || '',
      semester: team.semester || '',
      contactNumber: team.contactNumber || '',
      email: team.email,
      foodPreference: team.foodPreference || 'veg',
      members: (team.members || []).map((member) => ({
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone || '',
        college: member.college || '',
        semester: member.semester || '',
        foodPreference: member.foodPreference || 'veg',
        isLeader: member.isLeader,
      })),
      memberCount: team.members?.length || 0,
      paymentScreenshotUrl: team.paymentScreenshotUrl,
      paymentScreenshotPublicId: team.paymentScreenshotPublicId,
      transactionId: team.transactionId,
      paymentStatus: team.paymentStatus,
      registrationStatus: team.registrationStatus,
      checkedIn: team.checkedIn,
      checkedInAt: toIsoString(team.checkedInAt),
      credentialsUsername: team.credentials?.username || '',
      scoreboardPoints: team.scoreboardPoints ?? 0,
      mustResetPassword: team.mustResetPassword,
      createdAt: toIsoString(team.createdAt) || '',
      updatedAt: toIsoString(team.updatedAt) || '',
    }));

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


