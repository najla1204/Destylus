import { NextResponse } from 'next/server';
import { connectToDB, Site, Labour, Material, Issue } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;

    const site = await Site.findById(id).lean();
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Get counts
    const [labourCount, materialCount, issueCount] = await Promise.all([
      Labour.countDocuments({ siteId: id }),
      Material.countDocuments({ siteId: id }),
      Issue.countDocuments({ siteId: id })
    ]);

    return NextResponse.json({
      ...site,
      labourCount,
      materialCount,
      issueCount
    });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    const { id } = await params;
    const body = await request.json();
    const updated = await Site.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating site:', error);
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
    await Site.findByIdAndDelete(id);
    // Clean up related data
    await Promise.all([
      Labour.deleteMany({ siteId: id }),
      Material.deleteMany({ siteId: id }),
      Issue.deleteMany({ siteId: id })
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

