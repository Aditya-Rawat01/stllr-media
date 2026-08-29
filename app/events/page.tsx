"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Calendar, { Booking } from "@/components/Calendar";

export default function EventsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-[#080808]">
      <Navbar />
      
      <div className="flex-1 pt-[86px] sm:pt-[96px] md:pt-[120px] px-4 sm:px-6 lg:px-[5.5vw] pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-[var(--font-bebas-neue)] tracking-[0.18em] text-[#f0ede8]">
              BOOKING CALENDAR
            </h1>
            <p className="text-[#555555] mt-3 text-lg">
              View our upcoming events and availability
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1f1f1f] border-t-[#e63030]"></div>
              <p className="mt-4 text-[#555555]">Loading calendar...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-4 text-red-400">
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="bg-[#111111] rounded-lg border border-[#1f1f1f] p-6 sm:p-8">
              <Calendar bookings={bookings} />
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="text-center py-12 bg-[#111111] rounded-lg border border-[#1f1f1f]">
              <p className="text-[#555555] text-lg">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
