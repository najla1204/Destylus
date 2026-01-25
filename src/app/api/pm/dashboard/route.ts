import { NextResponse } from 'next/server';
import { connectToDB, Attendance } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site');
    const date = searchParams.get('date');
    
    // Build query
    const query: any = {};
    
    if (site) {
      query.site = site;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.checkInTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    // Get all attendance records
    const attendanceRecords = await Attendance.find(query)
      .sort({ checkInTime: -1 })
      .lean();
    
    // Group by employee and get their latest status
    const employeeMap = new Map();
    
    attendanceRecords.forEach(record => {
      const key = record.employeeId;
      
      if (!employeeMap.has(key)) {
        employeeMap.set(key, {
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          site: record.site,
          latestCheckIn: record.checkInTime,
          latestCheckOut: record.checkOutTime,
          status: 'checked-out',
          totalRecords: 1,
          pendingApprovals: 0
        });
      } else {
        const employee = employeeMap.get(key);
        employee.totalRecords++;
        
        // Update latest check-in if this is more recent
        if (new Date(record.checkInTime) > new Date(employee.latestCheckIn)) {
          employee.latestCheckIn = record.checkInTime;
          employee.latestCheckOut = record.checkOutTime;
        }
      }
      
      // Check if this record is pending approval
      if (record.status === 'pending') {
        const employee = employeeMap.get(key);
        employee.pendingApprovals++;
      }
      
      // Determine current status
      const employee = employeeMap.get(key);
      if (!record.checkOutTime && record.status !== 'rejected') {
        employee.status = 'checked-in';
      }
    });
    
    const employees = Array.from(employeeMap.values());
    
    // Get unique sites
    const sites = [...new Set(attendanceRecords.map(r => r.site))];
    
    return NextResponse.json({ 
      employees,
      sites,
      totalRecords: attendanceRecords.length
    });
    
  } catch (error) {
    console.error('Error fetching PM dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
