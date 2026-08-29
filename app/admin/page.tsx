import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  try {
    await requireRole(["admin"]);
  } catch (e: any) {
    if (e.message === "UNAUTHENTICATED") redirect("/sign-in");
    // customer → homepage with message (no UI link, route only)
    redirect("/?error=not_admin");
  }
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Admin Control Room</h1>
      <p className="text-sm text-zinc-500">Only users with role=admin (Clerk publicMetadata) can see this. You are admin ✓</p>
      <ul className="mt-4 text-sm list-disc ml-6">
        <li>Leads → future /admin/leads</li>
        <li>Bookings → /api/bookings</li>
        <li>Staff availability → getTeamAvailability tool</li>
      </ul>
    </div>
  );
}
