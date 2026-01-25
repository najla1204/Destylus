import { NextResponse } from 'next/server';
import { connectToDB, Attendance, User, Session } from '@/lib/db';

// GET - Get real-time attendance data
export async function GET(request: Request) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site');
    const role = searchParams.get('role');
    
    // Build query for active sessions
    const sessionQuery: any = { isActive: true };
    if (site) {
      // Get users assigned to this site
      const siteUsers = await User.find({ 
        $or: [
          { site: site },
          { allocatedSites: site }
        ]
      }).select('_id employeeId');
      
      const userIds = siteUsers.map(u => u._id);
      const employeeIds = siteUsers.map(u => u.employeeId);
      
      sessionQuery.$or = [
        { userId: { $in: userIds } },
        { employeeId: { $in: employeeIds } }
      ];
    }
    
    if (role) {
      const roleUsers = await User.find({ role }).select('_id employeeId');
      const userIds = roleUsers.map(u => u._id);
      const employeeIds = roleUsers.map(u => u.employeeId);
      
      sessionQuery.$or = [
        { userId: { $in: userIds } },
        { employeeId: { $in: employeeIds } }
      ];
    }
    
    // Get active sessions
    const activeSessions = await Session.find(sessionQuery)
      .populate('userId', 'name email role employeeId site')
      .sort({ lastActivity: -1 });
    
    // Get today's attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendanceQuery: any = {
      checkInTime: { $gte: today, $lt: tomorrow }
    };
    
    if (site) attendanceQuery.site = site;
    if (role) attendanceQuery.role = role;
    
    const todayAttendance = await Attendance.find(attendanceQuery)
      .sort({ checkInTime: -1 });
    
    // Combine data for real-time view
    const realTimeData = activeSessions.map(session => {
      const user = session.userId as any;
      const attendance = todayAttendance.find(a => a.employeeId === user.employeeId);
      
      return {
        sessionId: session._id,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          site: user.site
        },
        session: {
          loginTime: session.loginTime,
          lastActivity: session.lastActivity,
          isActive: session.isActive
        },
        attendance: attendance ? {
          id: attendance._id,
          status: attendance.status,
          checkInTime: attendance.checkInTime,
          checkOutTime: attendance.checkOutTime,
          site: attendance.site,
          approvalStatus: attendance.approvalStatus,
          inTimePhoto: attendance.inTimePhoto,
          outTimePhoto: attendance.outTimePhoto,
          location: attendance.location
        } : null
      };
    });
    
    // Get summary statistics
    const summary = {
      totalActiveUsers: activeSessions.length,
      currentlyCheckedIn: todayAttendance.filter(a => !a.checkOutTime).length,
      pendingApprovals: todayAttendance.filter(a => a.approvalStatus === 'pending').length,
      totalTodayRecords: todayAttendance.length,
      byRole: {
        engineers: realTimeData.filter(d => d.user.role === 'engineer').length,
        projectManagers: realTimeData.filter(d => d.user.role === 'project_manager').length,
        hr: realTimeData.filter(d => d.user.role === 'hr').length
      }
    };
    
    return NextResponse.json({
      realTimeData,
      summary,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching real-time attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update session activity
export async function POST(request: Request) {
  try {
    await connectToDB();
    const { employeeId, activity } = await request.json();
    
    // Update session last activity
    const session = await Session.findOneAndUpdate(
      { employeeId, isActive: true },
      { 
        lastActivity: new Date(),
        ...(activity && { activity })
      },
      { new: true }
    );
    
    if (!session) {
      return NextResponse.json({ error: 'Active session not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Session updated successfully',
      session 
    });
    
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
