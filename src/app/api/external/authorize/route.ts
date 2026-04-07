import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SUPPORTED_PROVIDERS = ["google", "github", "facebook", "twitter", "discord", "microsoft", "slack"] as const;
type Provider = (typeof SUPPORTED_PROVIDERS)[number];

export async function OPTIONS(req: Request) {
    const origin = req.headers.get("origin");
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": origin || "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("pk");
    const redirectUri = searchParams.get("redirect_uri");
    const providerParam = searchParams.get("provider") || "google";
    const origin = req.headers.get("origin") || req.headers.get("referer");

    if (!publicKey || !redirectUri) {
        return NextResponse.json(
            { error: "Missing required parameters (pk, redirect_uri)" },
            { status: 400, headers: { "Access-Control-Allow-Origin": origin || "*" } }
        );
    }

    // Validate that the provider is one we support
    if (!SUPPORTED_PROVIDERS.includes(providerParam as Provider)) {
        return NextResponse.json(
            { error: `Unsupported provider. Must be one of: ${SUPPORTED_PROVIDERS.join(", ")}` },
            { status: 400, headers: { "Access-Control-Allow-Origin": origin || "*" } }
        );
    }

    const provider = providerParam as Provider;

    try {
        await connectToDatabase();
        const project = await Project.findOne({ publicKey });

        if (!project) {
            return NextResponse.json(
                { error: "Invalid public key" },
                { status: 404, headers: { "Access-Control-Allow-Origin": origin || "*" } }
            );
        }

        const headers = corsHeaders(origin, project.settings.allowedOrigins);

        // Validate Origin/Referer
        if (origin) {
            const isAllowed = headers["Access-Control-Allow-Origin"] !== "null";
            if (!isAllowed && project.settings.allowedOrigins.length > 0) {
                return NextResponse.json(
                    { error: "Unauthorized origin" },
                    { status: 403, headers }
                );
            }
        }

        // Build the callback URL that will be called after the OAuth flow completes
        const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
        const callbackUrl = `${baseUrl}/api/external/callback?pk=${publicKey}&ru=${encodeURIComponent(redirectUri)}`;

        // Use Better Auth's server-side API to get the correct OAuth consent screen URL
        const response = await auth.api.signInSocial({
            body: {
                provider,
                callbackURL: callbackUrl,
            },
        });

        // The returned URL is the actual Google/GitHub OAuth consent screen
        const oauthUrl = response?.url;

        if (!oauthUrl) {
            return NextResponse.json(
                { error: "Failed to generate OAuth URL. Check that the provider is configured correctly." },
                { status: 500, headers }
            );
        }

        return NextResponse.redirect(oauthUrl, { headers });
    } catch (error) {
        console.error("Error in external authorize:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500, headers: { "Access-Control-Allow-Origin": origin || "*" } }
        );
    }
}
