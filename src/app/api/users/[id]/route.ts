import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { User } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "User ID missing" }, { status: 400 });
        }

        const user = await User.findById(id).lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();
        
        const paramsData = await params;
        const { id } = paramsData;

        if (!id) {
            return NextResponse.json({ error: "User ID missing" }, { status: 400 });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to delete user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDB();
        
        const paramsData = await params;
        const { id } = paramsData;

        const body = await req.json();

        if (!id) {
            return NextResponse.json({ error: "User ID missing" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "User updated successfully", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}
