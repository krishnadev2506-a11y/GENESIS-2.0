import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ScheduleItem from '@/models/ScheduleItem';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const scheduleSchema = z.object({
  day: z.union([z.literal(1), z.literal(2)]),
  time: z.string().min(1),
  eventName: z.string().min(1),
  speaker: z.string().nullable().optional(),
  order: z.number(),
});

export async function GET() {
  try {
    await connectDB();
    const items = await ScheduleItem.find().sort({ day: 1, order: 1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Schedule GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const body = await req.json();
    const validatedData = scheduleSchema.parse(body);
    
    const newItem = await ScheduleItem.create(validatedData);
    
    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error('Schedule POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
