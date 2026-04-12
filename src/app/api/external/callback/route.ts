import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
import WebUser from "@/models/webUser";
import { headers as nextHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("pk");
    const redirectUri = searchParams.get("ru");
    const provider = searchParams.get("provider");
    const origin = req.headers.get("origin") || req.headers.get("referer");

    if (!publicKey || !redirectUri) {
        return NextResponse.json(
            { error: "Missing metadata (pk or ru)" },
            { status: 400, headers: { "Access-Control-Allow-Origin": origin || "*" } }
        );
    }

    try {
        await connectToDatabase();

        // Get the current user session from Better Auth
        const session = await auth.api.getSession({
            headers: await nextHeaders()
        });

        // Find the project by publicKey
        const project = await Project.findOne({ publicKey });
        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404, headers: { "Access-Control-Allow-Origin": origin || "*" } }
            );
        }

        const headers = corsHeaders(origin, project.settings.allowedOrigins);

        // Security Validation: Redirect URI
        if (project.settings.redirectUrls.length > 0 && !project.settings.redirectUrls.includes(redirectUri)) {
            return NextResponse.json({ error: "Unauthorized redirect URI" }, { status: 400, headers });
        }

        // Security Validation: Provider
        if (provider && project.settings.enabledProviders.length > 0 && !project.settings.enabledProviders.includes(provider as any)) {
            return NextResponse.json({ error: "Provider not enabled for this project" }, { status: 400, headers });
        }

        if (!session) {
            const errorUrl = new URL(redirectUri);
            errorUrl.searchParams.set("error", "unauthorized");
            return NextResponse.redirect(errorUrl.toString(), { headers });
        }

        // --- WebUser Management ---
        let webUser = await WebUser.findOne({
            projectId: project._id,
            email: session.user.email.toLowerCase()
        });

        if (!webUser) {
            // Check max users limit
            if (project.settings.signinUsers >= project.settings.maxUsers) {
                const errorUrl = new URL(redirectUri);
                errorUrl.searchParams.set("error", "limit_reached");
                errorUrl.searchParams.set("message", "Project user limit reached");
                return NextResponse.redirect(errorUrl.toString(), { headers });
            }

            // Create new WebUser
            webUser = await WebUser.create({
                projectId: project._id,
                email: session.user.email,
                name: session.user.name || "User",
                avatar: session.user.image || "",
                provider: provider || "unknown",
                lastLoginAt: new Date(),
            });

            // Increment signinUsers count
            await Project.updateOne(
                { _id: project._id },
                { $inc: { "settings.signinUsers": 1 } }
            );
        } else {
            // Update existing user info
            webUser.name = session.user.name || webUser.name;
            webUser.avatar = session.user.image || webUser.avatar;
            webUser.provider = provider || webUser.provider;
            webUser.lastLoginAt = new Date();
            await webUser.save();
        }

        // Prepare the payload for the developer
        const expiryMs = project.settings.tokenExpiryTime || 24 * 60 * 60 * 1000;
        const expirationTime = Date.now() + expiryMs;

        const userData = {
            user: {
                id: webUser._id,
                email: webUser.email,
                name: webUser.name,
                avatar: webUser.avatar,
                provider: webUser.provider,
            },
            exp: expirationTime,
            iat: Date.now(),
        };

        const payload = JSON.stringify(userData);

        // Encryption Configuration
        const algorithm = "aes-256-cbc";
        // Create a 32-byte key from the secretKey
        const key = crypto.createHash("sha256").update(project.secretKey).digest();
        const iv = crypto.randomBytes(16);

        // Encrypt the payload
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(payload, "utf8", "hex");
        encrypted += cipher.final("hex");

        // Token format: iv:encryptedData
        const token = iv.toString("hex") + ":" + encrypted;

        // Still generate HMAC-SHA256 signature for extra security/verification
        const signature = crypto
            .createHmac("sha256", project.secretKey)
            .update(token)
            .digest("hex");

        const finalUrl = new URL(redirectUri);
        finalUrl.searchParams.set("token", token);
        finalUrl.searchParams.set("signature", signature);
        finalUrl.searchParams.set("auth_status", "success");

        return NextResponse.redirect(finalUrl.toString(), { headers });
    } catch (error) {
        console.error("Error in external callback:", error);
        try {
            const errorUrl = new URL(redirectUri);
            errorUrl.searchParams.set("error", "internal_server_error");
            return NextResponse.redirect(errorUrl.toString());
        } catch {
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500, headers: { "Access-Control-Allow-Origin": origin || "*" } }
            );
        }
    }
}
