import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export async function GET() {
  const t0 = Date.now();
  try {
    await db.execute(sql`select 1 as ok`);
    return Response.json({ ok: true, latencyMs: Date.now() - t0, region: "ap-southeast-1" });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
