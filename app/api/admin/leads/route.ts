import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware-admin";
import { db } from "@/lib/db";
import { leads, leadStatusEnum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
    leadId: z.string().uuid(),
    status: z.enum(["not_contacted", "in_progress", "converted"]),
});

export async function PATCH(req: NextRequest) {
    // Check admin auth
    const authError = await requireAdmin(req);
    if (authError) return authError;

    try {
        const body = await req.json();
        const parsed = updateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request", details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { leadId, status } = parsed.data;

        // Update lead status
        const updated = await db
            .update(leads)
            .set({ status: status as any })
            .where(eq(leads.id, leadId))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json(
                { error: "Lead not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                ok: true,
                lead: updated[0],
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Update lead status error:", err);
        return NextResponse.json(
            { error: "Failed to update lead status", details: String(err) },
            { status: 500 },
        );
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json(
        { status: "ok", hint: "PATCH {leadId, status}" },
        { status: 200 },
    );
}
