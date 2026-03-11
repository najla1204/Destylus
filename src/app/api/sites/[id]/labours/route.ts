import { NextResponse } from 'next/server';
import { connectToDB, Labour, AggregateLabourAttendance } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'aggregate') {
      // Fetch aggregate labour attendance logs
      const logs = await AggregateLabourAttendance.find({ siteId: id })
        .sort({ date: -1 })
        .lean();
      return NextResponse.json(logs);
    }

    // Default: fetch individual labours (legacy)
    const labours = await Labour.find({ siteId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(labours);
  } catch (error) {
    console.error('Error fetching labours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const body = await request.json();

    if (body.type === 'aggregate') {
      // Create aggregate labour attendance log
      const entries = body.entries || [];
      let totalCount = 0;
      let skilledCount = body.skilledCount || 0;
      let unskilledCount = body.unskilledCount || 0;
      let supervisorCount = body.supervisorCount || 0;

      if (entries.length > 0) {
        totalCount = entries.reduce((sum: number, e: any) => sum + (Number(e.count) || 0), 0);
        // Map common types back to legacy fields for stats
        skilledCount = entries.filter((e: any) => e.workerType === 'Skilled').reduce((sum: number, e: any) => sum + (Number(e.count) || 0), 0);
        unskilledCount = entries.filter((e: any) => e.workerType === 'Unskilled').reduce((sum: number, e: any) => sum + (Number(e.count) || 0), 0);
        supervisorCount = entries.filter((e: any) => e.workerType === 'Supervisor').reduce((sum: number, e: any) => sum + (Number(e.count) || 0), 0);
      } else {
        totalCount = (Number(skilledCount) || 0) + (Number(unskilledCount) || 0) + (Number(supervisorCount) || 0);
      }

      const log = await AggregateLabourAttendance.create({
        siteId: id,
        date: body.date || new Date(),
        skilledCount,
        unskilledCount,
        supervisorCount,
        entries,
        totalCount,
        loggedBy: body.loggedBy || 'Unknown',
        notes: body.notes || ''
      });
      return NextResponse.json(log, { status: 201 });
    }

    // Legacy: create individual labour
    const labour = await Labour.create({ ...body, siteId: id });
    return NextResponse.json(labour, { status: 201 });
  } catch (error) {
    console.error('Error creating labour:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
