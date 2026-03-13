import { NextResponse } from 'next/server';
import { connectToDB, Issue } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.statusChangedBy) updateData.statusChangedBy = body.statusChangedBy;
    if (body.statusChangedByRole) updateData.statusChangedByRole = body.statusChangedByRole;
    if (body.resolvedBy) updateData.resolvedBy = body.resolvedBy;

    const issue = await Issue.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    
    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    
    const issue = await Issue.findByIdAndDelete(id);
    
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
