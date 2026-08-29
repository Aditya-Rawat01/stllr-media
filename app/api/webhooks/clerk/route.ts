import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;
    // evt.data contains Clerk user object
    const data: any = evt.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || "";
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
      const avatarUrl = data.image_url || null;
      const role = (data.public_metadata as any)?.role === "admin" ? "admin" : "customer";

      await db
        .insert(users)
        .values({ clerkId, email, name, role: role as any, avatarUrl })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: { email, name, avatarUrl, role: role as any, updatedAt: new Date() },
        });
    } else if (eventType === "user.deleted") {
      const clerkId = data.id;
      if (clerkId) await db.delete(users).where(eq(users.clerkId, clerkId));
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

export async function GET() {
  return Response.json({ status: "ok", hint: "POST Clerk webhook here" });
}
