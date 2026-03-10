import { NextResponse } from 'next/server';
import { connectToDB, Labour } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const labours = await Labour.find({ siteId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(labours);
  } catch (error) {
    console.error('Error fetching labours:', error);
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
    const labour = await Labour.create({ ...body, siteId: id });
    return NextResponse.json(labour, { status: 201 });
  } catch (error) {
    console.error('Error creating labour:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
