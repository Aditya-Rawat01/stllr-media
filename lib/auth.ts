import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { return null; }
  if (!userId) return null;
  const u = await currentUser().catch(() => null);
  let dbUser: any = null;
  try { dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).then(r=>r[0]); } catch { dbUser = null; }
  // ponytail: fallback auto-create if webhook missed (localhost dev without public URL)
  if (!dbUser && u) {
    const email = u.emailAddresses[0]?.emailAddress || "";
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.fullName || null;
    const avatarUrl = u.imageUrl || null;
    const role = ((u.publicMetadata as any)?.role as string) === "admin" ? "admin" : "customer";
    try {
      const rows = await db.insert(users).values({ clerkId: userId, email, name, role: role as any, avatarUrl }).onConflictDoUpdate({ target: users.clerkId, set: { email, name, avatarUrl, role: role as any, updatedAt: new Date() } }).returning();
      dbUser = rows[0];
    } catch {}
  }
  const role = (dbUser?.role as string) || ((u?.publicMetadata as any)?.role as string) || "customer";
  return { clerkId: userId, email: u?.emailAddresses[0]?.emailAddress, name: u?.fullName, role, dbUser };
}

export async function requireRole(roles: ("admin"|"customer")[]) {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(u.role as any)) throw new Error(`FORBIDDEN: need ${roles.join(",")}, have ${u.role}`);
  return u;
}
