import { NextResponse } from 'next/server';
import { connectToDB, StockRefundRequest } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const requests = await StockRefundRequest.find({ siteId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching stock refund requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const body = await request.json();
    const refundRequest = await StockRefundRequest.create({
      siteId: id,
      materialName: body.materialName,
      quantity: body.quantity,
      unit: body.unit,
      reason: body.reason,
      requestedBy: body.requestedBy,
      status: 'Pending'
    });
    return NextResponse.json(refundRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating stock refund request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
