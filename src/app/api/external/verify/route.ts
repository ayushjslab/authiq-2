import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const origin = req.headers.get("origin") || req.headers.get("referer");

    try {
        const body = await req.json();
        const { publicKey, token, signature } = body;

        if (!publicKey || !token) {
            return NextResponse.json(
                { error: "Missing publicKey or token" },
                { status: 400, headers: { "Access-Control-Allow-Origin": origin || "*" } }
            );
        }

        await connectToDatabase();

        // Find the project by publicKey
        const project = await Project.findOne({ publicKey });
        if (!project) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404, headers: { "Access-Control-Allow-Origin": origin || "*" } }
            );
        }

        const headers = corsHeaders(origin, project.settings.allowedOrigins);

        // 1. Signature Verification (if provided)
        if (signature) {
            const expectedSignature = crypto
                .createHmac("sha256", project.secretKey)
                .update(token)
                .digest("hex");

            if (signature !== expectedSignature) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 401, headers });
            }
        }

        // 2. Token Decryption
        try {
            const parts = token.split(":");
            if (parts.length !== 2) {
                throw new Error("Invalid token format");
            }

            const iv = Buffer.from(parts[0], "hex");
            const encryptedData = parts[1];
            const algorithm = "aes-256-cbc";

            // Create a 32-byte key from the secretKey (same as in callback)
            const key = crypto.createHash("sha256").update(project.secretKey).digest();

            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encryptedData, "hex", "utf8");
            decrypted += decipher.final("utf8");

            const userData = JSON.parse(decrypted);

            // 3. Expiry Check
            if (Date.now() > userData.exp) {
                return NextResponse.json({ error: "Token expired" }, { status: 401, headers });
            }

            return NextResponse.json({
                success: true,
                ...userData
            }, { headers });

        } catch (error) {
            console.error("Token decryption failed:", error);
            return NextResponse.json({ error: "Invalid token" }, { status: 401, headers });
        }
    } catch (error) {
        console.error("Error in verify API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500, headers: { "Access-Control-Allow-Origin": origin || "*" } }
        );
    }
}

export async function OPTIONS(req: Request) {
    const origin = req.headers.get("origin");
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": origin || "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
        },
    });
}
