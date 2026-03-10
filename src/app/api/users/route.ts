import { NextRequest, NextResponse } from "next/server";
import { connectToDB, User } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        await connectToDB();

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let query = {};
        if (role) {
            query = { role };
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDB();
        const body = await req.json();

        // Validate required fields
        if (!body.name || !body.email || !body.role) {
            return NextResponse.json(
                { error: "Name, email, and role are required." },
                { status: 400 }
            );
        }

        // Check if user with email already exists
        const existingUser = await User.findOne({ email: body.email });
        if (existingUser) {
            return NextResponse.json(
                { error: "A user with this email already exists." },
                { status: 409 }
            );
        }

        const newUser = new User({
            name: body.name,
            email: body.email,
            role: body.role,
            employeeId: 'EMP' + Date.now().toString().slice(-6),
            password: 'Destylus@123', // In a real app this would be hashed in a prehook
            site: body.site || '',
            allocatedSites: body.allocatedSites || []
        });

        await newUser.save();

        return NextResponse.json(
            { message: "User created successfully", user: newUser },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Failed to create user:", error);
        return NextResponse.json(
            { error: "Failed to create user", details: error.message },
            { status: 500 }
        );
    }
}
