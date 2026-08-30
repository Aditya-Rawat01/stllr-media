import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, leads, staff, staffRoleEnum } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/middleware-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roleValues = ["photographer", "videographer", "editor", "drone_operator", "manager"] as const;
const createSchema = z.object({
    employeeNumber: z.string().trim().min(1).max(40),
    name: z.string().trim().min(1).max(120),
    role: z.enum(roleValues),
    workDescription: z.string().trim().min(1).max(500),
});
const assignmentSchema = z.object({
    type: z.enum(["lead", "booking"]),
    recordId: z.string().uuid(),
    staffId: z.string().uuid().nullable(),
});

export async function GET(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const rows = await db
        .select({
            id: staff.id,
            employeeNumber: staff.employeeNumber,
            name: staff.name,
            role: staff.role,
            workDescription: staff.workDescription,
            isActive: staff.isActive,
        })
        .from(staff)
        .orderBy(staff.name);

    return NextResponse.json({ ok: true, staff: rows });
}

export async function POST(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    try {
        const parsed = createSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid employee details", details: parsed.error.flatten() }, { status: 400 });
        }
        const [employee] = await db.insert(staff).values(parsed.data).returning({
            id: staff.id,
            employeeNumber: staff.employeeNumber,
            name: staff.name,
            role: staff.role,
            workDescription: staff.workDescription,
            isActive: staff.isActive,
        });
        return NextResponse.json({ ok: true, employee }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Could not create employee", details: String(error) }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    try {
        const parsed = assignmentSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid assignment", details: parsed.error.flatten() }, { status: 400 });
        }
        const { type, recordId, staffId } = parsed.data;
        if (type === "lead") {
            await db.update(leads).set({ assignedStaffId: staffId }).where(eq(leads.id, recordId));
        } else {
            await db.update(bookings).set({ assignedStaffId: staffId }).where(eq(bookings.id, recordId));
        }
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: "Could not update assignment", details: String(error) }, { status: 500 });
    }
}
