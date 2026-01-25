import { NextResponse } from 'next/server';
import { connectToDB, Attendance } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    await connectToDB();

    const { employeeId } = await params;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const site = searchParams.get('site');

    // Build query
    const query: any = { employeeId };

    if (startDate && endDate) {
      query.checkInTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (site) {
      query.site = site;
    }

    // Get all attendance records for this employee
    const attendanceRecords = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .lean();

    // Get employee info from the first record
    const employeeInfo = attendanceRecords.length > 0 ? {
      employeeId: attendanceRecords[0].employeeId,
      employeeName: attendanceRecords[0].employeeName,
      sites: [...new Set(attendanceRecords.map(r => r.site))]
    } : null;

    // Process records for display
    const processedRecords = attendanceRecords.map(record => ({
      id: record._id,
      date: new Date(record.checkInTime).toLocaleDateString(),
      checkInTime: new Date(record.checkInTime).toLocaleTimeString(),
      checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : null,
      site: record.site,
      status: record.status,
      totalHours: record.checkOutTime
        ? ((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
        : null,
      attachments: record.attachments || [],
      approvedBy: record.approvedBy,
      approvedAt: record.approvedAt ? new Date(record.approvedAt).toLocaleString() : null,
      rejectionReason: record.rejectionReason
    }));

    return NextResponse.json({
      employeeInfo,
      attendanceRecords: processedRecords,
      totalRecords: processedRecords.length
    });

  } catch (error) {
    console.error('Error fetching engineer attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
