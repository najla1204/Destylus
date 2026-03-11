import { NextResponse } from 'next/server';
import { connectToDB, StockRefundRequest } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    await connectToDB();
    const { requestId } = await params;
    const body = await request.json();
    const { status, reviewedBy } = body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedRequest = await StockRefundRequest.findByIdAndUpdate(
      requestId,
      { 
        status, 
        reviewedBy,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Refund request not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating stock refund request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    await connectToDB();
    const { requestId } = await params;

    const deletedRequest = await StockRefundRequest.findByIdAndDelete(requestId);

    if (!deletedRequest) {
      return NextResponse.json({ error: 'Refund request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Refund request deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock refund request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
