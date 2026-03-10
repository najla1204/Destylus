import { NextResponse } from 'next/server';
import { connectToDB, Issue } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const issues = await Issue.find({ siteId: id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
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
    const issue = await Issue.create({ ...body, siteId: id });
    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
