import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware-admin";
import { db } from "@/lib/db";
import { leads, bookings, services, staff } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // Check admin auth
    const authError = await requireAdmin(req);
    if (authError) return authError;

    try {
        // 1. Get all leads with their enquiry details
        let allLeads: any[] = [];
        try {
            allLeads = await db
                .select()
                .from(leads)
                .orderBy(desc(leads.createdAt));
        } catch (err: any) {
            // If status column doesn't exist yet, return helpful message
            if (
                err.message?.includes("column") ||
                err.message?.includes("status")
            ) {
                return NextResponse.json(
                    {
                        error: "Migration pending",
                        details:
                            'Lead status column not yet added to database. Run this SQL in Neon console: CREATE TYPE "public"."lead_status" AS ENUM(\'not_contacted\', \'in_progress\', \'converted\'); ALTER TABLE "leads" ADD COLUMN "status" "lead_status" DEFAULT \'not_contacted\' NOT NULL;',
                    },
                    { status: 503 },
                );
            }
            throw err;
        }

        // 2. Get all bookings (potential current/past clients)
        const allBookings = await db
            .select({
                id: bookings.id,
                customerName: bookings.customerName,
                customerEmail: bookings.customerEmail,
                city: bookings.city,
                status: bookings.status,
                bookingDate: bookings.bookingDate,
                serviceName: services.name,
                assignedStaffId: bookings.assignedStaffId,
                assignedStaffName: staff.name,
            })
            .from(bookings)
            .leftJoin(services, eq(bookings.serviceId, services.id))
            .leftJoin(staff, eq(bookings.assignedStaffId, staff.id))
            .orderBy(desc(bookings.createdAt));

        const allStaff = await db
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

        // 3. Count stats
        const leadStats = {
            total: allLeads.length,
            not_contacted: allLeads.filter((l) => l.status === "not_contacted")
                .length,
            in_progress: allLeads.filter((l) => l.status === "in_progress")
                .length,
            converted: allLeads.filter((l) => l.status === "converted").length,
        };

        // Get unique current clients (confirmed or in_progress bookings)
        const currentClients = Array.from(
            new Map(
                allBookings
                    .filter((b) =>
                        ["confirmed", "in_progress"].includes(b.status),
                    )
                    .map((b) => [b.customerEmail, b]),
            ).values(),
        );

        // 4. Static ads data (placeholder)
        const adsMetrics = {
            totalSpent: 125000, // in INR
            currentBudget: 50000,
            roi: 340, // percentage
            impressions: 2500000,
            clicks: 75000,
            conversionRate: 3.2, // percentage
        };

        // 5. Static ads analysis
        const adsAnalysis = {
            topPerformingChannels: [
                { channel: "Instagram", spend: 45000, conversions: 12 },
                { channel: "Google Ads", spend: 35000, conversions: 8 },
                { channel: "Facebook", spend: 25000, conversions: 5 },
                { channel: "LinkedIn", spend: 20000, conversions: 3 },
            ],
            monthlyTrend: [
                { month: "June", spend: 30000, revenue: 120000 },
                { month: "July", spend: 40000, revenue: 160000 },
                { month: "August", spend: 55000, revenue: 190000 },
            ],
            insights: [
                "Instagram showing highest ROI (2.8x return)",
                "Video ads outperform static by 45%",
                "Peak engagement on weekdays 6-9 PM",
                "Mobile traffic accounts for 72% of clicks",
            ],
        };

        return NextResponse.json(
            {
                ok: true,
                data: {
                    leads: allLeads.map((l) => ({
                        id: l.id,
                        email: l.email,
                        phone: l.phone,
                        enquiryType: l.enquiryType,
                        enquiryDetails: l.enquiryDetails,
                        status: l.status,
                        assignedStaffId: l.assignedStaffId,
                        assignedStaffName:
                            allStaff.find((s) => s.id === l.assignedStaffId)
                                ?.name ?? null,
                        createdAt: l.createdAt.toISOString(),
                    })),
                    staff: allStaff,
                    leadStats,
                    currentClients: currentClients.map((c) => ({
                        id: c.id,
                        name: c.customerName,
                        email: c.customerEmail,
                        city: c.city,
                        service: c.serviceName,
                        assignedStaffId: c.assignedStaffId,
                        assignedStaffName: c.assignedStaffName,
                        bookingDate: c.bookingDate.toISOString(),
                    })),
                    adsMetrics,
                    adsAnalysis,
                },
            },
            { status: 200 },
        );
    } catch (err) {
        console.error("Admin dashboard error:", err);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data", details: String(err) },
            { status: 500 },
        );
    }
}
