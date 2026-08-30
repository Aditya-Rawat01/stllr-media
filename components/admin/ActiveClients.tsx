"use client";

import { useState } from "react";

export type Client = {
  id: string;
  name: string | null;
  email: string;
  city: string | null;
  service: string | null;
  bookingDate: string;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
};

const MAX_VISIBLE_CLIENTS = 10;

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return iso.slice(0, 10);
  }
}

function ClientCard({ client }: { client: Client }) {
  const [open, setOpen] = useState(false);
  const initial = (client.name?.trim()?.[0] || client.email[0] || "?").toUpperCase();

  return (
    <div
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
      className={[
        "group flex cursor-pointer flex-col rounded-xl border bg-[#0f0f0f] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-200 sm:p-5",
        open ? "border-[#f0ede8]/20 bg-[#111111]" : "border-[#1b1b1b] hover:-translate-y-0.5 hover:border-[#e63030]/40 hover:bg-[#111111]",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#e63030]/30 bg-[#1a1a1a] font-[var(--font-bebas-neue)] text-[14px] tracking-[0.04em] text-[#f0ede8]">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-[var(--font-dm-sans)] text-[13px] font-medium leading-none text-[#f0ede8] sm:text-[14px]">
            {client.name || "—"}
          </p>
          <p className="mt-1 truncate font-[var(--font-dm-sans)] text-[11px] tracking-[0.04em] text-[#f0ede8]/40">{client.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {client.service && (
              <span className="border border-[#e63030]/20 bg-[#e63030]/5 px-2 py-1 font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] text-[#f0ede8]/70 uppercase">
                {client.service}
              </span>
            )}
            {client.city && (
              <span className="border border-[#1f1f1f] bg-transparent px-2 py-1 font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] text-[#f0ede8]/30 uppercase">
                {client.city}
              </span>
            )}
          </div>
        </div>
        <span
          className={[
            "hidden h-7 w-7 shrink-0 items-center justify-center border text-[10px] transition-colors sm:inline-flex",
            open ? "border-[#f0ede8]/20 bg-[#f0ede8] text-[#080808]" : "border-[#1f1f1f] text-[#f0ede8]/25 group-hover:text-[#f0ede8]/60",
          ].join(" ")}
          aria-hidden="true"
        >
          {open ? "−" : "+"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#1a1a1a] pt-3">
        <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/25 uppercase">Booking</span>
        <span className="font-[var(--font-dm-sans)] text-[11px] tracking-[0.04em] text-[#f0ede8]/70 tabular-nums">{formatDate(client.bookingDate)}</span>
      </div>

      {open && (
        <div className="mt-3 border-t border-dashed border-[#1f1f1f] pt-3">
          <dl className="grid grid-cols-2 gap-3 font-[var(--font-dm-sans)] text-[11px] leading-[1.5]">
            <div>
              <dt className="tracking-[0.12em] text-[#f0ede8]/25 uppercase">Email</dt>
              <dd className="mt-1 break-all text-[#f0ede8]/60">{client.email}</dd>
            </div>
            <div>
              <dt className="tracking-[0.12em] text-[#f0ede8]/25 uppercase">Service</dt>
              <dd className="mt-1 text-[#f0ede8]/60">{client.service ?? "—"}</dd>
            </div>
            <div>
              <dt className="tracking-[0.12em] text-[#f0ede8]/25 uppercase">Location</dt>
              <dd className="mt-1 text-[#f0ede8]/60">{client.city ?? "—"}</dd>
            </div>
            <div>
              <dt className="tracking-[0.12em] text-[#f0ede8]/25 uppercase">Status</dt>
              <dd className="mt-1 inline-flex border border-[#1f8a4a]/20 bg-[#1f8a4a]/10 px-2 py-0.5 text-[10px] tracking-[0.08em] text-[#4ade80] uppercase">Active</dd>
            </div>
          </dl>
          <p className="mt-3 font-[var(--font-dm-sans)] text-[10px] leading-[1.6] text-[#f0ede8]/20">
            Connected to booking/calendar system · Manage dates and assignments in bookings.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ActiveClients({ clients }: { clients: Client[] }) {
  const [showAll, setShowAll] = useState(false);
  const visibleClients = showAll ? clients : clients.slice(0, MAX_VISIBLE_CLIENTS);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-[var(--font-bebas-neue)] text-[1.55rem] tracking-[-0.01em] text-[#f0ede8]">Active Clients — Current Work</h2>
        <span className="hidden font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/20 sm:inline">
          {clients.length} active · confirmed / in progress
        </span>
      </div>
      <p className="mt-2 max-w-[560px] font-[var(--font-dm-sans)] text-[12px] leading-[1.6] text-[#f0ede8]/30">
        Who we’re working with, what’s next, and when it’s happening. Linked to bookings — dates and services reflect the calendar.
      </p>

      {clients.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#1f1f1f] bg-[#0a0a0a]/40 px-6 py-10 text-center">
          <p className="font-[var(--font-dm-sans)] text-[13px] text-[#f0ede8]/40">No active clients</p>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/20">Confirmed or in-progress bookings will appear here.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleClients.map((c) => (
              <ClientCard key={`${c.email}-${c.bookingDate}`} client={c} />
            ))}
          </div>

          {clients.length > MAX_VISIBLE_CLIENTS && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="border border-[#e63030]/35 bg-[#e63030]/5 px-4 py-2 font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8] uppercase transition-colors hover:border-[#e63030]/50 hover:bg-[#e63030]/10"
              >
                {showAll ? "Show less" : `Show all (${clients.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
