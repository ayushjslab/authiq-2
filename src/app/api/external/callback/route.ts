import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Project from "@/models/project";
import { headers as nextHeaders } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const publicKey = searchParams.get("pk");
    const redirectUri = searchParams.get("ru");

    if (!publicKey || !redirectUri) {
        // If query params are missing, we might need to check if they are in the session/state
        // but for now we expect them to be passed back from the OAuth flow via callbackURL.
        return NextResponse.json({ error: "Missing metadata (pk or ru)" }, { status: 400 });
    }

    try {
        await connectToDatabase();

        // Get the current user session from Better Auth
        const session = await auth.api.getSession({
            headers: await nextHeaders()
        });

        if (!session) {
            // Authentication failed or No session was found
            const errorUrl = new URL(redirectUri);
            errorUrl.searchParams.set("error", "unauthorized");
            return NextResponse.redirect(errorUrl.toString());
        }

        // Find the project by publicKey to get the secretKey
        const project = await Project.findOne({ publicKey });
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Prepare the payload with user info. We base64 encode this.
        const userData = {
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                image: session.user.image,
            },
            timestamp: Date.now(),
        };

        const payload = JSON.stringify(userData);

        // Generate HMAC-SHA256 signature using the project's secretKey
        const signature = crypto
            .createHmac("sha256", project.secretKey)
            .update(payload)
            .digest("hex");

        // Base64 encode the payload for transmission
        const token = Buffer.from(payload).toString("base64");

        // Construct the final redirect URL back to the developer site
        const finalUrl = new URL(redirectUri);
        finalUrl.searchParams.set("token", token);
        finalUrl.searchParams.set("signature", signature);

        // Optional: you can also pass individual params if preferred
        finalUrl.searchParams.set("auth_status", "success");

        return NextResponse.redirect(finalUrl.toString());
    } catch (error) {
        console.error("Error in external callback:", error);
        // If everything fails, try to redirect back with an error if possible, 
        // otherwise return a json error.
        try {
            const errorUrl = new URL(redirectUri);
            errorUrl.searchParams.set("error", "internal_server_error");
            return NextResponse.redirect(errorUrl.toString());
        } catch {
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
}
