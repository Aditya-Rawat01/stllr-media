import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Booking — STLLR Media",
  description: "Book STLLR Media — India's first community of top behind-the-camera artists. Booking coming soon.",
};

export default function BookingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#080808]">
      <Navbar />

      {/* background — same as /events for global theme consistency */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
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

      <div className="relative flex flex-1 flex-col px-4 pb-12 pt-[86px] sm:px-6 sm:pt-[96px] md:pt-[120px] lg:px-[5.5vw]">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
          <Link
            href="/"
            className="mb-8 inline-flex w-fit items-center gap-2 border border-[#f0ede8]/20 bg-[#080808]/50 px-3 py-2 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.18em] text-[#f0ede8]/65 uppercase transition-colors hover:border-[#f0ede8]/50 hover:bg-[#f0ede8] hover:text-[#080808]"
          >
            <span aria-hidden="true">←</span>
            Back to homepage
          </Link>

          {/* center — COMING SOON */}
          <div className="flex flex-1 items-center justify-center py-12 sm:py-16">
            <div className="w-full rounded-lg border border-[#f0ede8]/15 bg-[#111111]/90 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-12 lg:p-16">
              <p className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.3em] text-[#39c16c] uppercase">
                STLLR / BOOKING
              </p>
              <h1 className="mt-3 font-[var(--font-bebas-neue)] text-5xl tracking-[0.18em] text-[#f0ede8] sm:text-6xl md:text-7xl">
                COMING SOON
              </h1>
              <p className="mt-4 max-w-xl font-[var(--font-dm-sans)] text-[13.5px] leading-[1.7] text-[#f0ede8]/50 sm:text-[14px]">
                Our online booking is being woven — intimate, precise, and built for production houses and brands. For now, tell us about the shoot and we reply within 24 hours.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 border border-[#f0ede8] bg-[#f0ede8] px-6 py-3 font-[var(--font-dm-sans)] text-[11px] font-medium tracking-[0.18em] uppercase text-[#080808] transition-colors hover:bg-white hover:border-white"
                >
                  Enquire now
                  <svg viewBox="0 0 11 11" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path d="M1 10 L10 1 M10 1 H4 M10 1 V7" />
                  </svg>
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 border border-[#f0ede8]/20 bg-[#080808]/50 px-6 py-3 font-[var(--font-dm-sans)] text-[11px] font-medium tracking-[0.18em] uppercase text-[#f0ede8]/70 transition-colors hover:border-[#f0ede8]/40 hover:text-[#f0ede8]"
                >
                  View live bookings
                </Link>
              </div>

              <p className="mt-8 font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/20 uppercase">
                New Delhi · PAN India · stllrmedia@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
