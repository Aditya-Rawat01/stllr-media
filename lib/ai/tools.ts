import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { services, galleryItems, bookings, staff, faqs } from "@/lib/db/schema";
import { eq, ilike, or, sql, desc, asc, and } from "drizzle-orm";
import { formatIST } from "@/lib/timezone";

// ponytail: 6 read-only tools, bookings via /api/bookings (asc) — minimal add, IST normalized
async function fetchBookingsViaApi(limit: number, city?: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  try {
    const url = new URL("/api/bookings", base);
    url.searchParams.set("limit", String(limit));
    if (city) url.searchParams.set("city", city);
    const res = await fetch(url.toString(), { cache: "no-store" } as any);
    if (res.ok) {
      const j: any = await res.json();
      if (Array.isArray(j.bookings)) {
        // ponytail: normalize UTC → IST for chat (Calendar already uses formatIST)
        return j.bookings.map((b: any) => ({
          ...b,
          bookingDate: b.bookingDate,
          bookingDateIST: formatIST(b.bookingDate),
          createdAtIST: b.createdAt ? formatIST(b.createdAt) : undefined,
        }));
      }
    }
  } catch {}
  // fallback — mirrors app/api/bookings/route.ts asc(bookings.bookingDate) — hide staff
  const now = new Date(); now.setHours(0,0,0,0);
  const rows = await db.select().from(bookings).orderBy(asc(bookings.bookingDate)).limit(100);
  let filtered = rows.filter(r => new Date(r.bookingDate) >= now && !["cancelled","completed"].includes(r.status));
  if (city) filtered = filtered.filter(r => r.city === city);
  return filtered.slice(0, limit).map(r => {
    const { assignedStaffId, ...rest } = r as any;
    return { ...rest, bookingDate: r.bookingDate.toISOString(), bookingDateIST: formatIST(r.bookingDate), createdAt: r.createdAt.toISOString(), createdAtIST: formatIST(r.createdAt) };
  });
}

export const chatTools = {
  getServices: tool({
    description: "List STLLR services. Filter by category if asked. Active production services for brands/production houses.",
    inputSchema: z.object({ category: z.enum(["photography","videography","editing","combo","drone"]).optional() }),
    execute: async ({ category }) => {
      const rows = category
        ? await db.select().from(services).where(and(eq(services.isActive, true), eq(services.category, category as any)))
        : await db.select().from(services).where(eq(services.isActive, true));
      return rows.map(r => ({ slug: r.slug, name: r.name, category: r.category, price: r.basePrice, duration: r.durationMins, desc: r.description }));
    },
  }),

  getPortfolio: tool({
    description: "Search gallery/portfolio by tag or category",
    inputSchema: z.object({ query: z.string().optional(), limit: z.number().min(1).max(20).default(6) }),
    execute: async ({ query, limit }) => {
      const rows = !query ? await db.select().from(galleryItems).orderBy(desc(galleryItems.isFeatured)).limit(limit) : await db.select().from(galleryItems).where(
        or(ilike(galleryItems.title, `%${query.toLowerCase()}%`), ilike(galleryItems.category, `%${query.toLowerCase()}%`), sql`${galleryItems.tags}::text ilike ${`%${query.toLowerCase()}%`}`)
      ).limit(limit);
      return rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }));
    },
  }),

  getUpcomingEvents: tool({
    description: "List upcoming bookings/events via /api/bookings (ascending by bookingDate). Use for 'upcoming events', calendar, shoots. Via /api/bookings — always ascending.",
    inputSchema: z.object({ limit: z.number().min(1).max(20).default(5), city: z.string().optional().describe("ONLY if user explicitly mentions city, e.g. 'Delhi'") }),
    execute: async ({ limit, city }) => fetchBookingsViaApi(limit, city),
  }),

  getBookings: tool({
    description: "List upcoming bookings/shoots via /api/bookings (ascending by bookingDate). Filter by city only if user explicitly mentions city. Alias of getUpcomingEvents — same /api/bookings source.",
    inputSchema: z.object({ limit: z.number().min(1).max(20).default(5), city: z.string().optional().describe("ONLY if user explicitly mentions city") }),
    execute: async ({ limit, city }) => fetchBookingsViaApi(limit, city),
  }),

  getTeamAvailability: tool({
    description: "Counts of staff by role. For control-room / availability questions.",
    inputSchema: z.object({}),
    execute: async () => {
      const rows = await db.select({ role: staff.role, count: sql<number>`count(*)`.as("count") }).from(staff).where(eq(staff.isActive, true)).groupBy(staff.role);
      return Object.fromEntries(rows.map(r => [r.role, r.count]));
    },
  }),

  searchKnowledgeBase: tool({
    description: "Search FAQs / policies (cancellation, delivery, travel, contact)",
    inputSchema: z.object({ query: z.string().min(2), limit: z.number().min(1).max(10).default(5) }),
    execute: async ({ query, limit }) => {
      const q = `%${query}%`;
      const rows = await db.select().from(faqs).where(
        or(ilike(faqs.question, q), ilike(faqs.answer, q), sql`${faqs.keywords}::text ilike ${q}`)
      ).limit(limit);
      return rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }));
    },
  }),
};
