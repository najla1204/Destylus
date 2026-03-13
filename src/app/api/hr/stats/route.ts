import { NextResponse } from 'next/server';
import { connectToDB, User, Site, PettyCashTransaction, AggregateLabourAttendance } from '@/lib/db';

export async function GET() {
    try {
        await connectToDB();

        // 1. Total Project Managers
        const pmCount = await User.countDocuments({ 
            role: 'project_manager'
        });

        // 2. Active Sites
        const siteCount = await Site.countDocuments({ status: 'Active' });

        // 3. Total Petty Cash Allocated (Type: 'Allocation')
        const pettyCashAllocations = await PettyCashTransaction.find({ type: 'Allocation' });
        const totalPettyCash = pettyCashAllocations.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 4. Total Employees (Engineers + Workers)
        // Engineers
        const engineerCount = await User.countDocuments({ 
            role: { $in: ['engineer', 'Site Engineer'] } 
        });

        // Workers (from latest aggregate attendance across active sites)
        const activeSites = await Site.find({ status: 'Active' });
        let workerCount = 0;

        for (const site of activeSites) {
            const latestLog = await AggregateLabourAttendance.findOne({ siteId: site._id || site.id })
                .sort({ date: -1 })
                .lean();

            if (latestLog && latestLog.entries) {
                for (const entry of latestLog.entries) {
                    workerCount += (Number(entry.count) || 0);
                }
            } else if (latestLog) {
                // Handle legacy counts if entries are missing
                workerCount += (latestLog.skilledCount || 0) + (latestLog.unskilledCount || 0) + (latestLog.supervisorCount || 0);
            }
        }

        const totalEmployees = engineerCount + workerCount;

        return NextResponse.json({
            pmCount,
            siteCount,
            totalPettyCash,
            totalEmployees
        });
    } catch (error) {
        console.error('Error fetching HR stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
