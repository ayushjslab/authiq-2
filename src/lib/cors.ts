import { NextResponse } from "next/server";

export function corsHeaders(origin: string | null, allowedOrigins: string[]) {
    // If no origin, we can't reliably set the header, or we can use '*' for public APIs.
    // However, for Authiq, we only want to allow specified origins.

    let allowOrigin = "null";

    if (origin) {
        try {
            const originUrl = new URL(origin);
            const isAllowed = allowedOrigins.some(ao => {
                try {
                    const aoUrl = new URL(ao);
                    return aoUrl.hostname === originUrl.hostname;
                } catch {
                    return ao.includes(originUrl.hostname);
                }
            });

            if (isAllowed || allowedOrigins.length === 0) {
                allowOrigin = origin;
            }
        } catch {
            // Not a valid URL, ignore
        }
    }

    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
        "Access-Control-Allow-Credentials": "true",
    };
}
