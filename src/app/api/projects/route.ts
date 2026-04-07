import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
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
            settings: {
                allowedOrigins: [],
                redirectUrls: [],
            },
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
