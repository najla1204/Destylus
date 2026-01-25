import { NextResponse } from 'next/server';
import { connectToDB, Attendance } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteName: string }> }
) {
  try {
    await connectToDB();

    const { siteName } = await params;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    // Build query
    const query: any = { site: siteName };

    if (startDate && endDate) {
      query.checkInTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    // Get all attendance records for this site
    const attendanceRecords = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .lean();

    // Group by employee for summary
    const employeeSummary = new Map();

    attendanceRecords.forEach(record => {
      const key = record.employeeId;

      if (!employeeSummary.has(key)) {
        employeeSummary.set(key, {
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          totalDays: 0,
          totalHours: 0,
          pendingApprovals: 0,
          lastCheckIn: null,
          currentStatus: 'checked-out'
        });
      }

      const summary = employeeSummary.get(key);
      summary.totalDays++;

      // Calculate hours if check-out exists
      if (record.checkOutTime) {
        const hours = (new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60);
        summary.totalHours += hours;
      }

      // Track pending approvals
      if (record.status === 'pending') {
        summary.pendingApprovals++;
      }

      // Update last check-in and current status
      if (!summary.lastCheckIn || new Date(record.checkInTime) > new Date(summary.lastCheckIn)) {
        summary.lastCheckIn = record.checkInTime;
        summary.currentStatus = !record.checkOutTime && record.status !== 'rejected' ? 'checked-in' : 'checked-out';
      }
    });

    // Process individual records for detailed view
    const processedRecords = attendanceRecords.map(record => ({
      id: record._id,
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      date: new Date(record.checkInTime).toLocaleDateString(),
      checkInTime: new Date(record.checkInTime).toLocaleTimeString(),
      checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : null,
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
      site: siteName,
      employeeSummary: Array.from(employeeSummary.values()),
      attendanceRecords: processedRecords,
      totalRecords: processedRecords.length,
      summary: {
        totalEmployees: employeeSummary.size,
        totalAttendanceRecords: processedRecords.length,
        pendingApprovals: processedRecords.filter(r => r.status === 'pending').length,
        currentlyCheckedIn: Array.from(employeeSummary.values()).filter(e => e.currentStatus === 'checked-in').length
      }
    });

  } catch (error) {
    console.error('Error fetching site attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
