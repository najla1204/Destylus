import { NextResponse } from 'next/server';
import { connectToDB, Issue, Site } from '@/lib/db';

// GET /api/issues — fetch all issues across all sites, with optional filters
export async function GET(request: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const siteId = searchParams.get('siteId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (siteId) query.siteId = siteId;

    const issues = await Issue.find(query).sort({ createdAt: -1 }).lean();

    // Fetch all site names for mapping
    const siteIds = [...new Set(issues.map((i: any) => i.siteId?.toString()).filter(Boolean))];
    const sites = await Site.find({ _id: { $in: siteIds } }).select('name').lean();
    const siteMap = new Map(sites.map((s: any) => [s._id.toString(), s.name]));

    // Attach site name to each issue
    const enrichedIssues = issues.map((issue: any) => ({
      ...issue,
      siteName: siteMap.get(issue.siteId?.toString()) || 'Unknown Site',
    }));

    return NextResponse.json(enrichedIssues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}
