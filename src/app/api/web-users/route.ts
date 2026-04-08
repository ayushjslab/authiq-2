import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
import WebUser from "@/models/webUser";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Verify that the user owns the project
        const project = await Project.findOne({ _id: projectId, ownerId: session.user.id });
        if (!project) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        // Build query
        const query: any = { projectId };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Fetch users
        const users = await WebUser.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await WebUser.countDocuments(query);

        return NextResponse.json({
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching web users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
