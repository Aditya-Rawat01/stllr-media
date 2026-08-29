"use client";

type Props = {
  leadStats: { total: number; not_contacted: number; in_progress: number; converted: number };
  activeClientCount: number;
  adsMetrics: {
    totalSpent: number;
    currentBudget: number;
    roi: number;
    impressions: number;
    clicks: number;
    conversionRate: number;
  };
  insightsCount: number;
};

function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function fmtNum(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "relative flex flex-col justify-between border bg-[#0e0e0e] p-5 sm:p-6",
        accent ? "border-[#f0ede8]/10" : "border-[#1a1a1a]",
      ].join(" ")}
    >
      <p className="font-[var(--font-dm-sans)] text-[10px] font-medium tracking-[0.18em] text-[#f0ede8]/35 uppercase">{label}</p>
      <p className="mt-4 font-[var(--font-bebas-neue)] text-[2.1rem] leading-none tracking-[-0.01em] text-[#f0ede8] sm:text-[2.4rem]">{value}</p>
      {sub && <p className="mt-2 font-[var(--font-dm-sans)] text-[11px] leading-[1.5] text-[#f0ede8]/35">{sub}</p>}
    </div>
  );
}

export default function DashboardSummary({ leadStats, activeClientCount, adsMetrics, insightsCount }: Props) {
  // Derived: active leads = not_contacted + in_progress (needs attention)
  const needsAttention = leadStats.not_contacted + leadStats.in_progress;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-[var(--font-bebas-neue)] text-[1.7rem] tracking-[-0.01em] text-[#f0ede8] sm:text-[1.9rem]">Overview</h2>
        <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/20">STLLR CONTROL ROOM</span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricCard label="Active Clients" value={fmtNum(activeClientCount)} sub={`${activeClientCount === 0 ? "No active bookings (confirmed / in progress)" : "Confirmed / in progress bookings"}`} />
        <MetricCard label="Active Leads" value={fmtNum(leadStats.total)} sub={`${needsAttention} need attention · ${leadStats.converted} converted`} accent />
        <MetricCard label="Ads Spent" value={fmtINR(adsMetrics.totalSpent)} sub={`Budget ${fmtINR(adsMetrics.currentBudget)} · ROI ${adsMetrics.roi}%`} />
        <MetricCard label="Insights" value={fmtNum(insightsCount)} sub={`${fmtNum(adsMetrics.impressions)} impressions · ${fmtNum(adsMetrics.clicks)} clicks`} />
      </div>

      {/* secondary row: breakdown */}
      <div className="mt-3 grid grid-cols-3 gap-3 sm:gap-4">
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 sm:px-5">
          <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/25 uppercase">Not contacted</p>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[13px] font-medium text-[#f0ede8]/70 tabular-nums">{leadStats.not_contacted}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 sm:px-5">
          <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/25 uppercase">In progress</p>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[13px] font-medium text-[#e8c24a] tabular-nums">{leadStats.in_progress}</p>
        </div>
        <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-3 sm:px-5">
          <p className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/25 uppercase">Converted</p>
          <p className="mt-1 font-[var(--font-dm-sans)] text-[13px] font-medium text-[#4ade80] tabular-nums">{leadStats.converted}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border border-dashed border-[#1f1f1f] bg-[#0a0a0a]/50 px-4 py-3 sm:px-5">
        <span className="font-[var(--font-dm-sans)] text-[10px] tracking-[0.14em] text-[#f0ede8]/25 uppercase">Conversion</span>
        <span className="font-[var(--font-dm-sans)] text-[11px] text-[#f0ede8]/50 tabular-nums">
          {adsMetrics.conversionRate}% · {fmtNum(adsMetrics.clicks)} clicks from {fmtNum(adsMetrics.impressions)} impressions
        </span>
      </div>
    </div>
  );
}
