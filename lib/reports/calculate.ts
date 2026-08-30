export type BookingRow = {
  id: string;
  status: string;
  basePrice: number | null; // paise
  serviceName: string | null;
  serviceCategory: string | null;
  city: string | null;
  customerName: string | null;
  assignedStaffName: string | null;
  bookingDate: Date | string;
  createdAt: Date | string;
};

export type LeadRow = {
  id: string;
  status: string;
  enquiryType: string;
  createdAt: Date | string;
};

export function calcReport(bookings: BookingRow[], leads: LeadRow[]) {
  // revenue splits based on status using basePrice (paise)
  let realized = 0;
  let pipeline = 0;
  let expected = 0;
  let cancelledCount = 0;
  let totalEstimated = 0;

  const byStatusMap = new Map<string, { count: number; revenue: number }>();
  const byServiceMap = new Map<string, { count: number; revenue: number; category: string | null }>();
  const byCityMap = new Map<string, { count: number; revenue: number }>();
  const byStaffMap = new Map<string, { count: number; revenue: number }>();

  for (const b of bookings) {
    const price = typeof b.basePrice === "number" ? b.basePrice : 0;
    const status = b.status;
    // count byStatus
    const s = byStatusMap.get(status) || { count: 0, revenue: 0 };
    s.count += 1;
    if (status !== "cancelled") s.revenue += price;
    byStatusMap.set(status, s);

    // revenue buckets
    if (status === "completed") {
      realized += price;
      totalEstimated += price;
    } else if (status === "confirmed" || status === "in_progress") {
      pipeline += price;
      totalEstimated += price;
    } else if (status === "pending") {
      expected += price;
      totalEstimated += price;
    } else if (status === "cancelled") {
      cancelledCount += 1;
    }

    // byService
    const svcKey = b.serviceName || "Unknown service";
    const svc = byServiceMap.get(svcKey) || { count: 0, revenue: 0, category: b.serviceCategory || null };
    svc.count += 1;
    if (status !== "cancelled") svc.revenue += price;
    if (!svc.category && b.serviceCategory) svc.category = b.serviceCategory;
    byServiceMap.set(svcKey, svc);

    // byCity
    const cityKey = b.city || "Unknown";
    const city = byCityMap.get(cityKey) || { count: 0, revenue: 0 };
    city.count += 1;
    if (status !== "cancelled") city.revenue += price;
    byCityMap.set(cityKey, city);

    // byStaff
    const staffKey = b.assignedStaffName || "Unassigned";
    const st = byStaffMap.get(staffKey) || { count: 0, revenue: 0 };
    st.count += 1;
    if (status !== "cancelled") st.revenue += price;
    byStaffMap.set(staffKey, st);
  }

  // normalize all 5 statuses for stable table
  const allStatuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"] as const;
  const byStatus = allStatuses.map((k) => {
    const v = byStatusMap.get(k) || { count: 0, revenue: 0 };
    return { status: k, count: v.count, revenuePaise: v.revenue };
  });

  const byService = Array.from(byServiceMap.entries())
    .map(([name, v]) => ({ serviceName: name, category: v.category, count: v.count, revenuePaise: v.revenue }))
    .sort((a, b) => b.revenuePaise - a.revenuePaise);

  const byCity = Array.from(byCityMap.entries())
    .map(([city, v]) => ({ city, count: v.count, revenuePaise: v.revenue }))
    .sort((a, b) => b.revenuePaise - a.revenuePaise);

  const byStaff = Array.from(byStaffMap.entries())
    .map(([name, v]) => ({ staffName: name, count: v.count, revenuePaise: v.revenue }))
    .sort((a, b) => b.revenuePaise - a.revenuePaise);

  const leadByStatusMap = new Map<string, number>();
  const leadByTypeMap = new Map<string, number>();
  for (const l of leads) {
    leadByStatusMap.set(l.status, (leadByStatusMap.get(l.status) || 0) + 1);
    leadByTypeMap.set(l.enquiryType, (leadByTypeMap.get(l.enquiryType) || 0) + 1);
  }
  const leadStatuses = ["not_contacted", "in_progress", "converted"] as const;
  const leadsByStatus = leadStatuses.map((k) => ({ status: k, count: leadByStatusMap.get(k) || 0 }));
  const leadsByType = Array.from(leadByTypeMap.entries())
    .map(([enquiryType, count]) => ({ enquiryType, count }))
    .sort((a, b) => b.count - a.count);

  return {
    summary: {
      totalBookings: bookings.length,
      totalLeads: leads.length,
      realizedPaise: realized,
      pipelinePaise: pipeline,
      expectedPaise: expected,
      cancelledCount,
      totalEstimatedPaise: totalEstimated,
    },
    byStatus,
    byService,
    byCity,
    byStaff,
    leadsByStatus,
    leadsByType,
  };
}

export function paiseToINR(paise: number) {
  return paise / 100;
}

export function fmtINRPaise(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}
