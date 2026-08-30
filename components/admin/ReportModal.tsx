"use client";

import { useEffect, useMemo, useState } from "react";
import { downloadReportPDF } from "@/lib/reports/pdf";

type ReportPayload = {
  period: { from: string; to: string; label: string };
  summary: {
    totalBookings: number;
    totalLeads: number;
    realizedPaise: number;
    pipelinePaise: number;
    expectedPaise: number;
    cancelledCount: number;
    totalEstimatedPaise: number;
  };
  byStatus: { status: string; count: number; revenuePaise: number }[];
  byService: { serviceName: string; category: string | null; count: number; revenuePaise: number }[];
  byCity: { city: string; count: number; revenuePaise: number }[];
  byStaff: { staffName: string; count: number; revenuePaise: number }[];
  leadsByStatus: { status: string; count: number }[];
  leadsByType: { enquiryType: string; count: number }[];
  bookings: {
    id: string;
    customerName: string;
    customerEmail: string;
    city: string;
    status: string;
    serviceName: string;
    serviceCategory: string | null;
    basePricePaise: number;
    assignedStaffName: string | null;
    bookingDate: string;
    createdAt: string;
  }[];
  leads: {
    id: string;
    email: string;
    phone: string;
    enquiryType: string;
    enquiryDetails: string;
    status: string;
    assignedStaffName: string | null;
    createdAt: string;
  }[];
  meta: { disclaimer: string };
};

function fmtINR(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}
function fmtNum(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}
function fmtDateIST(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function currentMonthStr() {
  // YYYY-MM in IST
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return s.slice(0, 7);
}

export default function ReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"month" | "range">("month");
  const [month, setMonth] = useState<string>(() => currentMonthStr());
  const [from, setFrom] = useState<string>(() => {
    const ca = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    const y = ca.slice(0, 7);
    return `${y}-01`;
  });
  const [to, setTo] = useState<string>(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportPayload | null>(null);

  const query = useMemo(() => {
    if (mode === "month") return `month=${encodeURIComponent(month)}`;
    return `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  }, [mode, month, from, to]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?${query}`, { credentials: "include", cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ? `${json.error}${json.details ? `: ${json.details}` : ""}` : `Failed ${res.status}`);
      if (!json.ok) throw new Error(json.error || "No data");
      setData(json as ReportPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchReport();
    } else {
      setData(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // auto-fetch when query changes while open (debounce handled by user clicking Preview)
  // keyboard esc
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 px-3 py-6 backdrop-blur-[2px] sm:px-6" onClick={onClose} role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[980px] rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1a1a1a] px-5 py-4 sm:px-6">
          <div>
            <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.2em] text-[#f0ede8]/30 uppercase">STLLR Media · Report</p>
            <h2 className="mt-1 font-[var(--font-bebas-neue)] text-[1.7rem] leading-none tracking-[-0.01em] text-[#f0ede8]">Generate Report</h2>
            <p className="mt-1 max-w-[560px] font-[var(--font-dm-sans)] text-[11px] leading-[1.5] text-[#f0ede8]/30">Filtered on <code className="bg-[#111] px-1 py-0.5 text-[#f0ede8]/40">createdAt</code> (IST). Estimated revenue = <code className="bg-[#111] px-1 py-0.5 text-[#f0ede8]/40">services.basePrice /100</code>. Admin only.</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 border border-[#1f1f1f] bg-[#0e0e0e] text-[#f0ede8]/50 hover:border-[#f0ede8]/15 hover:text-[#f0ede8]">×</button>
        </div>

        {/* controls */}
        <div className="border-b border-[#1a1a1a] bg-[#0e0e0e]/60 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {(["month", "range"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={["border px-3 py-1.5 font-[var(--font-dm-sans)] text-[11px] tracking-[0.08em] uppercase", m === mode ? "border-[#e63030] bg-[#e63030] text-white" : "border-[#1f1f1f] bg-transparent text-[#f0ede8]/40 hover:border-[#f0ede8]/15 hover:text-[#f0ede8]/70"].join(" ")}
                >
                  {m === "month" ? "Entire month" : "Custom range"}
                </button>
              ))}
            </div>
            <span className="hidden h-6 w-px bg-[#1f1f1f] sm:inline-block" aria-hidden="true" />
            {mode === "month" ? (
              <label className="flex items-center gap-2 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/40">
                Month
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-1.5 text-[12px] text-[#f0ede8] outline-none focus:border-[#e63030]/50" />
              </label>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/40">
                  From
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-1.5 text-[12px] text-[#f0ede8] outline-none focus:border-[#e63030]/50" />
                </label>
                <label className="flex items-center gap-2 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/40">
                  To
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-1.5 text-[12px] text-[#f0ede8] outline-none focus:border-[#e63030]/50" />
                </label>
              </div>
            )}
            <button onClick={fetchReport} disabled={loading} className="ml-auto border border-[#f0ede8]/15 bg-[#f0ede8] px-4 py-1.5 font-[var(--font-dm-sans)] text-[11px] tracking-[0.12em] text-[#080808] hover:bg-white disabled:opacity-60">
              {loading ? "Loading…" : "Preview"}
            </button>
          </div>
          <p className="mt-3 font-[var(--font-dm-sans)] text-[10px] leading-[1.5] text-[#f0ede8]/20">Default {mode === "month" ? "current month" : "current month start → today"} (IST). Range uses <code className="bg-[#111] px-1 py-0.5">createdAt</code>, so you see both upcoming shoots and completed work created in that window.</p>
        </div>

        {/* body */}
        <div className="max-h-[62vh] overflow-y-auto px-5 py-5 sm:px-6">
          {loading && (
            <div className="border border-dashed border-[#1f1f1f] bg-[#0a0a0a]/40 p-10 text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#f0ede8]/20 border-t-[#f0ede8]/60" aria-hidden="true" />
              <p className="mt-3 font-[var(--font-dm-sans)] text-[11px] tracking-[0.12em] text-[#f0ede8]/30 uppercase">Building preview…</p>
            </div>
          )}
          {error && (
            <div className="border border-[#e63030]/20 bg-[#e63030]/5 p-4">
              <p className="font-[var(--font-dm-sans)] text-[11px] tracking-[0.12em] text-[#e63030] uppercase">Failed to load report</p>
              <p className="mt-2 font-[var(--font-dm-sans)] text-[12px] leading-[1.6] text-[#f0ede8]/60">{error}</p>
            </div>
          )}
          {!loading && !error && data && (
            <div className="space-y-6">
              {/* period label + disclaimer */}
              <div className="rounded-xl border border-[#1f1f1f] bg-[linear-gradient(180deg,#0e0e0e_0%,#0a0a0a_100%)] p-4">
                <p className="font-[var(--font-dm-sans)] text-[11px] tracking-[0.12em] text-[#f0ede8]/30 uppercase">Period</p>
                <p className="mt-1 font-[var(--font-dm-sans)] text-[13px] font-medium text-[#f0ede8]">{data.period.label}</p>
                <p className="mt-2 font-[var(--font-dm-sans)] text-[10px] leading-[1.5] text-[#f0ede8]/25">{data.meta.disclaimer} · Filtered on createdAt (IST) · en-IN · ₹ values from services.basePrice</p>
              </div>

              {/* summary cards */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <PreviewCard label="Realized — completed" value={fmtINR(data.summary.realizedPaise)} sub={`${data.byStatus.find((x) => x.status === "completed")?.count ?? 0} bookings`} />
                <PreviewCard label="Pipeline — confirmed / in progress" value={fmtINR(data.summary.pipelinePaise)} sub={`${(data.byStatus.find((x) => x.status === "confirmed")?.count ?? 0) + (data.byStatus.find((x) => x.status === "in_progress")?.count ?? 0)} bookings`} accent />
                <PreviewCard label="Expected — pending" value={fmtINR(data.summary.expectedPaise)} sub={`${data.byStatus.find((x) => x.status === "pending")?.count ?? 0} bookings`} />
                <PreviewCard label="Total estimated" value={fmtINR(data.summary.totalEstimatedPaise)} sub={`${data.summary.totalBookings} bookings · ${data.summary.cancelledCount} cancelled`} />
              </div>
              <div className="flex flex-wrap gap-2 border border-dashed border-[#1f1f1f] bg-[#0a0a0a]/50 px-4 py-3">
                <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/25 uppercase">Leads in period</span>
                <span className="font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/60 tabular-nums">{fmtNum(data.summary.totalLeads)} total · not contacted {data.leadsByStatus.find((x) => x.status === "not_contacted")?.count ?? 0} · in progress {data.leadsByStatus.find((x) => x.status === "in_progress")?.count ?? 0} · converted {data.leadsByStatus.find((x) => x.status === "converted")?.count ?? 0}</span>
              </div>

              {/* byStatus */}
              <div>
                <h3 className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">Bookings — by status</h3>
                <div className="mt-3 overflow-hidden border border-[#1f1f1f]">
                  <table className="w-full text-left">
                    <thead className="bg-[#e63030] text-white">
                      <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 text-right font-medium">Count</th>
                        <th className="px-3 py-2 text-right font-medium">Est. revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a] bg-[#0e0e0e] font-[var(--font-dm-sans)] text-[12px]">
                      {data.byStatus.map((r) => (
                        <tr key={r.status} className="text-[#f0ede8]/70">
                          <td className="px-3 py-2 capitalize">{r.status.replace("_", " ")}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{fmtNum(r.count)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{r.status === "cancelled" ? "—" : fmtINR(r.revenuePaise)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* byService + byCity + byStaff grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">By service</h3>
                  <div className="mt-3 overflow-hidden border border-[#1f1f1f]">
                    <table className="w-full text-left">
                      <thead className="bg-[#111] text-[#f0ede8]/50">
                        <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                          <th className="px-3 py-2 font-medium">Service</th>
                          <th className="px-3 py-2 text-right font-medium">Count</th>
                          <th className="px-3 py-2 text-right font-medium">Est.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1a1a] bg-[#0e0e0e] font-[var(--font-dm-sans)] text-[11px]">
                        {data.byService.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-[#f0ede8]/25">
                              No bookings
                            </td>
                          </tr>
                        ) : (
                          data.byService.map((r) => (
                            <tr key={r.serviceName} className="text-[#f0ede8]/60">
                              <td className="px-3 py-2">
                                <span className="text-[#f0ede8]">{r.serviceName}</span>
                                {r.category && <span className="ml-2 text-[10px] text-[#f0ede8]/25">{r.category}</span>}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums">{r.count}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{fmtINR(r.revenuePaise)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">By city</h3>
                  <div className="mt-3 overflow-hidden border border-[#1f1f1f]">
                    <table className="w-full text-left">
                      <thead className="bg-[#111] text-[#f0ede8]/50">
                        <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                          <th className="px-3 py-2 font-medium">City</th>
                          <th className="px-3 py-2 text-right font-medium">Count</th>
                          <th className="px-3 py-2 text-right font-medium">Est.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1a1a] bg-[#0e0e0e] font-[var(--font-dm-sans)] text-[11px]">
                        {data.byCity.map((r) => (
                          <tr key={r.city} className="text-[#f0ede8]/60">
                            <td className="px-3 py-2 text-[#f0ede8]">{r.city}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.count}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{fmtINR(r.revenuePaise)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <h3 className="mt-5 font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">By staff assignment</h3>
                  <div className="mt-3 overflow-hidden border border-[#1f1f1f]">
                    <table className="w-full text-left">
                      <thead className="bg-[#111] text-[#f0ede8]/50">
                        <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                          <th className="px-3 py-2 font-medium">Staff</th>
                          <th className="px-3 py-2 text-right font-medium">Count</th>
                          <th className="px-3 py-2 text-right font-medium">Est.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1a1a] bg-[#0e0e0e] font-[var(--font-dm-sans)] text-[11px]">
                        {data.byStaff.map((r) => (
                          <tr key={r.staffName} className="text-[#f0ede8]/60">
                            <td className="px-3 py-2">{r.staffName}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.count}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{fmtINR(r.revenuePaise)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* leads breakdown */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">Leads — by status</h3>
                  <div className="mt-3 overflow-hidden border border-[#1f1f1f]">
                    <table className="w-full text-left">
                      <thead className="bg-[#1c3a5a] text-white">
                        <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                          <th className="px-3 py-2 font-medium">Lead status</th>
                          <th className="px-3 py-2 text-right font-medium">Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1a1a] bg-[#0e0e0e] font-[var(--font-dm-sans)] text-[11px]">
                        {data.leadsByStatus.map((r) => (
                          <tr key={r.status} className="text-[#f0ede8]/60">
                            <td className="px-3 py-2 capitalize">{r.status.replace("_", " ")}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">Leads — by enquiry type</h3>
                  <div className="mt-3 overflow-hidden border border-[#1f1f1f]">
                    <table className="w-full text-left">
                      <thead className="bg-[#1c3a5a] text-white">
                        <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                          <th className="px-3 py-2 font-medium">Enquiry type</th>
                          <th className="px-3 py-2 text-right font-medium">Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1a1a1a] bg-[#0e0e0e] font-[var(--font-dm-sans)] text-[11px]">
                        {data.leadsByType.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="px-3 py-6 text-center text-[#f0ede8]/25">
                              No leads in period
                            </td>
                          </tr>
                        ) : (
                          data.leadsByType.map((r) => (
                            <tr key={r.enquiryType} className="text-[#f0ede8]/60">
                              <td className="px-3 py-2">{r.enquiryType}</td>
                              <td className="px-3 py-2 text-right tabular-nums">{r.count}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* detailed tables */}
              <div>
                <h3 className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">Bookings — detailed ({data.bookings.length})</h3>
                <p className="mt-1 font-[var(--font-dm-sans)] text-[10px] text-[#f0ede8]/20">Sorted by createdAt desc, filtered on createdAt. Booking date shown is shoot date.</p>
                <div className="mt-3 max-h-[320px] overflow-auto border border-[#1f1f1f]">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="sticky top-0 bg-[#0e0e0e] text-[#f0ede8]/40">
                      <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                        <th className="px-3 py-2">Created</th>
                        <th className="px-3 py-2">Shoot</th>
                        <th className="px-3 py-2">Customer</th>
                        <th className="px-3 py-2">Service</th>
                        <th className="px-3 py-2">City</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Est. INR</th>
                        <th className="px-3 py-2">Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a] bg-[#0a0a0a] font-[var(--font-dm-sans)] text-[11px]">
                      {data.bookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-[#f0ede8]/25">
                            No bookings created in this period.
                          </td>
                        </tr>
                      ) : (
                        data.bookings.map((b) => (
                          <tr key={b.id} className="text-[#f0ede8]/60">
                            <td className="px-3 py-2 tabular-nums">{fmtDateIST(b.createdAt)}</td>
                            <td className="px-3 py-2 tabular-nums">{fmtDateIST(b.bookingDate)}</td>
                            <td className="px-3 py-2">
                              <span className="text-[#f0ede8]">{b.customerName}</span>
                              <span className="block text-[10px] text-[#f0ede8]/25">{b.customerEmail}</span>
                            </td>
                            <td className="px-3 py-2">{b.serviceName}</td>
                            <td className="px-3 py-2">{b.city}</td>
                            <td className="px-3 py-2 capitalize">{b.status.replace("_", " ")}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{b.status === "cancelled" ? "—" : fmtINR(b.basePricePaise)}</td>
                            <td className="px-3 py-2">{b.assignedStaffName || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">Leads — detailed ({data.leads.length})</h3>
                <div className="mt-3 max-h-[300px] overflow-auto border border-[#1f1f1f]">
                  <table className="w-full min-w-[640px] text-left">
                    <thead className="sticky top-0 bg-[#0e0e0e] text-[#f0ede8]/40">
                      <tr className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.08em] uppercase">
                        <th className="px-3 py-2">Created</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Staff</th>
                        <th className="px-3 py-2">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a1a] bg-[#0a0a0a] font-[var(--font-dm-sans)] text-[11px]">
                      {data.leads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-8 text-center text-[#f0ede8]/25">
                            No leads created in this period.
                          </td>
                        </tr>
                      ) : (
                        data.leads.map((l) => (
                          <tr key={l.id} className="text-[#f0ede8]/60">
                            <td className="px-3 py-2 tabular-nums">{fmtDateIST(l.createdAt)}</td>
                            <td className="px-3 py-2">
                              <span className="text-[#f0ede8]">{l.email}</span>
                              <span className="block text-[10px] text-[#f0ede8]/25">{l.phone}</span>
                            </td>
                            <td className="px-3 py-2">{l.enquiryType}</td>
                            <td className="px-3 py-2 capitalize">{l.status.replace("_", " ")}</td>
                            <td className="px-3 py-2">{l.assignedStaffName || "—"}</td>
                            <td className="max-w-[260px] truncate px-3 py-2 text-[#f0ede8]/40" title={l.enquiryDetails}>
                              {l.enquiryDetails}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1a1a1a] bg-[#0e0e0e]/60 px-5 py-4 sm:px-6">
          <p className="font-[var(--font-dm-sans)] text-[10px] leading-[1.5] text-[#f0ede8]/20">PDF includes all sections above — summary, by service/city/staff, leads, and detailed tables.</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="border border-[#1f1f1f] bg-transparent px-4 py-2 font-[var(--font-dm-sans)] text-[11px] tracking-[0.08em] text-[#f0ede8]/50 hover:border-[#f0ede8]/15 hover:text-[#f0ede8]">
              Close
            </button>
            <button
              disabled={!data || loading}
              onClick={async () => {
                if (!data) return;
                try {
                  await downloadReportPDF(data);
                } catch (e) {
                  console.error(e);
                  alert(e instanceof Error ? e.message : String(e));
                }
              }}
              className="border border-[#e63030] bg-[#e63030] px-5 py-2 font-[var(--font-dm-sans)] text-[11px] tracking-[0.12em] text-white uppercase hover:bg-[#c92525] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={["flex flex-col justify-between border p-4", accent ? "border-[#f0ede8]/10 bg-[#111]" : "border-[#1a1a1a] bg-[#0e0e0e]"].join(" ")}>
      <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/30 uppercase">{label}</p>
      <p className="mt-3 font-[var(--font-bebas-neue)] text-[1.6rem] leading-none tracking-[-0.01em] text-[#f0ede8]">{value}</p>
      {sub && <p className="mt-2 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/30">{sub}</p>}
    </div>
  );
}
