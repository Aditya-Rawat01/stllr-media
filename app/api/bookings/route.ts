import { db } from "@/lib/db";
import { bookings, services, staff } from "@/lib/db/schema";
import { gte, asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // Public-facing upcoming bookings for the site and events calendar.
    // This endpoint is intentionally readable without auth because it powers the public booking calendar and homepage preview.
    const user = await getCurrentUser();

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
        return Response.json({
            ok: true,
            role: user?.role ?? "customer",
            count: rows.length,
            bookings: rows.map((r) => ({
                ...r,
                ...(user?.role === "admin"
                    ? {
                          assignedStaffId: r.assignedStaffId,
                          assignedStaffName: r.assignedStaffName,
                      }
                    : {}),
                bookingDate: new Date(r.bookingDate).toISOString(),
                createdAt: new Date(r.createdAt).toISOString(),
            })),
        });
    } catch (e: any) {
        return Response.json({ ok: false, error: e.message }, { status: 500 });
    }
}
