// src/app/api/attendance/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Attendance from '@/models/Attendance';

// Connect to MongoDB
await connectToDB();

// PATCH /api/attendance/[id] - Update attendance status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, rejectionReason } = await request.json();
    const { id } = await params;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      {
        approvalStatus: status,
        ...(status === 'rejected' && {
          rejectionReason,
          reviewedBy: 'Project Manager', // In a real app, get from auth
          reviewedAt: new Date()
        }),
        ...(status === 'approved' && {
          reviewedBy: 'Project Manager', // In a real app, get from auth
          reviewedAt: new Date()
        })
      },
      { new: true }
    );

    if (!updatedAttendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Attendance ${status} successfully`,
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}