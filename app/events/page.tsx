"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Calendar, { Booking } from "@/components/Calendar";

export default function EventsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchBookings = async (attempt = 1) => {
            try {
                const res = await fetch("/api/bookings?includePast=true&limit=100", {
                    cache: "no-store",
                    credentials: "include",
                });
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                if (!cancelled) setBookings(data.bookings || []);
            } catch (err) {
                // ponytail: Neon cold start / Clerk warmup → auto-retry once (explains refresh fixes it)
                if (attempt < 2) {
                    await new Promise(r => setTimeout(r, 700));
                    return fetchBookings(attempt + 1);
                }
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load bookings");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchBookings();
        return () => { cancelled = true; };
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#080808]">
            <Navbar />

            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <Image
                    src="/hero/gill.jpg"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-[0.13] grayscale"
                />
                <div className="absolute inset-0 bg-[#080808]/80" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(240,237,232,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(240,237,232,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
            </div>

            <div className="relative flex-1 px-4 pb-12 pt-[86px] sm:px-6 sm:pt-[96px] md:pt-[120px] lg:px-[5.5vw]">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="mb-8 inline-flex items-center gap-2 border border-[#f0ede8]/20 bg-[#080808]/50 px-3 py-2 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.18em] text-[#f0ede8]/65 uppercase transition-colors hover:border-[#f0ede8]/50 hover:bg-[#f0ede8] hover:text-[#080808]"
                        >
                            <span aria-hidden="true">←</span>
                            Back to homepage
                        </Link>
                        <p className="mb-3 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.3em] text-[#39c16c] uppercase">
                            STLLR / LIVE BOOKINGS
                        </p>
                        <h1 className="font-[var(--font-bebas-neue)] text-4xl tracking-[0.18em] text-[#f0ede8] md:text-5xl">
                            BOOKING CALENDAR
                        </h1>
                        <p className="mt-3 text-lg text-[#f0ede8]/50">
                            View our upcoming events and availability
                        </p>
                    </div>

                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1f1f1f] border-t-[#e63030]"></div>
                            <p className="mt-4 text-[#555555]">
                                Loading calendar...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4 text-red-400">
                            Error: {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="rounded-lg border border-[#f0ede8]/15 bg-[#111111]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
                            <Calendar bookings={bookings} />
                        </div>
                    )}

                    {!loading && !error && bookings.length === 0 && (
                        <div className="text-center py-12 bg-[#111111] rounded-lg border border-[#1f1f1f]">
                            <p className="text-[#555555] text-lg">
                                No bookings yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
