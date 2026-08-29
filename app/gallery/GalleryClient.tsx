"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/*
  GALLERY — React Bits Masonry foundation (re-implemented editorially)
  - Masonry via CSS columns (preserves natural aspect ratios, no JS layout thrash)
  - Dark cinematic, photography-first, minimal hover, lightbox, filter
  - Data in public/images/gallery/ — replaceable, dedicated structure
*/

type GalleryItem = {
  id: string;
  image: string; // public/images/gallery/<file>
  title: string;
  category: "Photography" | "Videography" | "Events";
  year?: string;
};

// Dedicated structure — replace images/titles at will, keep shape stable
// Using actual STLLR photography from /public/images/gallery (copied from /hero) — no Instagram scrape
const GALLERY: GalleryItem[] = [
  { id: "g01", image: "/images/gallery/gill.jpg", title: "Gill — Stage Light", category: "Photography", year: "2024" },
  { id: "g02", image: "/images/gallery/king.jpg", title: "King — Monopoly Moves", category: "Events", year: "2024" },
  { id: "g03", image: "/images/gallery/badshah.jpg", title: "Badshah — Live", category: "Events", year: "2024" },
  { id: "g04", image: "/images/gallery/talwinder.jpg", title: "Talwinder — Concert", category: "Events", year: "2024" },
  { id: "g05", image: "/images/gallery/raga.jpg", title: "Raga — Shadows", category: "Photography", year: "2023" },
  { id: "g06", image: "/images/gallery/gill.jpg", title: "Backstage — Gill Detail", category: "Photography", year: "2024" },
  { id: "g07", image: "/images/gallery/king.jpg", title: "King — Portrait Cut", category: "Videography", year: "2024" },
  { id: "g08", image: "/images/gallery/badshah.jpg", title: "Smoke — Badshah Frame", category: "Videography", year: "2024" },
  { id: "g09", image: "/images/gallery/talwinder.jpg", title: "Talwinder — Crowd", category: "Photography", year: "2024" },
  { id: "g10", image: "/images/gallery/raga.jpg", title: "Raga — Warm Grain", category: "Videography", year: "2023" },
  { id: "g11", image: "/images/gallery/gill.jpg", title: "Still — Gill Close", category: "Events", year: "2024" },
  { id: "g12", image: "/images/gallery/king.jpg", title: "Still — King Light", category: "Photography", year: "2024" },
];

const FILTERS = ["ALL", "PHOTOGRAPHY", "VIDEOGRAPHY", "EVENTS"] as const;
type Filter = (typeof FILTERS)[number];

export default function GalleryClient() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const shouldReduce = useReducedMotion();

  const filtered = useMemo(() => {
    if (filter === "ALL") return GALLERY;
    return GALLERY.filter((g) => g.category.toUpperCase() === filter);
  }, [filter]);

  return (
    <section className="relative bg-[#080808] pt-[86px]">
      {/* header — big GALLERY left, big visual div right, Back to Home below heading */}
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-[6vw]">
        <div className="pb-8 pt-10 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-16">
          <h1
            className="font-[var(--font-bebas-neue)] leading-[0.86] tracking-[-0.02em] text-[#f0ede8]"
            style={{ fontSize: "clamp(3.4rem, 8vw, 7.6rem)" }}
          >
            GALLERY
          </h1>
          <p className="mt-4 max-w-[560px] font-[var(--font-dm-sans)] text-[13px] leading-[1.7] text-[#f0ede8]/45 sm:text-[14px]">
            Complete visual portfolio — photography-first, natural ratios preserved. Tap any frame for fullscreen. Replace images in{" "}
            <code className="rounded bg-[#111] px-1.5 py-0.5 font-mono text-[11px] text-[#f0ede8]/60">public/images/gallery/</code> when ready.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 border border-[#f0ede8]/15 px-5 py-2.5 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.18em] uppercase text-[#f0ede8]/70 transition-colors hover:border-[#f0ede8]/25 hover:bg-[#f0ede8] hover:text-[#080808]"
          >
            ← Back to Home
          </Link>
        </div>

        {/* filter — subtle, editorial — single hairline kept on header only */}
        <div className="mt-8 flex flex-wrap items-center gap-2 pt-0 sm:mt-10 sm:gap-3">
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={[
                  "rounded-full border px-4 py-1.5 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] uppercase transition-colors",
                  active
                    ? "border-[#f0ede8] bg-[#f0ede8] text-[#080808]"
                    : "border-[#1f1f1f] bg-transparent text-[#f0ede8]/40 hover:border-[#f0ede8]/20 hover:text-[#f0ede8]/70",
                ].join(" ")}
              >
                {f}
              </button>
            );
          })}
          <span className="ml-auto hidden font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/20 sm:inline">
            {filtered.length} frames · STLLR MEDIA
          </span>
        </div>
      </div>

      {/* Masonry — React Bits foundation: columns, natural ratios, reveal, hover zoom */}
      <div className="mx-auto mt-8 max-w-[1440px] px-3 sm:mt-10 sm:px-10 lg:px-[6vw]">
        <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 lg:gap-5 xl:gap-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item) => (
              <motion.article
                key={item.id}
                layout={!shouldReduce}
                initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="mb-3 break-inside-avoid overflow-hidden border border-[#1a1a1a] bg-[#0c0c0c] sm:mb-4 lg:mb-5"
              >
                <button
                  type="button"
                  onClick={() => setLightbox(item)}
                  className="group relative block w-full text-left"
                  aria-label={`Open ${item.title} fullscreen`}
                >
                  <div className="relative w-full overflow-hidden bg-[#111]">
                    {/* use plain img for natural ratio without forced aspect — next/image fill would need aspect wrapper */}
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className={[
                        "h-auto w-full object-cover transition duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        "group-hover:scale-[1.03]",
                      ].join(" ")}
                    />
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(8,8,8,0.62) 0%, transparent 55%, transparent 100%), radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(0,0,0,0.22) 100%)",
                      }}
                      aria-hidden="true"
                    />
                    {/* minimal hover info */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="font-[var(--font-dm-sans)] text-[9px] font-medium tracking-[0.16em] text-white/60 uppercase">
                        {item.category} {item.year ? `· ${item.year}` : ""}
                      </p>
                      <p className="mt-1 font-[var(--font-bebas-neue)] text-[1.15rem] leading-none tracking-[0.01em] text-white">{item.title}</p>
                    </div>
                    {/* corner hint */}
                    <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center border border-white/10 bg-black/30 text-white/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <svg viewBox="0 0 11 11" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.3}>
                        <path d="M2 8.5 L8.5 2 M8.5 2 H3.4 M8.5 2 V7.2" />
                      </svg>
                    </span>
                  </div>
                </button>
                {/* caption below — editorial minimal */}
                <div className="flex items-center justify-between bg-[#0a0a0a] px-3 py-2.5">
                  <span className="truncate font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.12em] text-[#f0ede8]/50 uppercase">{item.title}</span>
                  <span className="ml-2 shrink-0 font-[var(--font-dm-sans)] text-[9px] tracking-[0.1em] text-[#f0ede8]/20">{item.category}</span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center font-[var(--font-dm-sans)] text-[13px] text-[#f0ede8]/30">No frames in this category.</p>
        )}

        <div className="mt-10 h-px w-full bg-[#1a1a1a] sm:mt-12" aria-hidden="true" />
        <div className="flex items-center justify-between py-6 sm:py-8">
          <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/20">STLLR MEDIA · Photography-first</span>
          <Link href="/" className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/40 hover:text-[#f0ede8]/70">
            Back to Home →
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-[80] flex flex-col bg-black/90 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${lightbox.title} fullscreen`}
          >
            <div className="flex items-center justify-between px-4 py-4 sm:px-6">
              <div>
                <p className="font-[var(--font-bebas-neue)] text-[1.25rem] leading-none tracking-[0.01em] text-white">{lightbox.title}</p>
                <p className="mt-1 font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-white/50 uppercase">
                  {lightbox.category} {lightbox.year ? `· ${lightbox.year}` : ""} · {lightbox.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur hover:bg-white hover:text-black"
                aria-label="Close fullscreen"
              >
                <svg viewBox="0 0 12 12" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.4}>
                  <path d="M3 3 L9 9 M9 3 L3 9" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center p-4 sm:p-8" onClick={(e) => e.stopPropagation()}>
              <div className="relative flex max-h-[78vh] max-w-[92vw] items-center justify-center">
                <img
                  src={lightbox.image}
                  alt={lightbox.title}
                  className="max-h-[78vh] w-auto max-w-[92vw] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pb-6">
              <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-white/30">Click outside to close · Esc</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
