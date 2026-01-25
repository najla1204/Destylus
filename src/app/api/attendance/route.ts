// src/app/api/attendance/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Attendance from '@/models/Attendance';

// Connect to MongoDB
await connectToDB();

// GET /api/attendance - Get all attendance records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const approvalStatus = searchParams.get('approvalStatus');
    const site = searchParams.get('site');
    const role = searchParams.get('role');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (site) query.site = site;
    if (role) query.role = role;

    const attendanceLogs = await Attendance.find(query).sort({ checkInTime: -1 });
    return NextResponse.json({ attendanceLogs });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

// POST /api/attendance - Create a new attendance record
export async function POST(request: Request) {
  try {
    const {
      action,
      employeeName,
      employeeId,
      role,
      site,
      photoUrl,
      location
    } = await request.json();

    if (!employeeName || !employeeId || !role || !site) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action === 'check-in') {
      // Check if already checked in
      const existingCheckIn = await Attendance.findOne({
        employeeId,
        checkOutTime: { $exists: false }
      });

      if (existingCheckIn) {
        return NextResponse.json(
          { error: 'You are already checked in. Please check out first.' },
          { status: 400 }
        );
      }

      // Create new check-in record
      const attendance = new Attendance({
        employeeName,
        employeeId,
        role,
        site,
        status: 'checked-in',
        approvalStatus: 'pending',
        checkInTime: new Date(),
        inTimePhoto: photoUrl,
        location,
      });

      await attendance.save();

      return NextResponse.json({
        message: 'Successfully checked in',
        attendance
      });
    } else if (action === 'check-out') {
      // Find the latest check-in without a check-out
      const checkInRecord = await Attendance.findOne({
        employeeId,
        checkOutTime: { $exists: false }
      }).sort({ checkInTime: -1 });

      if (!checkInRecord) {
        return NextResponse.json(
          { error: 'No active check-in found' },
          { status: 400 }
        );
      }

      // Calculate total hours
      const checkOutTime = new Date();
      const checkInTime = new Date(checkInRecord.checkInTime);
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      // Update check-out record
      checkInRecord.checkOutTime = checkOutTime;
      checkInRecord.outTimePhoto = photoUrl;
      checkInRecord.totalHours = parseFloat(totalHours.toFixed(2));
      checkInRecord.status = 'checked-out';

      await checkInRecord.save();

      return NextResponse.json({
        message: 'Successfully checked out',
        attendance: checkInRecord
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing attendance:', error);
    return NextResponse.json(
      { error: 'Failed to process attendance' },
      { status: 500 }
    );
  }
}