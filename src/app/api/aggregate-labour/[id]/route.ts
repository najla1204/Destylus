import { NextResponse } from 'next/server';
import { connectToDB, AggregateLabourAttendance } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    
    const log = await AggregateLabourAttendance.findByIdAndDelete(id);
    
    if (!log) {
      return NextResponse.json({ error: 'Labour log not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Labour log deleted successfully' });
  } catch (error) {
    console.error('Error deleting labour log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
