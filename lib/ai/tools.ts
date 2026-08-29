import { tool } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { services, galleryItems, events, staff, faqs } from "@/lib/db/schema";
import { eq, ilike, or, sql, desc, asc, and } from "drizzle-orm";

// ponytail: 5 read-only tools, no writes, skip bookings per PRD v0

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
    description: "List upcoming events. Use ONLY when user says city name explicitly; otherwise omit city and return all upcoming.",
    inputSchema: z.object({ limit: z.number().min(1).max(20).default(5), city: z.string().optional().describe("ONLY if user explicitly mentions city, e.g. 'Delhi'") }),
    execute: async ({ limit, city }) => {
      const rows = city ? await db.select().from(events).where(eq(events.city, city)).orderBy(asc(events.startDate)).limit(limit) : await db.select().from(events).where(eq(events.status, "upcoming")).orderBy(asc(events.startDate)).limit(limit);
      return rows.map(r => ({ ...r, startDate: r.startDate.toISOString(), endDate: r.endDate.toISOString(), createdAt: r.createdAt.toISOString() }));
    },
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
