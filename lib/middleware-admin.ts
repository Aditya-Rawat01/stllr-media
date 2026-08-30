import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Middleware to check if user is admin
 * Used for protecting admin-only API routes
 */
export async function requireAdmin(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "UNAUTHENTICATED" },
                { status: 401 },
            );
        }

        // Check if user is admin in database
        const userRecord = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

        if (
            !userRecord ||
            userRecord.length === 0 ||
            userRecord[0].role !== "admin"
        ) {
            return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
        }

        return null; // Auth passed
    } catch (err) {
        return NextResponse.json(
            { error: "Auth error", details: String(err) },
            { status: 500 },
        );
    }
}
