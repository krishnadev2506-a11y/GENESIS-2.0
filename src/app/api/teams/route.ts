import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Team from '@/models/Team';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const searchParams = req.nextUrl.searchParams;
    
    const search = searchParams.get('search');
    const paymentStatus = searchParams.get('paymentStatus');
    const checkedIn = searchParams.get('checkedIn');
    
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
      ];
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (checkedIn !== null) {
      query.checkedIn = checkedIn === 'true';
    }
    
    const total = await Team.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    const teams = await Team.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-credentials.passwordHash'); // Exclude password hashes
    
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

