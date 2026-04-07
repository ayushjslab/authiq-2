import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Project, { PLAN_LIMITS, ALL_PROVIDERS, SocialProvider } from "@/models/project";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projects = await Project.find({ ownerId: session.user.id }).sort({ createdAt: -1 });
        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        const publicKey = `pk_${crypto.randomBytes(24).toString("hex")}`;
        const secretKey = `sk_${crypto.randomBytes(32).toString("hex")}`;

        const project = await Project.create({
            name,
            ownerId: session.user.id,
            publicKey,
            secretKey,
            plan: "free",
            settings: {
                allowedOrigins: [],
                redirectUrls: [],
                enabledProviders: [],
                maxUsers: 1000,
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, name, allowedOrigins, redirectUrls, enabledProviders, maxUsers, regenerateKeys } = await req.json();

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        const project = await Project.findOne({ _id: projectId, ownerId: session.user.id });
        if (!project) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const limits = PLAN_LIMITS[project.plan];

        // Validate enabled providers against plan limits
        if (enabledProviders !== undefined) {
            const validProviders = (enabledProviders as string[]).filter(p =>
                ALL_PROVIDERS.includes(p as SocialProvider)
            ) as SocialProvider[];

            if (validProviders.length > limits.maxProviders) {
                return NextResponse.json(
                    { error: `Your ${project.plan} plan allows a maximum of ${limits.maxProviders} providers. Please upgrade to Pro.` },
                    { status: 403 }
                );
            }
            project.settings.enabledProviders = validProviders;
        }

        // Validate maxUsers against plan limits
        if (maxUsers !== undefined) {
            if (project.plan === "free" && maxUsers > limits.maxUsers) {
                return NextResponse.json(
                    { error: `Free plan is limited to ${limits.maxUsers} users/month. Please upgrade to Pro.` },
                    { status: 403 }
                );
            }
            project.settings.maxUsers = maxUsers;
        }

        if (name) project.name = name;
        if (allowedOrigins) project.settings.allowedOrigins = allowedOrigins;
        if (redirectUrls) project.settings.redirectUrls = redirectUrls;

        if (regenerateKeys) {
            project.publicKey = `pk_${crypto.randomBytes(24).toString("hex")}`;
            project.secretKey = `sk_${crypto.randomBytes(32).toString("hex")}`;
        }

        await project.save();

        return NextResponse.json(project);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
