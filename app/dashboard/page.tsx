import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  try {
    const u = await requireRole(["customer", "admin"]);
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        <p className="text-sm text-zinc-500">Hello {u.name || u.email} — role: {u.role} ✓</p>
        <p className="mt-4 text-sm">Your bookings will appear here. Admins also see <a href="/admin" className="underline">/admin</a>.</p>
      </div>
    );
  } catch {
    redirect("/sign-in");
  }
}
