"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/*
  SERVICES — editorial full-width list + floating hover preview.
  Source-locked to verifiable profiles only:
  - LinkedIn: Photography, Videography, Content Production, Digital Media Services
  - Instagram @stllr_media: Aggregating Multi-media Services · PAN India
  List uses FULL width, no permanent right column. Preview is fixed-positioned,
  does not affect layout, appears on hover near cursor, clamped to viewport.
*/

type Service = {
  slug: string;
  num: string;
  name: string;
  category: string;
  description: string;
  image: string;
};

const SERVICES: Service[] = [
  {
    slug: "photography",
    num: "01",
    name: "Photography",
    category: "Still · Campaign · Concert",
    description: "Still coverage for brands, campaigns and concerts — PAN India via verified behind-the-camera artists",
    image: "/hero/gill.jpg",
  },
  {
    slug: "videography",
    num: "02",
    name: "Videography",
    category: "Motion · 4K",
    description: "Motion capture for films, events and concerts — concept to final grade, scalable crew",
    image: "/hero/king.jpg",
  },
  {
    slug: "content-production",
    num: "03",
    name: "Content Production",
    category: "Aggregating Multi-media Services",
    description: "PAN India talent-sourcing — 100+ verified freelancers, photography + videography + post at scale",
    image: "/hero/talwinder.jpg",
  },
  {
    slug: "digital-media-services",
    num: "04",
    name: "Digital Media Services",
    category: "Delivery · Distribution",
    description: "Platform-ready delivery and digital rollout — edits, grades and assets for brand channels",
    image: "/hero/badshah.jpg",
  },
];

export default function Services() {
  const [active, setActive] = useState<string>(SERVICES[0].slug);
  const [hovered, setHovered] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const shouldReduce = useReducedMotion();
  const activeService = SERVICES.find((s) => s.slug === active) ?? SERVICES[0];
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (shouldReduce) return;
    // offset toward right / slightly above cursor
    const x = e.clientX + 24;
    const y = e.clientY - 140;
    // clamp to viewport — preview 360× ~270, keep 16px margin
    const cardW = 360;
    const cardH = 272;
    const clampX = Math.min(x, window.innerWidth - cardW - 16);
    const clampY = Math.max(16, Math.min(y, window.innerHeight - cardH - 16));
    setCursor({ x: clampX < 16 ? 16 : clampX, y: clampY });
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-label="Services"
      className="relative overflow-hidden bg-[#080808]"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-[6vw]">
        {/* eyebrow */}
        <div className="flex items-center justify-between gap-6 pb-6 pt-12 sm:pb-7 sm:pt-14 lg:pt-16">
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.28em] text-[#f0ede8]/30">03</span>
            <span className="hidden h-px w-10 bg-[#f0ede8]/15 sm:block" aria-hidden="true" />
            <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.24em] text-[#f0ede8]/60 uppercase">Services</span>
          </div>
          <span className="hidden font-[var(--font-dm-sans)] text-[9px] font-medium tracking-[0.18em] text-[#f0ede8]/25 uppercase md:block">
            Concept → Shoot → Grade → Deliver
          </span>
        </div>

        {/* heading */}
        <div className="pt-8 sm:pt-10 lg:pt-12">
          <h2
            className="font-[var(--font-bebas-neue)] leading-[0.86] tracking-[-0.02em] text-[#f0ede8]"
            style={{ fontSize: "clamp(3.2rem, 8vw, 7.2rem)" }}
          >
            SERVICES
          </h2>
          <p className="mt-3 max-w-[520px] font-[var(--font-dm-sans)] text-[13px] leading-[1.7] text-[#f0ede8]/45 sm:text-[14px]">
            Production house for brands &amp; creators — not a wedding studio. Four focused crafts, one pipeline.
          </p>
        </div>

        {/* FULL-WIDTH editorial list — hover only over this list shows preview */}
        <div
          className="mt-10 sm:mt-12 lg:mt-14"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {SERVICES.map((service) => {
            const isActive = service.slug === active;
            return (
              <div
                key={service.slug}
                onMouseEnter={() => setActive(service.slug)}
                onFocus={() => setActive(service.slug)}
                onClick={() => setActive(service.slug)}
                tabIndex={0}
                role="button"
                aria-current={isActive}
                className={[
                  "group flex cursor-pointer items-start gap-4 border-b border-[#1a1a1a] py-6 outline-none sm:gap-6 sm:py-7 lg:gap-8 lg:py-8 xl:gap-10",
                  "transition-colors duration-300",
                  isActive ? "border-[#262626]" : "hover:border-[#232323]",
                ].join(" ")}
              >
                {/* number */}
                <span
                  className={[
                    "mt-1 shrink-0 font-[var(--font-dm-sans)] text-[11px] font-medium tracking-[0.16em] tabular-nums transition-colors duration-300",
                    isActive ? "text-[#f0ede8]" : "text-[#f0ede8]/25 group-hover:text-[#f0ede8]/45",
                  ].join(" ")}
                >
                  {service.num}
                </span>

                {/* name + category + desc — spans full width */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4 lg:gap-6">
                    <h3
                      className={[
                        "font-[var(--font-bebas-neue)] leading-none tracking-[-0.015em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        isActive ? "translate-x-1 text-[#f0ede8] sm:translate-x-2" : "text-[#f0ede8]/55 group-hover:text-[#f0ede8]/80",
                      ].join(" ")}
                      style={{ fontSize: "clamp(1.65rem, 3.4vw, 2.65rem)" }}
                    >
                      {service.name}
                    </h3>
                    <span className="hidden font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/25 uppercase sm:inline">
                      — {service.category}
                    </span>
                  </div>
                  <p className="mt-1 font-[var(--font-dm-sans)] text-[9px] font-medium tracking-[0.16em] text-[#f0ede8]/25 uppercase sm:hidden">
                    {service.category}
                  </p>
                  <p
                    className={[
                      "mt-3 max-w-[640px] font-[var(--font-dm-sans)] text-[13px] leading-[1.7] transition-colors duration-300 sm:text-[13.5px] lg:max-w-[620px]",
                      isActive ? "text-[#f0ede8]/55" : "text-[#f0ede8]/32 group-hover:text-[#f0ede8]/45",
                    ].join(" ")}
                  >
                    {service.description}
                  </p>

                  {/* mobile inline preview — tap to expand, only one at a time, no hover */}
                  <div className="mt-4 overflow-hidden md:hidden">
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          key={service.slug + "-mob"}
                          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                          animate={shouldReduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="relative aspect-[16/10] overflow-hidden border border-[#1f1f1f] bg-[#111]"
                        >
                          <Image src={service.image} alt={service.name} fill sizes="92vw" className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden="true" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* arrow */}
                <span
                  className={[
                    "mt-2 hidden h-8 w-8 shrink-0 items-center justify-center border transition-all duration-300 sm:inline-flex lg:h-9 lg:w-9",
                    isActive
                      ? "translate-x-0 border-[#f0ede8]/15 bg-[#f0ede8]/5 text-[#f0ede8] opacity-100"
                      : " -translate-x-1 border-transparent text-[#f0ede8]/15 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:border-[#f0ede8]/10 group-hover:text-[#f0ede8]/40",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 11 11" width={11} height={11} fill="none" stroke="currentColor" strokeWidth={1.3}>
                    <path d="M2 8.5 L8.5 2 M8.5 2 H3.4 M8.5 2 V7.2" />
                  </svg>
                </span>
              </div>
            );
          })}

          {/* bottom meta */}
          <div className="flex items-center justify-between pt-6 sm:pt-8">
            <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/20">04 crafts · New Delhi · stllrmedia@gmail.com</span>
            <Link
              href="#contact"
              className="group inline-flex items-center gap-2 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] uppercase text-[#f0ede8]/60 transition-colors hover:text-[#f0ede8]"
            >
              Enquire
              <span className="inline-flex h-5 w-5 items-center justify-center border border-[#f0ede8]/15 transition-colors group-hover:border-[#f0ede8]/25 group-hover:bg-[#f0ede8] group-hover:text-[#080808]">
                <svg viewBox="0 0 11 11" width={8} height={8} fill="none" stroke="currentColor" strokeWidth={1.4}>
                  <path d="M2 8.5 L8.5 2 M8.5 2 H3.8 M8.5 2 V6.8" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* consistent bottom spacing — no trailing hairline; next section's eyebrow is the single divider */}
        <div className="h-12 sm:h-14 lg:h-16" aria-hidden="true" />
      </div>

      {/* FLOATING PREVIEW — fixed, does not affect layout, hidden by default */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="floating-preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed z-30 hidden md:block"
            style={{
              left: cursor.x,
              top: cursor.y,
              // smooth follow — motion handles interpolation via style update (no spring needed; instant clamp is already smooth via 0.28s fade)
            }}
            aria-hidden="true"
          >
            <div className="w-[300px] overflow-hidden border border-[#1f1f1f] bg-[#0e0e0e] shadow-[0_24px_64px_rgba(0,0,0,0.65)] md:w-[320px] lg:w-[360px] xl:w-[380px]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeService.slug}
                    initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
                    animate={shouldReduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <Image src={activeService.image} alt={activeService.name} fill sizes="380px" className="object-cover" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(8,8,8,0.5) 0%, transparent 50%, transparent 100%), radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.28) 100%)",
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
                {/* corner marks */}
                <div className="pointer-events-none absolute left-3 top-3 h-[16px] w-[16px] border-l border-t border-[#f0ede8]/15" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-[16px] w-[16px] border-b border-r border-[#f0ede8]/15" />
              </div>
              <div className="flex items-center justify-between bg-[#0a0a0a] px-4 py-3">
                <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.16em] text-[#f0ede8]/60 uppercase">
                  {activeService.name}
                </span>
                <span className="font-[var(--font-dm-sans)] text-[9px] tracking-[0.12em] text-[#f0ede8]/30">{activeService.num}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
