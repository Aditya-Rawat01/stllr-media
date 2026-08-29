import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
async function run(){
  const res = await fetch("https://api.clerk.com/v1/users", { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }});
  const data = await res.json() as any[];
  for (const u of data) {
    const clerkId = u.id;
    const email = u.email_addresses[0]?.email_address || "";
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || null;
    const avatarUrl = u.image_url || null;
    const role = (u.public_metadata as any)?.role === "admin" ? "admin" : "customer";
    console.log(`sync ${email} -> ${role}`);
    await db.insert(users).values({ clerkId, email, name, role: role as any, avatarUrl }).onConflictDoUpdate({ target: users.clerkId, set: { email, name, avatarUrl, role: role as any, updatedAt: new Date() } });
  }
  const rows = await db.select().from(users);
  console.log("done", rows.length, rows.map(r=>`${r.email}:${r.role}`));
}
run().then(()=>process.exit(0));
