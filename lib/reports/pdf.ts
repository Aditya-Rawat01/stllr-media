"use client";

import type { ComponentProps } from "react";

export type ReportPayload = {
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

// new proper engine: @react-pdf/renderer
export async function downloadReportPDF(payload: ReportPayload) {
  const [{ pdf }, { default: ReportDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./ReportDocument"),
  ]);
  const doc = (ReportDocument as any)({ data: payload });
  const blob = await (pdf as any)(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stllr-report-${payload.period.from}_to_${payload.period.to}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// keep sync shim for old callers (ReportModal) if they don't await
export function buildReportPDF(_payload: ReportPayload): never {
  throw new Error("buildReportPDF removed — use downloadReportPDF(payload) with @react-pdf/renderer");
}
