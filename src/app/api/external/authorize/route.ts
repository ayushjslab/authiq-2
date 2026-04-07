import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("pk");
    const redirectUri = searchParams.get("redirect_uri");
    const provider = searchParams.get("provider") || "google";

    if (!publicKey || !redirectUri) {
        return NextResponse.json({ error: "Missing required parameters (pk, redirect_uri)" }, { status: 400 });
    }

    try {
        await connectToDatabase();
        const project = await Project.findOne({ publicKey });

        if (!project) {
            return NextResponse.json({ error: "Invalid public key" }, { status: 404 });
        }

        // Validate Origin/Referer
        const origin = req.headers.get("origin") || req.headers.get("referer");
        if (origin) {
            const originUrl = new URL(origin);
            const isAllowed = project.settings.allowedOrigins.some(ao => {
                try {
                    const aoUrl = new URL(ao);
                    return aoUrl.hostname === originUrl.hostname;
                } catch {
                    return ao.includes(originUrl.hostname);
                }
            });

            // For development/initial testing, we might be lenient, 
            // but in production we should strictly check origins.
            if (!isAllowed && project.settings.allowedOrigins.length > 0) {
                return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
            }
        }

        // Construct the internal callback URL with metadata
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const callbackUrl = `${baseUrl}/api/external/callback?pk=${publicKey}&ru=${encodeURIComponent(redirectUri)}`;

        // Redirect to Better Auth social sign-in
        const authRedirectUrl = `${baseUrl}/api/auth/login/${provider}?callbackURL=${encodeURIComponent(callbackUrl)}`;

        return NextResponse.redirect(authRedirectUrl);
    } catch (error) {
        console.error("Error in external authorize:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
