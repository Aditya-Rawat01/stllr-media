import { db } from "@/lib/db";
import { bookings, services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
async function run(){
  const svc = await db.select().from(services).where(eq(services.slug, "ad-film-tvc"));
  const svcId = svc[0]?.id;
  const svc2 = await db.select().from(services).where(eq(services.slug, "brand-campaign"));
  const svc2Id = svc2[0]?.id;
  await db.delete(bookings);
  const now = new Date();
  const d1 = new Date(now); d1.setDate(now.getDate()+3);
  const d2 = new Date(now); d2.setDate(now.getDate()+7);
  const d3 = new Date(now); d3.setDate(now.getDate()+12);
  const past = new Date(now); past.setDate(now.getDate()-5);
  await db.insert(bookings).values([
    { serviceId: svcId, customerEmail:"nike@brand.com", customerName:"Nike India", customerPhone:"+919876543210", bookingDate: d1, startTime:"09:00", endTime:"13:00", status:"confirmed", location:"Film City", city:"Mumbai", notes:"Brand campaign" },
    { serviceId: svc2Id, customerEmail:"netflix@prod.com", customerName:"Netflix India", customerPhone:"+919876543211", bookingDate: d2, startTime:"10:00", endTime:"18:00", status:"pending", location:"ND Studio", city:"Delhi", notes:"OTT unit" },
    { serviceId: svcId, customerEmail:"tech@corp.com", customerName:"Tech Corp", customerPhone:"+919876543212", bookingDate: d3, startTime:"09:00", endTime:"17:00", status:"confirmed", location:"NSIC Grounds", city:"Delhi", notes:"Summit" },
    { serviceId: svcId, customerEmail:"old@brand.com", customerName:"Old Brand", customerPhone:"+919876543213", bookingDate: past, startTime:"09:00", endTime:"11:00", status:"completed", location:"Studio", city:"Delhi", notes:"old" },
  ]);
  console.log("seeded bookings");
  process.exit(0);
}
run();
