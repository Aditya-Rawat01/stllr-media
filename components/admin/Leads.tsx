"use client";

import { useState } from "react";

export type Lead = {
  id: string;
  email: string;
  phone: string;
  enquiryType: string;
  enquiryDetails: string;
  status: "not_contacted" | "in_progress" | "converted";
  createdAt: string;
};

const STATUS_META: Record<Lead["status"], { label: string; dot: string; badge: string }> = {
  not_contacted: {
    label: "Not contacted",
    dot: "bg-[#f0ede8]/30",
    badge: "border-[#f0ede8]/15 bg-[#f0ede8]/5 text-[#f0ede8]/60",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-[#e8c24a]",
    badge: "border-[#e8c24a]/20 bg-[#e8c24a]/10 text-[#e8c24a]",
  },
  converted: {
    label: "Converted",
    dot: "bg-[#4ade80]",
    badge: "border-[#4ade80]/20 bg-[#4ade80]/10 text-[#4ade80]",
  },
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function LeadCard({
  lead,
  onStatusChange,
}: {
  lead: Lead;
  onStatusChange: (id: string, next: Lead["status"]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const meta = STATUS_META[lead.status] ?? STATUS_META.not_contacted;

  const handleStatus = async (next: Lead["status"]) => {
    if (next === lead.status || updating) return;
    setUpdating(true);
    try {
      await onStatusChange(lead.id, next);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={[
        "group flex cursor-pointer flex-col border bg-[#0e0e0e] p-4 transition-colors sm:p-5",
        open ? "border-[#f0ede8]/12" : "border-[#1a1a1a] hover:border-[#1f1f1f]",
      ].join(" ")}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={["h-2 w-2 shrink-0 rounded-full", meta.dot].join(" ")} aria-hidden="true" />
            <span className={["inline-flex border px-2 py-0.5 font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase", meta.badge].join(" ")}>
              {meta.label}
            </span>
            <span className="hidden font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] text-[#f0ede8]/15 sm:inline">· {lead.enquiryType}</span>
          </div>
          <p className="mt-2 truncate font-[var(--font-dm-sans)] text-[13px] font-medium text-[#f0ede8]">{lead.email}</p>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[11px] tracking-[0.04em] text-[#f0ede8]/35">{lead.phone}</p>
          <p className="mt-2 line-clamp-2 font-[var(--font-dm-sans)] text-[12px] leading-[1.5] text-[#f0ede8]/35 sm:hidden">{lead.enquiryDetails}</p>
          <p className="mt-1 hidden font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] text-[#f0ede8]/20 sm:block">{formatDate(lead.createdAt)}</p>
        </div>
        <span className="hidden h-7 w-7 shrink-0 items-center justify-center border border-[#1f1f1f] text-[#f0ede8]/20 group-hover:text-[#f0ede8]/40 sm:inline-flex">
          {open ? "−" : "+"}
        </span>
      </div>

      {/* desktop excerpt */}
      <p className="mt-3 hidden line-clamp-2 font-[var(--font-dm-sans)] text-[12px] leading-[1.6] text-[#f0ede8]/30 sm:block">{lead.enquiryDetails}</p>

      {open && (
        <div className="mt-4 border-t border-dashed border-[#1f1f1f] pt-4" onClick={(e) => e.stopPropagation()}>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/25 uppercase">Enquiry details</dt>
              <dd className="mt-1 whitespace-pre-wrap font-[var(--font-dm-sans)] text-[13px] leading-[1.6] text-[#f0ede8]/70">{lead.enquiryDetails}</dd>
            </div>
            <div>
              <dt className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/25 uppercase">Enquiry type</dt>
              <dd className="mt-1 font-[var(--font-dm-sans)] text-[12px] text-[#f0ede8]/50">{lead.enquiryType}</dd>
            </div>
            <div>
              <dt className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/25 uppercase">Date</dt>
              <dd className="mt-1 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/35">{formatDate(lead.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["not_contacted", "in_progress", "converted"] as const).map((s) => {
              const active = s === lead.status;
              return (
                <button
                  key={s}
                  disabled={active || updating}
                  onClick={() => handleStatus(s)}
                  className={[
                    "border px-3 py-1.5 font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase transition-colors",
                    active
                      ? "cursor-default border-[#f0ede8]/20 bg-[#f0ede8] text-[#080808]"
                      : "border-[#1f1f1f] bg-transparent text-[#f0ede8]/40 hover:border-[#f0ede8]/15 hover:text-[#f0ede8]/70 disabled:opacity-60",
                  ].join(" ")}
                >
                  {STATUS_META[s].label} {updating && active ? "…" : ""}
                </button>
              );
            })}
          </div>
          <p className="mt-3 font-[var(--font-dm-sans)] text-[10px] leading-[1.5] text-[#f0ede8]/20">
            Status values are exact from backend — not invented. Updating via <code className="bg-[#111] px-1 py-0.5">PATCH /api/admin/leads</code>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Leads({
  leads,
  onStatusChange,
}: {
  leads: Lead[];
  onStatusChange: (id: string, next: Lead["status"]) => Promise<void>;
}) {
  const notContacted = leads.filter((l) => l.status === "not_contacted").length;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-[var(--font-bebas-neue)] text-[1.55rem] tracking-[-0.01em] text-[#f0ede8]">Leads — Enquiries</h2>
        <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/20">
          {leads.length} total · {notContacted} need attention
        </span>
      </div>
      <p className="mt-2 max-w-[560px] font-[var(--font-dm-sans)] text-[12px] leading-[1.6] text-[#f0ede8]/30">
        Who is asking, what they need, and what stage it’s in. Tap to read the full enquiry and move status.
      </p>

      {leads.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#1f1f1f] bg-[#0a0a0a]/40 px-6 py-10 text-center">
          <p className="font-[var(--font-dm-sans)] text-[13px] text-[#f0ede8]/40">No leads yet</p>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/20">Enquiries via POST /api/contact will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((l) => (
            <LeadCard key={l.id} lead={l} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
