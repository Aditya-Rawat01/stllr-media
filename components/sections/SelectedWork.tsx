"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";

type Project = {
  id: string;
  title: string;
  category: string;
  image: string;
  alt: string;
};

const PROJECTS: Project[] = [
  { id: "01", title: "Project — 01", category: "Photography", image: "/hero/raga.jpg", alt: "Raga Concert" },
  { id: "02", title: "Project — 02", category: "Videography", image: "/hero/king.jpg", alt: "Monopoly Moves Event - King" },
  { id: "03", title: "Project — 03", category: "Creative Production", image: "/hero/badshah.jpg", alt: "Badshah Concert" },
  { id: "04", title: "Project — 04", category: "Photography · Motion", image: "/hero/talwinder.jpg", alt: "Talwinder Concert" },
];

export default function SelectedWork() {
  // embla — now NOT draggable; driven by vertical scroll
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: false,
    watchDrag: false, // no manual drag/swipe
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // vertical scroll → active project (0..3)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const raw = v * (PROJECTS.length - 1);
    const idx = Math.round(raw);
    const clamped = Math.max(0, Math.min(PROJECTS.length - 1, idx));
    if (clamped !== selectedIndex) {
      setSelectedIndex(clamped);
      emblaApi?.scrollTo(clamped);
    }
  });

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-label="Selected Work"
      className="relative h-[300vh] bg-[#080808]"
    >
      {/* stickyviewport — stays fixed while user scrolls vertically */}
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1440px] shrink-0 items-center justify-between gap-6 border-b border-[#1a1a1a] px-6 pb-6 pt-8 sm:px-10 sm:pb-7 sm:pt-10 lg:px-[6vw] lg:pb-7 lg:pt-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.28em] text-[#f0ede8]/30">02</span>
            <span className="hidden h-px w-10 bg-[#f0ede8]/15 sm:block" aria-hidden="true" />
            <span className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.24em] text-[#f0ede8]/60 uppercase">
              Selected Work
            </span>
          </div>

          <div className="flex items-center gap-5 sm:gap-8">
            <span className="hidden font-[var(--font-dm-sans)] text-[11px] tracking-[0.16em] text-[#f0ede8]/25 sm:inline-flex items-center gap-2">
              <span className="font-medium tracking-[0.14em] text-[#f0ede8] tabular-nums">
                {String(selectedIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-[#f0ede8]/20">/</span>
              <span className="tabular-nums">04</span>
            </span>
            <Link
              href="#work"
              className="group inline-flex items-center gap-2 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] uppercase text-[#f0ede8]/70 transition-colors hover:text-[#f0ede8]"
            >
              View All Work
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center border border-[#f0ede8]/15 transition-colors group-hover:border-[#f0ede8]/30 group-hover:bg-[#f0ede8] group-hover:text-[#080808]"
              >
                <svg viewBox="0 0 11 11" width={9} height={9} fill="none" stroke="currentColor" strokeWidth={1.4}>
                  <path d="M2 8.5 L8.5 2 M8.5 2 H3.8 M8.5 2 V6.8" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* — Carousel — centered active, prev/next peeking, driven by scroll */}
        <div className="flex flex-1 flex-col justify-center py-6 sm:py-8">
          <div
            className="mx-auto w-full max-w-[1440px] overflow-hidden px-0 sm:px-10 lg:px-[6vw]"
            ref={emblaRef}
            aria-roledescription="carousel"
            aria-label="Selected work carousel — scroll to navigate"
          >
            <div className="flex gap-4 sm:gap-5 lg:gap-6">
              {PROJECTS.map((project, index) => {
                const isActive = index === selectedIndex;
                return (
                  <div
                    key={project.id}
                    className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_72%] lg:flex-[0_0_60%] xl:flex-[0_0_56%]"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${PROJECTS.length}`}
                  >
                    <article
                      className={[
                        "group relative select-none overflow-hidden border bg-[#0c0c0c]",
                        shouldReduce
                          ? "transition-none"
                          : "transition-all duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        isActive
                          ? "scale-100 opacity-100 border-[#1f1f1f] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                          : "scale-[0.94] opacity-45 border-[#1a1a1a] sm:scale-[0.96] sm:opacity-60",
                      ].join(" ")}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[4/3] lg:aspect-[16/11]">
                        <Image
                          src={project.image}
                          alt={project.alt}
                          fill
                          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 72vw, 56vw"
                          className={[
                            "object-cover",
                            shouldReduce ? "" : "transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                            isActive ? "scale-100" : "scale-[1.04]",
                          ].join(" ")}
                          priority={index === 0}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(8,8,8,0.72) 0%, rgba(8,8,8,0.18) 42%, transparent 68%), radial-gradient(ellipse at 50% 35%, transparent 38%, rgba(0,0,0,0.45) 100%)",
                          }}
                          aria-hidden="true"
                        />
                        <div
                          className={[
                            "absolute left-4 top-4 hidden h-[18px] w-[18px] border-l border-t sm:block",
                            shouldReduce ? "" : "transition-opacity duration-500",
                            isActive ? "border-[#f0ede8]/20 opacity-100" : "border-[#f0ede8]/0 opacity-0",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <div
                          className={[
                            "absolute bottom-4 right-4 hidden h-[18px] w-[18px] border-b border-r sm:block",
                            shouldReduce ? "" : "transition-opacity duration-500",
                            isActive ? "border-[#f0ede8]/20 opacity-100" : "border-[#f0ede8]/0 opacity-0",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        <span
                          aria-hidden="true"
                          className={[
                            "absolute right-4 top-4 font-[var(--font-bebas-neue)] text-[11px] tracking-[0.22em]",
                            shouldReduce ? "" : "transition-opacity duration-500",
                            isActive ? "text-[#f0ede8]/30" : "text-[#f0ede8]/15",
                          ].join(" ")}
                        >
                          {project.id}
                        </span>
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6 lg:p-7">
                          <div className="min-w-0">
                            <h3 className="font-[var(--font-bebas-neue)] text-[1.55rem] leading-none tracking-[0.02em] text-[#f0ede8] sm:text-[1.75rem] lg:text-[1.9rem]">
                              {project.title}
                            </h3>
                            <p className="mt-1.5 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.18em] text-[#f0ede8]/55 uppercase">
                              {project.category}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            className={[
                              "hidden h-7 w-7 shrink-0 items-center justify-center border sm:inline-flex",
                              shouldReduce ? "" : "transition-all duration-300",
                              isActive ? "border-[#f0ede8]/20 bg-[#f0ede8]/5 text-[#f0ede8]/70" : "border-transparent text-[#f0ede8]/20",
                            ].join(" ")}
                          >
                            <svg viewBox="0 0 11 11" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.3}>
                              <path d="M2 8.5 L8.5 2 M8.5 2 H3.5 M8.5 2 V7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          {/* progress + dots — below carousel, also driven by scroll */}
          <div className="mx-auto mt-6 flex w-full max-w-[1440px] items-center justify-between gap-6 px-6 sm:mt-8 sm:px-10 lg:px-[6vw]">
            <div className="flex items-center gap-3">
              <div className="h-px w-16 overflow-hidden bg-[#1a1a1a] sm:w-20">
                <motion.div
                  className="h-full bg-[#f0ede8]"
                  animate={{ width: `${((selectedIndex + 1) / PROJECTS.length) * 100}%` }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  aria-hidden="true"
                />
              </div>
              <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/35 sm:hidden">
                <span className="text-[#f0ede8] tabular-nums">{String(selectedIndex + 1).padStart(2, "0")}</span>
                <span className="mx-1 text-[#f0ede8]/15">/</span>04
              </span>
            </div>
            <div className="flex items-center gap-2" role="tablist" aria-label="Project navigation">
              {PROJECTS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === selectedIndex}
                  aria-label={`Go to project ${i + 1}`}
                  onClick={() => {
                    // allow direct jump via scroll — also scroll page to that segment
                    const el = sectionRef.current;
                    if (!el) return;
                    const rect = el.getBoundingClientRect();
                    const top = window.scrollY + rect.top;
                    const h = el.offsetHeight - window.innerHeight;
                    const target = top + (i / (PROJECTS.length - 1)) * h;
                    window.scrollTo({ top: target, behavior: "smooth" });
                  }}
                  className={[
                    "h-1 transition-all duration-300",
                    i === selectedIndex ? "w-6 bg-[#f0ede8]" : "w-3 bg-[#f0ede8]/15 hover:bg-[#f0ede8]/25",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
          <p className="mx-auto mt-4 w-full max-w-[1440px] px-6 text-center font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/20 sm:px-10 lg:px-[6vw]">
            Scroll to explore — projects change as you move
          </p>
        </div>
      </div>
    </section>
  );
}
