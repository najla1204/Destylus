import { NextResponse } from 'next/server';
import { connectToDB, User, AggregateLabourAttendance, Site } from '@/lib/db';

export async function GET() {
    try {
        await connectToDB();

        // 1. Get User counts (Engineers and Project Managers)
        const engineerCount = await User.countDocuments({ 
            role: { $in: ['engineer', 'Site Engineer'] } 
        });

        const pmCount = await User.countDocuments({ 
            role: 'project_manager'
        });

        // 2. Get distribution from latest AggregateLabourAttendance per site
        const sites = await Site.find({ status: 'Active' });
        const distribution: Record<string, number> = {
            "Engineer": engineerCount,
            "Project Manager": pmCount
        };

        for (const site of sites) {
            const latestLog = await AggregateLabourAttendance.findOne({ siteId: site._id || site.id })
                .sort({ date: -1 })
                .lean();

            if (latestLog && latestLog.entries) {
                for (const entry of latestLog.entries) {
                    const role = entry.workerType;
                    distribution[role] = (distribution[role] || 0) + (Number(entry.count) || 0);
                }
                
                // Also account for legacy fields if entries are empty but counts exist
                if (latestLog.entries.length === 0) {
                    if (latestLog.skilledCount) distribution["Skilled"] = (distribution["Skilled"] || 0) + latestLog.skilledCount;
                    if (latestLog.unskilledCount) distribution["Unskilled"] = (distribution["Unskilled"] || 0) + latestLog.unskilledCount;
                    if (latestLog.supervisorCount) distribution["Supervisor"] = (distribution["Supervisor"] || 0) + latestLog.supervisorCount;
                }
            }
        }

        // Convert to desired array format
        const result = Object.entries(distribution)
            .filter(([_, count]) => count > 0)
            .map(([role, count]) => ({
                role,
                count
            }))
            .sort((a, b) => b.count - a.count);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching worker distribution:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
