import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const u = await currentUser();
  // prefer DB role (synced via webhook), fallback to publicMetadata
  const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).then(r=>r[0]);
  const role = (dbUser?.role as string) || ((u?.publicMetadata as any)?.role as string) || "customer";
  return { clerkId: userId, email: u?.emailAddresses[0]?.emailAddress, name: u?.fullName, role, dbUser };
}

export async function requireRole(roles: ("admin"|"customer")[]) {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(u.role as any)) throw new Error(`FORBIDDEN: need ${roles.join(",")}, have ${u.role}`);
  return u;
}
