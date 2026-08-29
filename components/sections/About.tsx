"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/*
  About / Who We Are — editorial breathing space after the cinematic Hero.
  - Same max-width + horizontal padding as Hero:  max-w-[1440px]  px-6 sm:px-10 lg:px-[6vw]
  - Dark cinematic palette, Bebas + DM Sans, hairline borders, generous whitespace.
  - Uses real STLLR copy + real assets only (king/gill). No invented history/stats.
  Animations:
  [1] Headline line-by-line stagger reveal (overflow-hidden + y:100% → 0)
  [2] Subtle scroll parallax on primary image (y + scale) — respects reduced-motion
*/

const headlineWrap = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.075, delayChildren: 0.12 },
  },
} as const;

const headlineLine = {
  hidden: { y: "105%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

export default function About() {
  const shouldReduce = useReducedMotion();
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ["start end", "end start"],
  });
  // parallax: image drifts with scroll, subtle
  const rawY = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);
  const rawScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.0]);
  const rawSecY = useTransform(scrollYProgress, [0, 1], ["6%", "-8%"]);
  const imgY = shouldReduce ? "0%" : (rawY as unknown as string);
  const imgScale = shouldReduce ? 1 : (rawScale as unknown as number);
  const secY = shouldReduce ? "0%" : (rawSecY as unknown as string);

  return (
    <section
      id="about"
      aria-label="About — Who We Are"
      className="relative overflow-hidden bg-[#080808]"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-[6vw]">
        {/* breathing space: top generous, bottom tight to eliminate double-gap with Selected Work */}
        <div className="pt-20 sm:pt-24 lg:pt-28 xl:pt-32 pb-8 sm:pb-10 lg:pb-12">
          {/* ── Eyebrow row ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-between gap-6 pb-6 sm:pb-7"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.28em] text-[#f0ede8]/30">
                01
              </span>
              <span className="hidden h-px w-10 bg-[#f0ede8]/15 sm:block" aria-hidden="true" />
              <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.24em] text-[#f0ede8]/60 uppercase">
                Who We Are
              </span>
            </div>
            <span className="hidden font-[var(--font-dm-sans)] text-[9px] font-medium tracking-[0.18em] text-[#f0ede8]/25 uppercase md:block">
              Photography · Videography · Creative Production
            </span>
          </motion.div>

          {/* ── Main editorial grid ─────────────────────── */}
          <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-12 lg:mt-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-16">
            {/* LEFT — headline + supporting copy */}
            <div className="order-1 min-w-0">
              {/* Editorial headline — stagger line-by-line [1] */}
              <motion.h2
                variants={headlineWrap}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="font-[var(--font-bebas-neue)] leading-[0.88] tracking-[-0.015em] text-[#f0ede8]"
                style={{ fontSize: "clamp(2.75rem, 6.2vw, 5.85rem)" }}
              >
                <span className="block overflow-hidden">
                  <motion.span variants={headlineLine} className="block">
                    VISUAL STORIES
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span variants={headlineLine} className="block">
                    THAT <span className="text-[#f0ede8]/35">CONNECT,</span>
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span variants={headlineLine} className="block">
                    <span className="text-[#f0ede8]/35">INSPIRE</span> —
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span variants={headlineLine} className="block">
                    AND LEAVE
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span variants={headlineLine} className="block">
                    A MARK.
                  </motion.span>
                </span>
              </motion.h2>

              {/* Accent hairline under headline — editorial detail */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
                className="mt-8 h-px w-12 origin-left bg-[#e63030] sm:mt-10"
                aria-hidden="true"
              />

              {/* Supporting description — concise, only STLLR's own phrasing */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.62 }}
                className="mt-8 max-w-[460px] sm:mt-9"
              >
                <p className="font-[var(--font-dm-sans)] text-[14px] leading-[1.85] text-[#f0ede8]/58 sm:text-[14.5px]">
                  We are STLLR Media, a creative studio crafting visual stories
                  that connect, inspire and leave a mark.
                  <br className="hidden sm:block" />
                  Photography. Videography. Creative Production — still or
                  moving, every frame is made with intent.
                </p>

                {/* micro meta row — not stats, just craft labels */}
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#1a1a1a] pt-6">
                  <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] text-[#f0ede8]/35 uppercase">
                    Still
                  </span>
                  <span className="h-3 w-px self-center bg-[#1f1f1f]" aria-hidden="true" />
                  <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] text-[#f0ede8]/35 uppercase">
                    Motion
                  </span>
                  <span className="h-3 w-px self-center bg-[#1f1f1f]" aria-hidden="true" />
                  <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] text-[#f0ede8]/35 uppercase">
                    Production
                  </span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT — carefully placed visual assets [2] parallax */}
            <motion.div
              ref={imgRef}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
              className="order-2 relative min-w-0 lg:pl-2 xl:pl-6"
            >
              {/* Single editorial frame — primary */}
              <div className="group relative z-0 overflow-hidden bg-[#111] sm:ml-auto sm:max-w-[520px] lg:max-w-none">
                {/* hairline border */}
                <div className="absolute inset-0 z-10 rounded-none border border-[#1f1f1f]/60" aria-hidden="true" />

                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {/* parallax layer — single tall element with headroom, avoids gap */}
                  <motion.div
                    style={{ y: imgY, scale: imgScale }}
                    className="absolute -top-[8%] left-0 h-[116%] w-full will-change-transform"
                  >
                    <Image
                      src="/hero/gill.jpg"
                      alt="STLLR Media — editorial portrait"
                      fill
                      sizes="(max-width: 1024px) 92vw, 38vw"
                      className="object-cover"
                      priority={false}
                    />
                  </motion.div>

                  {/* subtle vignette for depth, not a card */}
                  <div
                    className="absolute inset-0 z-[1]"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(8,8,8,0.55) 0%, transparent 45%, transparent 100%), radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.35) 100%)",
                    }}
                    aria-hidden="true"
                  />
                  {/* top-left corner mark — editorial detail */}
                  <div className="absolute left-4 top-4 z-10 hidden h-[18px] w-[18px] border-l border-t border-[#f0ede8]/20 sm:block" aria-hidden="true" />
                  <div className="absolute bottom-4 right-4 z-10 hidden h-[18px] w-[18px] border-b border-r border-[#f0ede8]/20 sm:block" aria-hidden="true" />
                </div>

                {/* caption bar — minimal, not a card */}
                <div className="flex items-center justify-between border-t border-[#1f1f1f] bg-[#0c0c0c] px-4 py-3">
                  <span className="font-[var(--font-dm-sans)] text-[9px] font-medium tracking-[0.18em] text-[#f0ede8]/30 uppercase">
                    Frame 01 — Still
                  </span>
                  <span className="font-[var(--font-dm-sans)] text-[9px] tracking-[0.14em] text-[#f0ede8]/20">
                    STLLR MEDIA
                  </span>
                </div>
              </div>

              {/* Secondary inset — must sit ABOVE primary on overlap (z-20) */}
              <motion.div
                style={{ y: secY }}
                className="absolute -bottom-8 -left-6 z-20 hidden w-[38%] border border-[#1f1f1f] bg-[#0c0c0c] shadow-[0_16px_40px_rgba(0,0,0,0.6)] will-change-transform lg:block xl:-left-8 xl:w-[36%]"
              >
                <div className="relative aspect-[3/3.9] overflow-hidden">
                  <Image
                    src="/hero/king.jpg"
                    alt="STLLR Media — detail frame"
                    fill
                    sizes="16vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/5" aria-hidden="true" />
                </div>
                <div className="border-t border-[#1f1f1f] px-3 py-2">
                  <span className="font-[var(--font-dm-sans)] text-[8.5px] font-medium tracking-[0.16em] text-[#f0ede8]/25 uppercase">
                    Frame 02 — Motion
                  </span>
                </div>
              </motion.div>

              {/* faint vertical label — desktop editorial accent, no overflow */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-[1.6rem] top-8 hidden select-none font-[var(--font-bebas-neue)] text-[11px] tracking-[0.42em] text-[#f0ede8]/10 [writing-mode:vertical-lr] lg:block xl:-right-2"
              >
                STLLR — EST. STUDIO
              </span>
            </motion.div>
          </div>

          {/* bottom hairline removed — Selected Work header provides the single divider to avoid double gap */}
        </div>
      </div>
    </section>
  );
}
