import { NextResponse } from 'next/server';
import { connectToDB, Site } from '@/lib/db';

export async function GET() {
  try {
    await connectToDB();
    const sites = await Site.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB();
    const body = await request.json();
    const site = await Site.create(body);
    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
