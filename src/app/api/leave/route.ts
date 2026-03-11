// src/app/api/leave/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { Leave } from '@/lib/db';

// GET /api/leave - Get leave requests
export async function GET(request: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const query: any = {};
    if (employeeId && role !== 'HR Manager' && role !== 'Project Manager' && role !== 'ProjectManager' && role !== 'project_manager' && role !== 'hr') {
      query.employeeId = employeeId;
    }
    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ leaves });
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

// POST /api/leave - Create a new leave request
export async function POST(request: Request) {
  try {
    await connectToDB();
    const body = await request.json();
    const { employeeName, employeeId, type, from, to, reason } = body;

    if (!employeeName || !employeeId || !type || !from || !to || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newLeave = new Leave({
      employeeName,
      employeeId,
      type,
      from: new Date(from),
      to: new Date(to),
      reason,
      status: 'Pending'
    });

    await newLeave.save();

    return NextResponse.json({
      message: 'Leave application submitted successfully',
      leave: newLeave
    });
  } catch (error) {
    console.error('Error creating leave:', error);
    return NextResponse.json(
      { error: 'Failed to submit leave application' },
      { status: 500 }
    );
  }
}

// PATCH /api/leave - Update leave status (HR View)
export async function PATCH(request: Request) {
  try {
    await connectToDB();
    const body = await request.json();
    const { id, status, reviewedBy } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { 
        status, 
        reviewedBy,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!updatedLeave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave: updatedLeave
    });
  } catch (error) {
    console.error('Error updating leave:', error);
    return NextResponse.json(
      { error: 'Failed to update leave request' },
      { status: 500 }
    );
  }
}
