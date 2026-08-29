"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Placeholder data — replaceable, separate from presentation
// Used when no suitable public API exists or API returns empty / unauthenticated.
// Do NOT claim these are actual STLLR bookings.
type EventCard = {
  id: string;
  date: string; // e.g., "12 SEP 2026"
  isoDate?: string; // for sorting / real API
  title: string; // e.g., BRAND CAMPAIGN
  service: string; // e.g., Photography
  location: string; // e.g., New Delhi
};

const PLACEHOLDER_EVENTS: EventCard[] = [
  {
    id: "ph-01",
    date: "12 SEP 2026",
    title: "BRAND CAMPAIGN",
    service: "Photography",
    location: "New Delhi",
  },
  {
    id: "ph-02",
    date: "18 OCT 2026",
    title: "CORPORATE FILM",
    service: "Videography",
    location: "Mumbai",
  },
  {
    id: "ph-03",
    date: "05 NOV 2026",
    title: "CONTENT PRODUCTION",
    service: "Photography · Motion",
    location: "New Delhi",
  },
];

function formatBookingDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-IN", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return iso.slice(0, 10);
  }
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventCard[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Inspect: existing booking/calendar API — /api/bookings returns upcoming bookings but requires auth (getCurrentUser).
        // Try it; if 401/empty, fall back to placeholder. This keeps section usable for public visitors.
        const res = await fetch("/api/bookings?limit=3", { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          ok?: boolean;
          bookings?: Array<{
            id: string;
            bookingDate: string;
            serviceName?: string | null;
            city?: string | null;
            location?: string | null;
            notes?: string | null;
          }>;
        };
        if (!data.ok || !Array.isArray(data.bookings) || data.bookings.length === 0) throw new Error("no bookings");

        const mapped: EventCard[] = data.bookings.slice(0, 3).map((b) => ({
          id: b.id,
          isoDate: b.bookingDate,
          date: formatBookingDate(b.bookingDate),
          // Use service name if present, else generic — do not invent client names
          title: (b.serviceName?.toUpperCase() || "PRODUCTION") as string,
          service: b.serviceName || "Production",
          location: b.city || b.location || "New Delhi",
        }));

        if (!cancelled) setEvents(mapped);
      } catch {
        // No suitable public API data or unauthenticated — use placeholder (replaceable)
        if (!cancelled) setEvents(PLACEHOLDER_EVENTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const display = events ?? PLACEHOLDER_EVENTS;
  const isEmpty = !loading && display.length === 0;

  return (
    <section id="events" aria-label="Upcoming Events" className="relative overflow-hidden bg-[#080808]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-[6vw]">
        {/* top bar */}
        <div className="flex items-center justify-between gap-6 pb-6 pt-12 sm:pb-7 sm:pt-14 lg:pt-16">
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="hidden h-px w-10 bg-[#f0ede8]/15 sm:block" aria-hidden="true" />
            <h2 className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.24em] text-[#f0ede8]/60 uppercase">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] uppercase text-[#f0ede8]/60 transition-colors hover:text-[#f0ede8]"
          >
            View All Events
            <span className="inline-flex h-5 w-5 items-center justify-center border border-[#f0ede8]/15 transition-colors group-hover:border-[#f0ede8]/30 group-hover:bg-[#f0ede8] group-hover:text-[#080808]">
              <svg viewBox="0 0 11 11" width={9} height={9} fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true">
                <path d="M2 8.5 L8.5 2 M8.5 2 H3.8 M8.5 2 V6.8" />
              </svg>
            </span>
          </Link>
        </div>

        {/* cards — 3 in one horizontal row desktop, stack mobile */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-3 sm:gap-4 lg:gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[190px] animate-pulse border border-[#1a1a1a] bg-[#0e0e0e] sm:h-[210px]" aria-hidden="true" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="border border-dashed border-[#1f1f1f] bg-[#0a0a0a]/40 px-6 py-12 text-center">
            <p className="font-[var(--font-dm-sans)] text-[12px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">No upcoming events</p>
            <p className="mt-2 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/20">New bookings will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-3 sm:gap-4 sm:pt-10 lg:gap-6">
            {display.slice(0, 3).map((ev) => (
              <article
                key={ev.id}
                className="group relative flex min-h-[190px] flex-col justify-between border border-[#1a1a1a] bg-[#0e0e0e] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#262626] hover:bg-[#0f0f0f] sm:min-h-[210px] sm:p-6"
              >
                {/* top */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e63030] shadow-[0_0_6px_rgba(230,48,48,0.5)]" aria-hidden="true" />
                    <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/40 uppercase">Upcoming</span>
                  </div>
                  <p className="mt-3 font-[var(--font-dm-sans)] text-[11px] font-medium tracking-[0.12em] text-[#f0ede8]/60 tabular-nums">
                    {ev.date}
                  </p>
                </div>

                {/* middle — title/service */}
                <div className="mt-8">
                  <h3 className="font-[var(--font-bebas-neue)] text-[1.5rem] leading-none tracking-[0.01em] text-[#f0ede8] transition-colors group-hover:text-white sm:text-[1.6rem]">
                    {ev.title}
                  </h3>
                  <p className="mt-1.5 font-[var(--font-dm-sans)] text-[11px] tracking-[0.08em] text-[#f0ede8]/35">{ev.service}</p>
                </div>

                {/* bottom — location + arrow */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="font-[var(--font-dm-sans)] text-[11px] tracking-[0.04em] text-[#f0ede8]/35">{ev.location}</span>
                  <span className="inline-flex h-7 w-7 items-center justify-center border border-[#1f1f1f] bg-[#0a0a0a] text-[#f0ede8]/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:border-[#f0ede8]/15 group-hover:text-[#f0ede8]/60">
                    <svg viewBox="0 0 11 11" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true">
                      <path d="M2 8.5 L8.5 2 M8.5 2 H3.4 M8.5 2 V7.2" />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* consistent bottom spacing — no trailing hairline */}
        <div className="h-12 sm:h-14 lg:h-16" aria-hidden="true" />
      </div>
    </section>
  );
}
