import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type Payload = {
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

const fmtINR = (paise: number) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(paise / 100)}`;
const fmtNum = (n: number) => new Intl.NumberFormat("en-IN").format(n);
const fmtDateIST = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(iso));
  } catch { return iso.slice(0, 10); }
};
const fmtDateTimeIST = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));
  } catch { return iso; }
};
const human = (s: string) => {
  const m: Record<string, string> = { pending: "Pending", confirmed: "Confirmed", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled", not_contacted: "Not contacted", converted: "Converted" };
  return m[s] || s;
};

const styles = StyleSheet.create({
  page: { padding: 28, paddingBottom: 36, fontFamily: "Helvetica", backgroundColor: "#ffffff", color: "#111111", fontSize: 7.5 },
  headerBar: { margin: -28, marginBottom: 16, paddingVertical: 10, paddingHorizontal: 28, backgroundColor: "#080808", color: "#f0ede8" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#f0ede8" },
  headerMeta: { fontSize: 6, color: "#a8a29a", textAlign: "right", lineHeight: 1.4 },
  headerSub: { marginTop: 4, fontSize: 6, color: "#c8c3bc", letterSpacing: 0.6 },
  title: { fontSize: 15, fontWeight: 700, color: "#121212", marginBottom: 4 },
  period: { fontSize: 8, color: "#4a4a4a", marginBottom: 6, lineHeight: 1.4 },
  disclaimer: { fontSize: 6, color: "#888888", lineHeight: 1.5, marginBottom: 10 },
  divider: { height: 0.6, backgroundColor: "#e5e5e5", marginVertical: 8 },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: "#121212", marginBottom: 2 },
  sectionRule: { width: 22, height: 1.4, backgroundColor: "#e63030", marginBottom: 6 },
  sectionSub: { fontSize: 6, color: "#777777", marginBottom: 6, lineHeight: 1.5 },
  // summary grid
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  card: { width: "48.7%", borderWidth: 0.7, borderColor: "#1f1f1f", backgroundColor: "#0e0e0e", padding: 8, marginBottom: 6 },
  cardAccent: { backgroundColor: "#111111", borderColor: "#2a2a2a" },
  cardLabel: { fontSize: 6, color: "#f0ede8", opacity: 0.55, letterSpacing: 0.8, textTransform: "uppercase" as const, marginBottom: 6 },
  cardValue: { fontSize: 13, fontWeight: 700, color: "#f0ede8", marginBottom: 4 },
  cardSub: { fontSize: 6, color: "#9a958f", lineHeight: 1.4 },
  // tables
  table: { borderWidth: 0.6, borderColor: "#dcdcdc", marginBottom: 12 },
  headRow: { flexDirection: "row", backgroundColor: "#0e0e0e" },
  headRowRed: { backgroundColor: "#e63030" },
  headRowBlue: { backgroundColor: "#1c3a5a" },
  headCell: { paddingVertical: 5, paddingHorizontal: 6, borderRightWidth: 0.4, borderRightColor: "#2a2a2a", justifyContent: "center" as const },
  headText: { fontSize: 6, fontWeight: 700, color: "#ffffff", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  headTextCenter: { textAlign: "center" as const },
  headTextRight: { textAlign: "right" as const },
  bodyRow: { flexDirection: "row", borderTopWidth: 0.4, borderTopColor: "#e6e6e6", minHeight: 16, alignItems: "stretch" as const },
  bodyRowAlt: { backgroundColor: "#f8f8f7" },
  bodyRowAltBlue: { backgroundColor: "#f0f4f8" },
  bodyCell: { paddingVertical: 5, paddingHorizontal: 6, borderRightWidth: 0.4, borderRightColor: "#ebebeb", justifyContent: "center" as const },
  bodyText: { fontSize: 6.5, color: "#222222", lineHeight: 1.35 },
  bodyTextBold: { fontWeight: 700 },
  bodyTextMuted: { color: "#777777" },
  bodyTextRight: { textAlign: "right" as const },
  bodyTextCenter: { textAlign: "center" as const },
  // small helper
  badgeRow: { flexDirection: "row", gap: 4, flexWrap: "wrap" as const },
  feeNote: { fontSize: 6, color: "#888888", marginTop: 4, lineHeight: 1.4 },
  footer: { position: "absolute" as const, left: 28, right: 28, bottom: 16, borderTopWidth: 0.4, borderTopColor: "#e0e0e0", paddingTop: 6, flexDirection: "row", justifyContent: "space-between" as const },
  footerText: { fontSize: 5.5, color: "#9a9a9a" },
  emptyText: { fontSize: 7, color: "#999999", padding: 8, textAlign: "center" as const },
});

function Header({ label }: { label: string }) {
  return (
    <View style={styles.headerBar} fixed>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.brand}>STLLR MEDIA</Text>
          <Text style={styles.headerSub}>CONTROL ROOM  ·  REPORT  ·  ESTIMATED REVENUE (services.basePrice / 100 INR)  ·  en-IN</Text>
        </View>
        <View>
          <Text style={styles.headerMeta}>Generated {fmtDateTimeIST(new Date().toISOString())} IST</Text>
          <Text style={styles.headerMeta}>Admin only  ·  createdAt IST</Text>
        </View>
      </View>
    </View>
  );
}

function Section({
  title,
  subtitle,
  children,
  breakable,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  breakable?: boolean;
}) {
  return (
    <View style={{ marginBottom: 10 }} wrap={breakable ? true : false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function SummaryGrid({ payload }: { payload: Payload }) {
  const s = payload.summary;
  return (
    <View style={styles.summaryGrid}>
      <View style={styles.card}><Text style={styles.cardLabel}>Realized — completed</Text><Text style={styles.cardValue}>{fmtINR(s.realizedPaise)}</Text><Text style={styles.cardSub}>{fmtNum(payload.byStatus.find(x => x.status === "completed")?.count ?? 0)} bookings</Text></View>
      <View style={[styles.card, styles.cardAccent]}><Text style={styles.cardLabel}>Pipeline — confirmed / in progress</Text><Text style={styles.cardValue}>{fmtINR(s.pipelinePaise)}</Text><Text style={styles.cardSub}>{fmtNum((payload.byStatus.find(x => x.status === "confirmed")?.count ?? 0) + (payload.byStatus.find(x => x.status === "in_progress")?.count ?? 0))} bookings</Text></View>
      <View style={styles.card}><Text style={styles.cardLabel}>Expected — pending</Text><Text style={styles.cardValue}>{fmtINR(s.expectedPaise)}</Text><Text style={styles.cardSub}>{fmtNum(payload.byStatus.find(x => x.status === "pending")?.count ?? 0)} bookings</Text></View>
      <View style={styles.card}><Text style={styles.cardLabel}>Total estimated</Text><Text style={styles.cardValue}>{fmtINR(s.totalEstimatedPaise)}</Text><Text style={styles.cardSub}>{fmtNum(s.totalBookings)} bookings · {fmtNum(s.cancelledCount)} cancelled</Text></View>
    </View>
  );
}

function SimpleTable({ head, headStyle, rows, colFlex }: { head: string[]; headStyle?: any; rows: (string | number)[][]; colFlex: number[] }) {
  const headerStyle = [styles.headRow, headStyle].filter(Boolean);
  return (
    <View style={styles.table}>
      <View style={headerStyle as any}>
        {head.map((h, i) => (
          <View key={i} style={[styles.headCell, { flex: colFlex[i] }, i === head.length - 1 ? { borderRightWidth: 0 } : null] as any}>
            <Text style={[styles.headText, (i === 1 && head.length === 3) ? styles.headTextCenter : null, i === head.length - 1 ? styles.headTextRight : null] as any}>{h}</Text>
          </View>
        ))}
      </View>
      {rows.length === 0 ? <Text style={styles.emptyText}>No data</Text> : rows.map((r, idx) => (
        <View key={idx} style={[styles.bodyRow, idx % 2 === 1 ? (headStyle === styles.headRowBlue ? styles.bodyRowAltBlue : styles.bodyRowAlt) : null] as any}>
          {r.map((cell, ci) => (
            <View key={ci} style={[styles.bodyCell, { flex: colFlex[ci] }, ci === r.length - 1 ? { borderRightWidth: 0 } : null] as any}>
              <Text style={[styles.bodyText, ci === 0 ? styles.bodyTextBold : null, ci === r.length - 1 ? styles.bodyTextRight : null, ci === 1 && head.length <= 3 ? styles.bodyTextCenter : null] as any}>{String(cell)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function ReportDocument({ data }: { data: Payload }) {
  const s = data.summary;
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Header label={data.period.label} />

        <Text style={styles.title}>Operational Report — Bookings & Leads</Text>
        <Text style={styles.period}>{data.period.label}</Text>
        <Text style={styles.disclaimer}>{data.meta.disclaimer}  ·  Filtered on createdAt (IST).  ·  Currency INR (en-IN, basePrice paise /100).</Text>
        <View style={styles.divider} />

        <Section title="Summary" subtitle={`Period ${data.period.from} to ${data.period.to} IST  ·  ${fmtNum(s.totalBookings)} bookings  ·  ${fmtNum(s.totalLeads)} leads  ·  filtered on createdAt`}>
          <SimpleTable head={["Metric", "Value", "Note"]} colFlex={[2.1, 1.3, 2.2]} rows={[
            ["Total bookings (in period)", fmtNum(s.totalBookings), `created ${data.period.from} → ${data.period.to}`],
            ["Realized — completed", fmtINR(s.realizedPaise), "status = completed"],
            ["Pipeline — confirmed + in progress", fmtINR(s.pipelinePaise), "status = confirmed, in_progress"],
            ["Expected — pending", fmtINR(s.expectedPaise), "status = pending"],
            ["Cancelled bookings", fmtNum(s.cancelledCount), "Rs. 0 — not counted in totals"],
            ["Total estimated revenue", fmtINR(s.totalEstimatedPaise), "realized + pipeline + expected"],
            ["Total leads (in period)", fmtNum(s.totalLeads), `created ${data.period.from} → ${data.period.to}`],
          ]} />
          <Text style={[styles.feeNote, { marginTop: 2 }]}>All revenue is estimated from services.basePrice (paise/100). No paid/final amounts stored yet.</Text>
        </Section>

        <Section title="Bookings — by status" subtitle="Cancelled shows — (Rs. 0) and is excluded from revenue totals.">
          <SimpleTable head={["Status", "Count", "Est. revenue (INR)"]} headStyle={styles.headRowRed} colFlex={[2.2, 0.8, 1.6]} rows={data.byStatus.map(r => [human(r.status), fmtNum(r.count), r.status === "cancelled" ? "—" : fmtINR(r.revenuePaise)])} />
        </Section>

        {data.byService.length > 0 && (
          <Section title="Bookings — by service" subtitle="Grouped by service name (Unknown service = missing FK).">
            <SimpleTable head={["Service", "Category", "Count", "Est. revenue"]} colFlex={[2.4, 1.2, 0.7, 1.3]} rows={data.byService.map(r => [r.serviceName, r.category || "—", fmtNum(r.count), fmtINR(r.revenuePaise)])} />
          </Section>
        )}

        {data.byCity.length > 0 && (
          <Section title="Bookings — by city">
            <SimpleTable head={["City", "Count", "Est. revenue"]} colFlex={[2.6, 0.8, 1.4]} rows={data.byCity.map(r => [r.city, fmtNum(r.count), fmtINR(r.revenuePaise)])} />
          </Section>
        )}

        {data.byStaff.length > 0 && (
          <Section title="Bookings — by staff assignment" subtitle="Unassigned = no staff linked. Revenue counted the same way.">
            <SimpleTable head={["Staff", "Count", "Est. revenue"]} colFlex={[2.6, 0.8, 1.4]} rows={data.byStaff.map(r => [r.staffName, fmtNum(r.count), fmtINR(r.revenuePaise)])} />
          </Section>
        )}

        <Section title="Leads — by status">
          <SimpleTable head={["Lead status", "Count"]} headStyle={styles.headRowBlue} colFlex={[3.8, 1]} rows={data.leadsByStatus.map(r => [human(r.status), fmtNum(r.count)])} />
        </Section>

        {data.leadsByType.length > 0 && (
          <Section title="Leads — by enquiry type">
            <SimpleTable head={["Enquiry type", "Count"]} headStyle={styles.headRowBlue} colFlex={[3.8, 1]} rows={data.leadsByType.map(r => [r.enquiryType, fmtNum(r.count)])} />
          </Section>
        )}

        <Section
          title={`Bookings — detailed  (${fmtNum(data.bookings.length)} records)`}
          subtitle={`All bookings where createdAt ∈ ${data.period.from} → ${data.period.to} IST, ordered by createdAt desc. Shoot date = bookingDate.`}
          breakable
        >
          {data.bookings.length === 0 ? <Text style={styles.emptyText}>No bookings in this period.</Text> : (
            <View style={[styles.table, { borderColor: "#0e0e0e" }]}>
              <View style={[styles.headRow, { backgroundColor: "#0e0e0e" }]}>
                {["Created", "Shoot", "Customer", "Service", "City", "Status", "Est. INR", "Staff"].map((h, i) => {
                  const flex = [0.85, 0.85, 1.55, 1.45, 0.85, 0.95, 1.1, 1.1][i];
                  return <View key={h} style={[styles.headCell, { flex }, { backgroundColor: "#0e0e0e" }] as any}><Text style={[styles.headText, { fontSize: 5.5, textAlign: i === 6 ? "right" as const : i <= 1 || i === 5 ? "center" as const : "left" as const }] as any}>{h}</Text></View>;
                })}
              </View>
              {data.bookings.map((b, idx) => (
                <View key={b.id} style={[styles.bodyRow, idx % 2 === 1 ? styles.bodyRowAlt : null] as any}>
                  <View style={[styles.bodyCell, { flex: 0.85 }] as any}><Text style={[styles.bodyText, styles.bodyTextCenter, { fontSize: 5.5 }] as any}>{fmtDateIST(b.createdAt)}</Text></View>
                  <View style={[styles.bodyCell, { flex: 0.85 }] as any}><Text style={[styles.bodyText, styles.bodyTextCenter, { fontSize: 5.5 }] as any}>{fmtDateIST(b.bookingDate)}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1.55 }] as any}><Text style={[styles.bodyText, styles.bodyTextBold, { fontSize: 5.5 }] as any}>{b.customerName}</Text><Text style={[styles.bodyText, styles.bodyTextMuted, { fontSize: 5 }] as any}>{b.customerEmail}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1.45 }] as any}><Text style={[styles.bodyText, { fontSize: 5.5 }] as any}>{b.serviceName}</Text></View>
                  <View style={[styles.bodyCell, { flex: 0.85 }] as any}><Text style={[styles.bodyText, { fontSize: 5.5 }] as any}>{b.city}</Text></View>
                  <View style={[styles.bodyCell, { flex: 0.95 }] as any}><Text style={[styles.bodyText, styles.bodyTextCenter, { fontSize: 5.5 }] as any}>{human(b.status)}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1.1 }] as any}><Text style={[styles.bodyText, styles.bodyTextRight, styles.bodyTextBold, { fontSize: 5.5 }] as any}>{b.status === "cancelled" ? "—" : fmtINR(b.basePricePaise)}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1.1, borderRightWidth: 0 }] as any}><Text style={[styles.bodyText, styles.bodyTextMuted, { fontSize: 5.5 }] as any}>{b.assignedStaffName || "—"}</Text></View>
                </View>
              ))}
            </View>
          )}
        </Section>

        <Section
          title={`Leads — detailed  (${fmtNum(data.leads.length)} records)`}
          subtitle={`All leads where createdAt ∈ ${data.period.from} → ${data.period.to} IST, ordered by createdAt desc.`}
          breakable
        >
          {data.leads.length === 0 ? <Text style={styles.emptyText}>No leads in this period.</Text> : (
            <View style={[styles.table, { borderColor: "#1c3a5a" }]}>
              <View style={[styles.headRow, styles.headRowBlue]}>
                {["Created", "Email", "Phone", "Type", "Status", "Staff"].map((h, i) => {
                  const flex = [0.9, 1.9, 1.1, 1.15, 0.95, 1][i];
                  return <View key={h} style={[styles.headCell, { flex }] as any}><Text style={[styles.headText, { fontSize: 5.5, textAlign: i === 0 || i === 4 ? "center" as const : "left" as const }] as any}>{h}</Text></View>;
                })}
              </View>
              {data.leads.map((l, idx) => (
                <View key={l.id} style={[styles.bodyRow, idx % 2 === 1 ? styles.bodyRowAltBlue : null] as any}>
                  <View style={[styles.bodyCell, { flex: 0.9 }] as any}><Text style={[styles.bodyText, styles.bodyTextCenter, { fontSize: 5.5 }] as any}>{fmtDateIST(l.createdAt)}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1.9 }] as any}><Text style={[styles.bodyText, styles.bodyTextBold, { fontSize: 5.5 }] as any} wrap>{l.email}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1.1 }] as any}><Text style={[styles.bodyText, { fontSize: 5.5 }] as any}>{l.phone}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1.15 }] as any}><Text style={[styles.bodyText, { fontSize: 5.5 }] as any}>{l.enquiryType}</Text></View>
                  <View style={[styles.bodyCell, { flex: 0.95 }] as any}><Text style={[styles.bodyText, styles.bodyTextCenter, { fontSize: 5.5 }] as any}>{human(l.status)}</Text></View>
                  <View style={[styles.bodyCell, { flex: 1, borderRightWidth: 0 }] as any}><Text style={[styles.bodyText, styles.bodyTextMuted, { fontSize: 5.5 }] as any}>{l.assignedStaffName || "—"}</Text></View>
                </View>
              ))}
            </View>
          )}
        </Section>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>STLLR Media — Operational Report — {data.period.label}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }: any) => `Page ${pageNumber} of ${totalPages}  ·  Estimated only — services.basePrice  ·  en-IN`} fixed />
        </View>
      </Page>
    </Document>
  );
}
