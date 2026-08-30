import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#080808]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-[6vw]">
        {/* main grid */}
        <div className="grid grid-cols-1 gap-10 py-10 sm:gap-12 sm:py-12 lg:grid-cols-[1.2fr_0.8fr_0.9fr] lg:gap-12 lg:py-14">
          {/* brand */}
          <div className="min-w-0">
            <Link href="/" className="inline-flex flex-col leading-none" aria-label="STLLR Media home">
              <span className="font-[var(--font-bebas-neue)] text-[1.85rem] tracking-[0.18em] text-[#f0ede8]">
                STLLR<sup className="ml-0.5 align-super font-[var(--font-dm-sans)] text-[0.32em]">®</sup>
              </span>
              <span className="mt-1 font-[var(--font-dm-sans)] text-[7px] font-medium tracking-[0.52em] text-[#f0ede8]/50">MEDIA</span>
            </Link>
            <p className="mt-4 max-w-[320px] font-[var(--font-dm-sans)] text-[13px] leading-[1.7] text-[#f0ede8]/35">
              Weavers of light — India’s first community of top behind-the-camera artists. Photography · Videography · Content Production.
            </p>
            <p className="mt-4 font-[var(--font-dm-sans)] text-[11px] tracking-[0.04em] text-[#f0ede8]/25">
              New Delhi, India · stllrmedia@gmail.com
            </p>
          </div>

          {/* navigation */}
          <div className="min-w-0">
            <p className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] text-[#f0ede8]/30 uppercase">Explore</p>
            <nav className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5 sm:gap-x-10" aria-label="Footer navigation">
              {[
                { label: "Work", href: "/#work" },
                { label: "About", href: "/#about" },
                { label: "Services", href: "/#services" },
                { label: "Events", href: "/events" },
                { label: "Gallery", href: "/gallery" },
                { label: "Contact", href: "/#contact" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="font-[var(--font-dm-sans)] text-[13px] tracking-[0.04em] text-[#f0ede8]/50 transition-colors hover:text-[#f0ede8]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* social */}
          <div className="min-w-0 lg:text-right">
            <p className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.2em] text-[#f0ede8]/30 uppercase">Connect</p>
            <div className="mt-4 flex flex-wrap gap-3 lg:justify-end">
              <a
                href="https://www.linkedin.com/company/stllr-media"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#1f1f1f] bg-[#0e0e0e] px-4 py-2 font-[var(--font-dm-sans)] text-[11px] tracking-[0.1em] text-[#f0ede8]/60 transition-colors hover:border-[#f0ede8]/15 hover:text-[#f0ede8]"
                aria-label="STLLR Media on LinkedIn"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center bg-[#f0ede8] text-[9px] font-bold leading-none text-[#080808]">in</span>
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/stllr_media/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#1f1f1f] bg-[#0e0e0e] px-4 py-2 font-[var(--font-dm-sans)] text-[11px] tracking-[0.1em] text-[#f0ede8]/60 transition-colors hover:border-[#f0ede8]/15 hover:text-[#f0ede8]"
                aria-label="STLLR Media on Instagram"
              >
                <svg viewBox="0 0 12 12" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden="true">
                  <rect x="1.5" y="1.5" width="9" height="9" rx="2.2" />
                  <circle cx="6" cy="6" r="2.2" />
                  <circle cx="9" cy="3" r="0.7" fill="currentColor" stroke="none" />
                </svg>
                Instagram
              </a>
            </div>
            <a
              href="mailto:stllrmedia@gmail.com"
              className="mt-3 inline-block font-[var(--font-dm-sans)] text-[12px] tracking-[0.02em] text-[#f0ede8]/35 underline decoration-[#f0ede8]/15 underline-offset-4 hover:text-[#f0ede8]/60 hover:decoration-[#f0ede8]/25"
            >
              stllrmedia@gmail.com
            </a>
          </div>
        </div>

        {/* bottom bar — founders + copyright */}
        <div className="flex flex-col gap-3 border-t border-[#1a1a1a] py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] text-[#f0ede8]/20">
            <span className="tracking-[0.14em] text-[#f0ede8]/25 uppercase">Founders</span>
            <a
              href="https://www.instagram.com/anshbhatia._/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f0ede8]/40"
            >
              Ansh Bhatia @anshbhatia._
            </a>
            <span className="h-3 w-px bg-[#1f1f1f]" aria-hidden="true" />
            <a
              href="https://www.instagram.com/perfectmidtones/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#f0ede8]/40"
            >
              Perfect Midtones @perfectmidtones
            </a>
          </div>
          <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] text-[#f0ede8]/15">
            © {new Date().getFullYear()} STLLR Media · New Delhi · All frames crafted with intent.
          </p>
        </div>
      </div>
    </footer>
  );
}
