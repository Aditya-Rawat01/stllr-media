import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminDashboardPage() {
  try {
    await requireRole(["admin"]);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHENTICATED") redirect("/sign-in");
    redirect("/?error=not_admin");
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <AdminDashboard />
    </div>
  );
}
