import { NextResponse } from 'next/server';
import { connectToDB, Material } from '@/lib/db';

export async function GET() {
    try {
        await connectToDB();

        // Aggregate material usage across all sites where status is Approved
        const materialUsage = await Material.aggregate([
            { $match: { status: 'Approved' } },
            {
                $group: {
                    _id: "$item",
                    quantity: { $sum: "$quantity" },
                    unit: { $first: "$unit" }
                }
            },
            {
                $project: {
                    _id: 0,
                    material: "$_id",
                    quantity: 1,
                    unit: 1
                }
            },
            { $sort: { quantity: -1 } }
        ]);

        return NextResponse.json(materialUsage);
    } catch (error) {
        console.error('Error fetching material usage:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
