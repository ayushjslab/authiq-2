import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
import WebUser from "@/models/webUser";
import UserSession from "@/models/userSession";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Verify ownership
        const project = await Project.findOne({ _id: projectId, ownerId: session.user.id });
        if (!project) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const projectObjectId = new mongoose.Types.ObjectId(projectId);
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Growth Data: Users joined in the last 30 days
        const growthData = await WebUser.aggregate([
            { $match: { projectId: projectObjectId, createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. Provider Distribution
        const providerData = await WebUser.aggregate([
            { $match: { projectId: projectObjectId } },
            {
                $group: {
                    _id: "$provider",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Activity Trend: Sessions created in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activityTrend = await UserSession.aggregate([
            { $match: { projectId: projectObjectId, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 4. Summaries
        const totalUsers = await WebUser.countDocuments({ projectId: projectObjectId });
        const activeUsers = await WebUser.countDocuments({
            projectId: projectObjectId,
            lastLoginAt: { $gte: new Date(Date.now() - (project.settings.tokenExpiryTime || 24 * 60 * 60 * 1000)) }
        });

        // 5. Recent Users for Dashboard
        const recentUsers = await WebUser.find({ projectId: projectObjectId })
            .sort({ createdAt: -1 })
            .limit(5);

        return NextResponse.json({
            growth: growthData,
            providers: providerData,
            activity: activityTrend,
            recentUsers,
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                growthRate: growthData.length > 0 ? ((growthData[growthData.length - 1].count / totalUsers) * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
