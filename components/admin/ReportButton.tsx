"use client";

import { useState } from "react";
import ReportModal from "./ReportModal";

export default function ReportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-[#e63030]/30 bg-[#e63030]/10 px-3.5 py-1.5 font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.12em] text-[#f0ede8] uppercase transition-colors hover:border-[#e63030]/50 hover:bg-[#e63030]/20"
      >
        <span className="hidden sm:inline">Generate</span> Report
      </button>
      <ReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
