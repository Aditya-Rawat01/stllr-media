"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardSummary from "./DashboardSummary";
import ActiveClients, { type Client } from "./ActiveClients";
import Leads, { type Lead } from "./Leads";

// Separate fetching from presentation — hook-like fetcher
type DashboardData = {
  leads: Lead[];
  leadStats: { total: number; not_contacted: number; in_progress: number; converted: number };
  currentClients: Client[];
  adsMetrics: {
    totalSpent: number;
    currentBudget: number;
    roi: number;
    impressions: number;
    clicks: number;
    conversionRate: number;
  };
  adsAnalysis: {
    topPerformingChannels: { channel: string; spend: number; conversions: number }[];
    monthlyTrend: { month: string; spend: number; revenue: number }[];
    insights: string[];
  };
};

type ApiOk = { ok: true; data: DashboardData };
type ApiErr = { error: string; details?: string };

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard", { credentials: "include", cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as ApiOk & ApiErr & { data?: DashboardData };

      if (!res.ok) {
        const msg = (json as ApiErr).error || `Request failed ${res.status}`;
        const details = (json as ApiErr).details ? `: ${(json as ApiErr).details}` : "";
        throw new Error(msg + details);
      }
      if (!json.data) throw new Error("No dashboard data");
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStatusChange = useCallback(
    async (leadId: string, status: Lead["status"]) => {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leadId, status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Failed ${res.status}`);
      // optimistic local update + refetch
      setData((prev) =>
        prev
          ? {
              ...prev,
              leads: prev.leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
              leadStats: {
                total: prev.leads.length,
                not_contacted: prev.leads.filter((l) => (l.id === leadId ? status === "not_contacted" : l.status === "not_contacted")).length,
                in_progress: prev.leads.filter((l) => (l.id === leadId ? status === "in_progress" : l.status === "in_progress")).length,
                converted: prev.leads.filter((l) => (l.id === leadId ? status === "converted" : l.status === "converted")).length,
              },
            }
          : prev
      );
    },
    []
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-8 lg:px-10">
        <div className="border border-dashed border-[#1f1f1f] bg-[#0a0a0a]/40 p-10 text-center">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#f0ede8]/20 border-t-[#f0ede8]/60" aria-hidden="true" />
          <p className="mt-4 font-[var(--font-dm-sans)] text-[12px] tracking-[0.12em] text-[#f0ede8]/30 uppercase">Loading control room…</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuth = /UNAUTHENTICATED|FORBIDDEN|401|403/i.test(error);
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-10 sm:px-8 lg:px-10">
        <div className="border border-[#e63030]/20 bg-[#e63030]/5 p-6 sm:p-8">
          <p className="font-[var(--font-dm-sans)] text-[11px] tracking-[0.14em] text-[#e63030] uppercase">
            {isAuth ? "Access denied" : "Failed to load dashboard"}
          </p>
          <p className="mt-2 font-[var(--font-dm-sans)] text-[13px] leading-[1.6] text-[#f0ede8]/60">{error}</p>
          {isAuth && <p className="mt-3 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/30">This dashboard requires admin role. Sign in with an admin account via Clerk.</p>}
          <button
            onClick={fetchDashboard}
            className="mt-6 border border-[#f0ede8]/15 bg-[#f0ede8] px-5 py-2 font-[var(--font-dm-sans)] text-[11px] tracking-[0.12em] text-[#080808] hover:bg-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-8 sm:px-8 lg:px-10 lg:pt-10">
      {/* header — editorial but operational */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.2em] text-[#f0ede8]/25 uppercase">STLLR Media · Admin</p>
          <h1 className="mt-2 font-[var(--font-bebas-neue)] text-[2.2rem] leading-none tracking-[-0.01em] text-[#f0ede8] sm:text-[2.6rem]">Control Room</h1>
          <p className="mt-2 max-w-[520px] font-[var(--font-dm-sans)] text-[12px] leading-[1.6] text-[#f0ede8]/30">
            Live operational view — metrics, current work and enquiries from the existing APIs. No fake data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" aria-hidden="true" />
          <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/40 uppercase">Live</span>
          <button
            onClick={fetchDashboard}
            className="ml-3 border border-[#1f1f1f] bg-[#0e0e0e] px-3 py-1.5 font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/50 hover:border-[#f0ede8]/15 hover:text-[#f0ede8]"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW */}
      <div className="mt-8">
        <DashboardSummary
          leadStats={data.leadStats}
          activeClientCount={data.currentClients.length}
          adsMetrics={data.adsMetrics}
          insightsCount={data.adsAnalysis.insights.length}
        />
        {/* insights from adsAnalysis — if present, show compact */}
        {data.adsAnalysis.insights.length > 0 && (
          <div className="mt-4 border border-[#1a1a1a] bg-[#0a0a0a] p-4 sm:p-5">
            <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/25 uppercase">Available insights</p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {data.adsAnalysis.insights.map((ins) => (
                <li key={ins} className="flex gap-2 font-[var(--font-dm-sans)] text-[11px] leading-[1.5] text-[#f0ede8]/40">
                  <span className="mt-1 h-1 w-1 shrink-0 bg-[#f0ede8]/20" aria-hidden="true" />
                  {ins}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 2. ACTIVE CLIENTS */}
      <div className="mt-10 border-t border-[#1a1a1a] pt-8 sm:mt-12 sm:pt-10">
        <ActiveClients clients={data.currentClients} />
      </div>

      {/* 3. LEADS */}
      <div className="mt-10 border-t border-[#1a1a1a] pt-8 sm:mt-12 sm:pt-10">
        <Leads leads={data.leads} onStatusChange={handleStatusChange} />
      </div>

      {/* ads channels — secondary, from same API, not invented */}
      {data.adsAnalysis.topPerformingChannels.length > 0 && (
        <div className="mt-10 border border-[#1a1a1a] bg-[#0a0a0a] p-5 sm:p-6">
          <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/25 uppercase">Top performing channels</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.adsAnalysis.topPerformingChannels.map((ch) => (
              <div key={ch.channel} className="border border-[#1f1f1f] bg-[#0e0e0e] px-4 py-3">
                <p className="font-[var(--font-dm-sans)] text-[11px] font-medium tracking-[0.08em] text-[#f0ede8]">{ch.channel}</p>
                <p className="mt-1 font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/40">₹{ch.spend.toLocaleString("en-IN")} · {ch.conversions} conversions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-center font-[var(--font-dm-sans)] text-[10px] tracking-[0.12em] text-[#f0ede8]/15">
        Data from <code className="bg-[#111] px-1 py-0.5">GET /api/admin/dashboard</code> · Lead updates via <code className="bg-[#111] px-1 py-0.5">PATCH /api/admin/leads</code> · Bookings via <code className="bg-[#111] px-1 py-0.5">GET /api/bookings</code>
      </p>
    </div>
  );
}
