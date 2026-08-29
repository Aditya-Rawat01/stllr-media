"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Work",     href: "#work" },
  { label: "About",    href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Events",   href: "#events" },
  { label: "Booking",  href: "#booking" },
  { label: "Contact",  href: "#contact" },
];

/*
  NAVBAR_H — exported so Hero can use the exact same value for its
  padding-top offset. Keep these in sync.
*/
export const NAVBAR_H = 86; /* px */

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Header ───────────────────────────────────────────────
          Solid background so hero text never shows through / mixes
          behind the nav. Subtle border + shadow for separation.
      ─────────────────────────────────────────────────────────── */}
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "bg-[#080808] border-[#1e1e1e] shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
            : "bg-[#080808] border-[#1a1a1a]",
        ].join(" ")}
        style={{ height: NAVBAR_H }}
      >
        <nav className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-[5.5vw]">

          {/* Logo */}
          <Link
            href="/"
            className="flex flex-shrink-0 flex-col items-center leading-none text-[#f0ede8]"
            aria-label="STLLR Media home"
          >
            <span className="font-[var(--font-bebas-neue)] text-[1.7rem] tracking-[0.18em]">STLLR<sup className="ml-0.5 align-super font-[var(--font-dm-sans)] text-[0.34em]">®</sup></span>
            <span className="mt-1 font-[var(--font-dm-sans)] text-[7px] font-medium tracking-[0.52em]">MEDIA</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8 lg:gap-12 xl:gap-[4.2rem]">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="group relative text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#f0ede8]/55 transition-colors duration-200 hover:text-[#f0ede8]"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#e63030] transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Enquire + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="#contact"
              className="hidden md:inline-flex items-center gap-2 border border-[#f0ede8]/30 px-[18px] py-[9px] text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#f0ede8] transition-all duration-300 hover:bg-[#f0ede8] hover:text-[#080808] hover:border-[#f0ede8]"
            >
              Enquire
              <svg viewBox="0 0 11 11" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path d="M1 10 L10 1 M10 1 H4 M10 1 V7" />
              </svg>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[5px]"
            >
              <span className={["block h-px w-[22px] bg-[#f0ede8] origin-center transition-all duration-300", menuOpen ? "translate-y-[6px] rotate-45"   : ""].join(" ")} />
              <span className={["block h-px w-[22px] bg-[#f0ede8] transition-all duration-300",               menuOpen ? "opacity-0 scale-x-0"            : ""].join(" ")} />
              <span className={["block h-px w-[22px] bg-[#f0ede8] origin-center transition-all duration-300", menuOpen ? "-translate-y-[6px] -rotate-45" : ""].join(" ")} />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile menu overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mob-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 flex flex-col bg-[#080808] md:hidden"
          >
            <div style={{ height: NAVBAR_H }} className="flex-shrink-0" />

            <div className="flex flex-1 flex-col justify-between px-6 pb-10 pt-6">
              <ul className="flex flex-col">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.05, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b border-[#1f1f1f] py-[18px] font-[var(--font-bebas-neue)] text-[2rem] tracking-wide text-[#f0ede8]/70 transition-colors hover:text-[#f0ede8]"
                    >
                      {link.label}
                      <svg viewBox="0 0 11 11" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={1.2} className="opacity-25" aria-hidden="true">
                        <path d="M1 10 L10 1 M10 1 H4 M10 1 V7" />
                      </svg>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="#contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 border border-[#f0ede8]/25 py-4 text-[11px] font-medium tracking-[0.2em] uppercase text-[#f0ede8] transition-all hover:bg-[#f0ede8] hover:text-[#080808]"
                >
                  Enquire
                  <svg viewBox="0 0 11 11" width={10} height={10} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path d="M1 10 L10 1 M10 1 H4 M10 1 V7" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
