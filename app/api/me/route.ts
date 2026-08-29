import { getCurrentUser } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const u = await getCurrentUser();
  if (!u) return Response.json({ authenticated: false }, { status: 401 });
  return Response.json({ authenticated: true, clerkId: u.clerkId, email: u.email, role: u.role });
}
