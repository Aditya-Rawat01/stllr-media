"use client";

import Image from "next/image";
import { NAVBAR_H } from "@/components/layout/Navbar";

/* ── Hero images ─────────────────────────────────────────────────────────
   4 images → 4 cards, 90° apart (top / right / bottom / left).
   Add more entries here when more assets arrive.
──────────────────────────────────────────────────────────────────────── */
const HERO_IMAGES = [
  { src: "/hero/king.jpg",      alt: "King – STLLR Media project"      },
  { src: "/hero/badshah.jpg",   alt: "Badshah – STLLR Media project"   },
  { src: "/hero/gill.jpg",      alt: "Gill – STLLR Media project"      },
  { src: "/hero/talwinder.jpg", alt: "Talwinder – STLLR Media project" },
] as const;

/* ── Geometry ────────────────────────────────────────────────────────────
  Container   : square, side S = clamp(320px, 46vw, 600px)
  Dashed ring : inset 13%  → radius ≈ 37% S  (pulled inward)
  Inner disc  : inset 37%  → radius ≈ 13% S  (much smaller centre)
  Card orbit  : centres sit on the ring  (RING_R = 37)
  Card width  : 26.5% of S → S=600 → ~159px | S=320 → ~85px (larger)
  Cards orbit slowly as a group; inner disc + label stay static.
  Cards counter-rotate so they stay upright while orbiting.
────────────────────────────────────────────────────────────────────── */
const RING_R      = 37;    /* % — orbit radius, matches dashed ring    */
const CARD_W      = 26.5;  /* % — card width relative to container     */
const CARD_ASPECT = 1.33;  /* height = width × aspect (portrait)       */
const ORBIT_DUR   = "48s"; /* slow continuous rotation                 */

function CircularCardGallery() {
  return (
    <div
      className="relative aspect-square w-full max-w-full"
      style={{ width: "clamp(320px, 46vw, 600px)" }}
      aria-label="STLLR Media project gallery"
    >
      {/* keyframes for orbit + counter-rotation */}
      <style>{`
        @keyframes hero-orbit-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes hero-card-counter {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-orbit, .hero-card-inner { animation: none !important; }
        }
      `}</style>

      {/* ── Rotating orbit layer: dashed ring + cards ── */}
      <div
        className="hero-orbit absolute inset-0"
        style={{ animation: `hero-orbit-spin ${ORBIT_DUR} linear infinite` }}
        aria-hidden="true"
      >
        {/* Dashed ring — now tighter (inset 13%) */}
        <div
          className="pointer-events-none absolute rounded-full border border-dashed border-[#f0ede8]/14"
          style={{ inset: "13%" }}
        />

        {/* Cards — one per image, placed on the tighter ring */}
        {HERO_IMAGES.map((img, index) => {
          const angleDeg = -90 + index * 90;
          const rad = (angleDeg * Math.PI) / 180;
          const cx = 50 + RING_R * Math.cos(rad);
          const cy = 50 + RING_R * Math.sin(rad);
          const cardH = CARD_W * CARD_ASPECT;

          return (
            <div
              key={img.src}
              className="hero-card-inner absolute z-20"
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                width: `${CARD_W}%`,
                paddingBottom: `${cardH}%`,
                transform: `translate(-50%, -50%) rotate(0deg)`,
                animation: `hero-card-counter ${ORBIT_DUR} linear infinite`,
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[5px] shadow-[0_10px_36px_rgba(0,0,0,0.8)]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 26vw, 17vw"
                  className="object-cover"
                  priority={index < 2}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(0,0,0,0.42) 100%)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Static centre: inner disc + label (above rotating layer) ── */}
      <div
        className="absolute z-10 rounded-full"
        style={{
          inset: "37%",
          background:
            "radial-gradient(circle at 45% 38%, #1a1a1a 0%, #0e0e0e 42%, #080808 72%)",
          boxShadow: "0 0 50px 14px rgba(0,0,0,0.9)",
        }}
      />
      <div
        className="absolute z-10 flex flex-col items-center justify-center select-none"
        style={{ inset: "37%" }}
      >
        <span
          className="font-[var(--font-bebas-neue)] leading-none tracking-[0.30em] text-[#f0ede8]"
          style={{ fontSize: "clamp(0.68rem, 1.22vw, 1.05rem)" }}
        >
          STLLR
          <sup
            className="font-[var(--font-dm-sans)] font-normal align-super"
            style={{ fontSize: "0.38em", letterSpacing: 0 }}
          >
            ®
          </sup>
        </span>
        <span
          className="mt-[1px] font-[var(--font-dm-sans)] font-medium tracking-[0.48em] text-[#f0ede8]/45"
          style={{ fontSize: "clamp(0.26rem, 0.5vw, 0.40rem)" }}
        >
          MEDIA
        </span>
      </div>
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
export default function Hero() {
  /*
    Total page height = navbar (NAVBAR_H) + hero section = 100svh exactly.
    The section itself is 100svh; its inner grid top-padding = NAVBAR_H
    so content is never under the navbar.
    We use `height: calc(100svh - NAVBAR_HPX)` on the grid so the content
    area fills exactly the remaining viewport.
  */
  const innerH = `calc(100svh - ${NAVBAR_H}px)`;

  return (
    <section
      className="relative isolate bg-[#080808]"
      style={{ height: "100svh", overflowX: "hidden" }}
      aria-label="Hero"
    >
      {/* ── Main grid ─────────────────────────────────────────── */}
      <div
        className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-6 sm:px-10 lg:grid-cols-[0.42fr_0.58fr] lg:gap-0 lg:px-[6vw]"
        style={{
          height:     innerH,
          marginTop:  NAVBAR_H,
          paddingBottom: 52,   /* bottom bar clearance */
        }}
      >
        {/* LEFT — text — matches reference: tight stacked display */}
        <div className="z-10 max-w-[520px]">
          <p className="mb-4 sm:mb-5 text-[9px] sm:text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/45 uppercase">
            Photography.&nbsp; Videography.&nbsp; Creative Production.
          </p>
          <h1
            className="font-[var(--font-bebas-neue)] uppercase leading-[0.86] tracking-[-0.015em] text-[#f0ede8]"
            style={{ fontSize: "clamp(4rem, 7.8vw, 7.6rem)" }}
          >
            MAKE IT
            <br />
            STILL.
            <br />
            MAKE IT
            <br />
            MOVE.
          </h1>
          <p className="mt-6 sm:mt-7 max-w-[320px] text-[13px] sm:text-[13.5px] leading-[1.7] tracking-[0.01em] text-[#a8a5a0]">
            We are STLLR Media, a creative studio
            <br className="hidden sm:block" />
            crafting visual stories that connect, inspire
            <br className="hidden sm:block" />
            and leave a mark.
          </p>
        </div>

        {/* RIGHT — circular composition */}
        <div className="relative flex h-full w-full items-center justify-center">
          <CircularCardGallery />
        </div>
      </div>
    </section>
  );
}
