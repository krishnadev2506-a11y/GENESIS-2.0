import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ScheduleItem from '@/models/ScheduleItem';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const { id } = await params;
    const body = await req.json();
    
    const updatedItem = await ScheduleItem.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );
    
    if (!updatedItem) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Schedule PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    await requireAuth(req, 'admin');
    
    const { id } = await params;
    
    const deletedItem = await ScheduleItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json({ error: 'Schedule item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Schedule DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
