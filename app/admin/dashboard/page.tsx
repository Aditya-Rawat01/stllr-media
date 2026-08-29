import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  try {
    await requireRole(["admin"]);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/?error=not_admin");
  }
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Control Room</h1>
      <p className="text-sm text-zinc-500">Only users with role=admin can see this. You are admin.</p>
      <ul className="mt-4 text-sm list-disc ml-6">
        <li>Leads - future /admin/dashboard/leads</li>
        <li>Bookings - /api/bookings</li>
        <li>Staff availability - getTeamAvailability tool</li>
      </ul>
    </div>
  );
}
