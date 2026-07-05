import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import DeletedTeam from '@/models/DeletedTeam';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const searchParams = req.nextUrl.searchParams;
    
    const search = searchParams.get('search');
    const paymentStatus = searchParams.get('paymentStatus');
    const checkedIn = searchParams.get('checkedIn');
    const isDeleted = searchParams.get('deleted') === 'true';
    
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    const query: Record<string, unknown> = {};
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { teamName: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
        { contactNumber: searchRegex },
        { 'members.name': searchRegex },
        { 'members.email': searchRegex },
        { 'members.phone': searchRegex },
      ];
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (checkedIn !== null) {
      query.checkedIn = checkedIn === 'true';
    }
    
    let total: number;
    let teams: any[];

    if (isDeleted) {
      total = await DeletedTeam.countDocuments(query);
      teams = await DeletedTeam.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-credentials.passwordHash');
    } else {
      total = await Team.countDocuments(query);
      teams = await Team.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-credentials.passwordHash');
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

