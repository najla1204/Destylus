import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Attendance from '@/models/Attendance';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id: siteId } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const siteName = searchParams.get('siteName');

    // Build query: match by site name (passed as query param) or siteId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // If siteName is provided, use it; otherwise we need to look up the site name
    if (siteName) {
      query.site = siteName;
    }

    // Date range filter
    if (from || to) {
      query.checkInTime = {};
      if (from) {
        query.checkInTime.$gte = new Date(from + 'T00:00:00.000Z');
      }
      if (to) {
        query.checkInTime.$lte = new Date(to + 'T23:59:59.999Z');
      }
    }

    const records = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .lean();

    // Separate engineers from labours based on role
    const engineerRecords = records.filter(
      (r: any) => r.role === 'Site Engineer' || r.role === 'Engineer'
    );
    const labourRecords = records.filter(
      (r: any) => r.role === 'Labour' || r.role === 'Labourer' || r.role === 'Worker'
    );

    return NextResponse.json({
      siteId,
      engineerRecords,
      labourRecords,
      totalRecords: records.length,
    });
  } catch (error) {
    console.error('Error fetching site attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}
