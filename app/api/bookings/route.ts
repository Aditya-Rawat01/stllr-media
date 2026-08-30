import { db } from "@/lib/db";
import { bookings, services, staff } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // Public-facing — must never 500 due to auth (ponytail: one guard in auth + here)
    let user: any = null;
    try { user = await getCurrentUser(); } catch { user = null; }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const includePast = searchParams.get("includePast") === "true";
    const limit = Math.min(
        parseInt(searchParams.get("limit") || "50", 10) || 50,
        100,
    );

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    try {
        // ponytail: simple query, filter upcoming >= today, status not cancelled/completed by default
        let rows;
        if (city) {
            rows = await db
                .select({
                    id: bookings.id,
                    customerName: bookings.customerName,
                    customerEmail: bookings.customerEmail,
                    city: bookings.city,
                    location: bookings.location,
                    bookingDate: bookings.bookingDate,
                    startTime: bookings.startTime,
                    endTime: bookings.endTime,
                    status: bookings.status,
                    notes: bookings.notes,
                    serviceId: bookings.serviceId,
                    serviceName: services.name,
                    assignedStaffId: bookings.assignedStaffId,
                    assignedStaffName: staff.name,
                    createdAt: bookings.createdAt,
                })
                .from(bookings)
                .leftJoin(services, eq(bookings.serviceId, services.id))
                .leftJoin(staff, eq(bookings.assignedStaffId, staff.id))
                .where(city ? eq(bookings.city, city) : undefined)
                .orderBy(asc(bookings.bookingDate))
                .limit(limit);
            // filter in JS for gte today to keep drizzle simple with city param
            if (!includePast) {
                rows = rows.filter((r) => new Date(r.bookingDate) >= now);
            }
            if (status) rows = rows.filter((r) => r.status === status);
            else
                rows = rows.filter(
                    (r) => includePast
                        ? r.status !== "cancelled"
                        : !["cancelled", "completed"].includes(r.status),
                );
        } else {
            // base: upcoming only
            const all = await db
                .select({
                    id: bookings.id,
                    customerName: bookings.customerName,
                    customerEmail: bookings.customerEmail,
                    city: bookings.city,
                    location: bookings.location,
                    bookingDate: bookings.bookingDate,
                    startTime: bookings.startTime,
                    endTime: bookings.endTime,
                    status: bookings.status,
                    notes: bookings.notes,
                    serviceId: bookings.serviceId,
                    serviceName: services.name,
                    assignedStaffId: bookings.assignedStaffId,
                    assignedStaffName: staff.name,
                    createdAt: bookings.createdAt,
                })
                .from(bookings)
                .leftJoin(services, eq(bookings.serviceId, services.id))
                .leftJoin(staff, eq(bookings.assignedStaffId, staff.id))
                .orderBy(asc(bookings.bookingDate))
                .limit(100);
            rows = includePast
                ? all
                : all.filter((r) => new Date(r.bookingDate) >= now);
            if (status) rows = rows.filter((r) => r.status === status);
            else
                rows = rows.filter(
                    (r) => includePast
                        ? r.status !== "cancelled"
                        : !["cancelled", "completed"].includes(r.status),
                );
            rows = rows.slice(0, limit);
        }

        // customers see all upcoming (calendar UI: what we're working on next)
        // fix: don't leak assignedStaff to non-admin (previous ...r included it for everyone)
        const isAdmin = user?.role === "admin";
        return Response.json({
            ok: true,
            role: user?.role ?? "customer",
            count: rows.length,
            bookings: rows.map((r) => {
                const { assignedStaffId, assignedStaffName, ...rest } = r as any;
                return {
                    ...rest,
                    ...(isAdmin ? { assignedStaffId, assignedStaffName } : {}),
                    bookingDate: new Date(r.bookingDate).toISOString(),
                    createdAt: new Date(r.createdAt).toISOString(),
                };
            }),
        });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
}
