import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware-admin";
import { db } from "@/lib/db";
import { bookings, services, staff, leads } from "@/lib/db/schema";
import { desc, eq, gte, lte, and } from "drizzle-orm";
import { calcReport } from "@/lib/reports/calculate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helpers: convert YYYY-MM-DD in IST to UTC Date for created_at filter
function istDateToUTCStart(ymd: string): Date {
  // ymd = YYYY-MM-DD, interpret as 00:00:00 IST (UTC+5:30)
  const [y, m, d] = ymd.split("-").map(Number);
  // IST midnight = UTC previous day 18:30
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - 5.5 * 60 * 60 * 1000);
}
function istDateToUTCEnd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  // end of day 23:59:59.999 IST
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - 5.5 * 60 * 60 * 1000);
}

function monthBounds(month: string): { from: Date; to: Date; fromYmd: string; toYmd: string } {
  const [yStr, mStr] = month.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!y || !m || m < 1 || m > 12) throw new Error("Invalid month, expected YYYY-MM");
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate(); // days in month
  const fromYmd = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-01`;
  const toYmd = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from: istDateToUTCStart(fromYmd), to: istDateToUTCEnd(toYmd), fromYmd, toYmd };
}

function currentMonthYmd(): string {
  // current month in IST
  const now = new Date();
  const ist = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).format(now);
  // en-CA gives YYYY-MM-DD, we need YYYY-MM
  return ist.slice(0, 7);
}

export async function GET(req: NextRequest) {
  const authErr = await requireAdmin(req);
  if (authErr) return authErr;

  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    let from: Date;
    let to: Date;
    let fromYmd: string;
    let toYmd: string;
    let periodLabel: string;

    if (fromParam && toParam) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fromParam) || !/^\d{4}-\d{2}-\d{2}$/.test(toParam)) {
        return NextResponse.json({ error: "Invalid from/to, expected YYYY-MM-DD" }, { status: 400 });
      }
      fromYmd = fromParam;
      toYmd = toParam;
      from = istDateToUTCStart(fromYmd);
      to = istDateToUTCEnd(toYmd);
      if (from > to) return NextResponse.json({ error: "from must be <= to" }, { status: 400 });
      periodLabel = `${fromYmd} to ${toYmd} (IST, by createdAt)`;
    } else if (monthParam) {
      if (!/^\d{4}-\d{2}$/.test(monthParam)) {
        return NextResponse.json({ error: "Invalid month, expected YYYY-MM" }, { status: 400 });
      }
      const b = monthBounds(monthParam);
      from = b.from;
      to = b.to;
      fromYmd = b.fromYmd;
      toYmd = b.toYmd;
      const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(from);
      periodLabel = `${monthLabel} (${fromYmd} to ${toYmd} IST, by createdAt)`;
    } else {
      // default current month
      const cur = currentMonthYmd();
      const b = monthBounds(cur);
      from = b.from;
      to = b.to;
      fromYmd = b.fromYmd;
      toYmd = b.toYmd;
      const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(from);
      periodLabel = `${monthLabel} (${fromYmd} to ${toYmd} IST, by createdAt)`;
    }

    // Fetch bookings in range by createdAt
    const bookingRows = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        basePrice: services.basePrice,
        serviceName: services.name,
        serviceCategory: services.category,
        city: bookings.city,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        assignedStaffName: staff.name,
        bookingDate: bookings.bookingDate,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .leftJoin(staff, eq(bookings.assignedStaffId, staff.id))
      .where(and(gte(bookings.createdAt, from), lte(bookings.createdAt, to)))
      .orderBy(desc(bookings.createdAt));

    const leadRows = await db
      .select({
        id: leads.id,
        email: leads.email,
        phone: leads.phone,
        enquiryType: leads.enquiryType,
        enquiryDetails: leads.enquiryDetails,
        status: leads.status,
        assignedStaffName: staff.name,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .leftJoin(staff, eq(leads.assignedStaffId, staff.id))
      .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to)))
      .orderBy(desc(leads.createdAt));

    const report = calcReport(
      bookingRows.map((r) => ({
        id: r.id,
        status: r.status,
        basePrice: r.basePrice ?? 0,
        serviceName: r.serviceName ?? null,
        serviceCategory: r.serviceCategory ?? null,
        city: r.city ?? null,
        customerName: r.customerName ?? null,
        assignedStaffName: r.assignedStaffName ?? null,
        bookingDate: r.bookingDate,
        createdAt: r.createdAt,
      })),
      leadRows.map((l) => ({ id: l.id, status: l.status, enquiryType: l.enquiryType, createdAt: l.createdAt })),
    );

    return NextResponse.json(
      {
        ok: true,
        period: {
          from: fromYmd,
          to: toYmd,
          label: periodLabel,
          fromUTC: from.toISOString(),
          toUTC: to.toISOString(),
        },
        summary: report.summary,
        byStatus: report.byStatus,
        byService: report.byService,
        byCity: report.byCity,
        byStaff: report.byStaff,
        leadsByStatus: report.leadsByStatus,
        leadsByType: report.leadsByType,
        bookings: bookingRows.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          customerEmail: r.customerEmail,
          city: r.city,
          status: r.status,
          serviceName: r.serviceName ?? "Unknown service",
          serviceCategory: r.serviceCategory ?? null,
          basePricePaise: r.basePrice ?? 0,
          assignedStaffName: r.assignedStaffName ?? null,
          bookingDate: (r.bookingDate as Date).toISOString(),
          createdAt: (r.createdAt as Date).toISOString(),
        })),
        leads: leadRows.map((l) => ({
          id: l.id,
          email: l.email,
          phone: l.phone,
          enquiryType: l.enquiryType,
          enquiryDetails: l.enquiryDetails,
          status: l.status,
          assignedStaffName: l.assignedStaffName ?? null,
          createdAt: (l.createdAt as Date).toISOString(),
        })),
        meta: {
          disclaimer: "Estimated revenue based on services.basePrice (paise/100 INR). For reference only.",
          currency: "INR",
          locale: "en-IN",
          filteredOn: "bookings.createdAt & leads.createdAt (IST)",
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Admin reports error:", err);
    return NextResponse.json({ error: "Failed to generate report", details: String(err) }, { status: 500 });
  }
}
