import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import DeletedTeam from '@/models/DeletedTeam';
import { requireAuth } from '@/lib/auth';

// Allowlist of valid sort fields to prevent NoSQL/field injection
const ALLOWED_SORT_FIELDS = new Set([
  'createdAt', 'updatedAt', 'teamName', 'college',
  'paymentStatus', 'scoreboardPoints', 'checkedIn',
]);

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const searchParams = req.nextUrl.searchParams;
    
    const search = searchParams.get('search');
    const paymentStatus = searchParams.get('paymentStatus');
    const checkedIn = searchParams.get('checkedIn');
    const isDeleted = searchParams.get('deleted') === 'true';
    const route = searchParams.get('route');
    
    // Validate sortBy against allowlist to prevent field injection
    const rawSortBy = searchParams.get('sortBy') || 'createdAt';
    const sortBy = ALLOWED_SORT_FIELDS.has(rawSortBy) ? rawSortBy : 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    // Clamp page and limit to sane values
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;
    
    const query: Record<string, unknown> = {};
    
    if (search) {
      // Use the text index for fast search
      query.$text = { $search: search };
    }
    
    if (route) {
      const validRoutes = ['foundation'];
      if (validRoutes.includes(route)) {
        query.route = route;
      }
    }

    if (paymentStatus) {
      // Allowlist valid payment statuses
      const validStatuses = ['pending_verification', 'verified', 'rejected'];
      if (validStatuses.includes(paymentStatus)) {
        query.paymentStatus = paymentStatus;
      }
    }
    
    // Bug fix: check for non-empty string before applying filter
    if (checkedIn !== null && checkedIn !== '') {
      query.checkedIn = checkedIn === 'true';
    }

    // Removed duplicated block
    
    let total: number;
    let teams: any[];

    if (isDeleted) {
      total = await DeletedTeam.countDocuments(query);
      teams = await DeletedTeam.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-credentials.passwordHash')
        .lean();
    } else {
      total = await Team.countDocuments(query);
      teams = await Team.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-credentials.passwordHash')
        .lean();
    }
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      teams,
      total,
      page,
      totalPages,
    });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Teams GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
