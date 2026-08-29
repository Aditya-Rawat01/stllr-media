import "dotenv/config";
import { db } from "./index";
import { services, events, galleryItems, staff, faqs } from "./schema";

async function seed() {
  console.log("seeding (production-house)...");

  await db.delete(faqs);
  await db.delete(galleryItems);
  await db.delete(staff);
  await db.delete(events);
  await db.delete(services);

  await db.insert(services).values([
    { slug: "ad-film-tvc", name: "Ad Film / TVC", category: "videography", description: "High-impact ad films for brands — concept to final grade, 4K, 1-2 day shoot", basePrice: 15000000, durationMins: 480, displayOrder: 1 },
    { slug: "brand-campaign", name: "Brand Campaign", category: "combo", description: "Still + motion campaign for launches — art direction, talent, studio/location", basePrice: 12000000, durationMins: 480, displayOrder: 2 },
    { slug: "corporate-film", name: "Corporate & Event Film", category: "videography", description: "Conferences, launches, corporate stories — multi-cam, live", basePrice: 7000000, durationMins: 480, displayOrder: 3 },
    { slug: "music-video", name: "Music Video / Content", category: "videography", description: "Narrative + performance, lights, choreography ready", basePrice: 9000000, durationMins: 600, displayOrder: 4 },
    { slug: "drone-aerial", name: "Drone Aerial", category: "drone", description: "DGCA licensed 4K aerials for films, ads, events", basePrice: 1500000, durationMins: 120, displayOrder: 5 },
    { slug: "post-production", name: "Post-Production", category: "editing", description: "Edit, color, VFX, sound — modern artistry pipeline", basePrice: 2000000, durationMins: 0, displayOrder: 6 },
    // legacy — keep but not pitched as core, ponytail: inactive so bot de-prioritizes unless explicitly asked
    { slug: "wedding-cinematic", name: "Wedding Cinematic (Legacy)", category: "videography", description: "Legacy showcase — Royal Wedding Udaipur", basePrice: 8500000, durationMins: 600, displayOrder: 99, isActive: false },
  ]);

  const ev = await db.insert(events).values([
    { title: "Royal Wedding — Udaipur (Legacy)", slug: "royal-wedding-udaipur", description: "Legacy 3-day destination wedding at Taj — retained as masterpiece showcase", location: "Taj Lake Palace", city: "Udaipur", startDate: new Date("2026-09-20T10:00:00Z"), endDate: new Date("2026-09-22T22:00:00Z"), status: "upcoming", coverImage: "https://picsum.photos/seed/udaipur/600/400" },
    { title: "Nike Campaign — Mumbai", slug: "nike-mumbai", description: "Brand campaign shoot for production house", location: "Film City", city: "Mumbai", startDate: new Date("2026-09-12T09:00:00Z"), endDate: new Date("2026-09-13T19:00:00Z"), status: "upcoming", coverImage: "https://picsum.photos/seed/nike/600/400" },
    { title: "Netflix Original — Delhi", slug: "netflix-delhi", description: "Behind-the-camera unit for OTT production", location: "ND Studio", city: "Delhi", startDate: new Date("2026-10-05T09:00:00Z"), endDate: new Date("2026-10-07T18:00:00Z"), status: "upcoming", coverImage: "https://picsum.photos/seed/netflix/600/400" },
    { title: "Tech Summit — Delhi", slug: "tech-summit-delhi", description: "Corporate summit coverage", location: "NSIC Grounds", city: "Delhi", startDate: new Date("2026-10-10T09:00:00Z"), endDate: new Date("2026-10-10T18:00:00Z"), status: "upcoming", coverImage: "https://picsum.photos/seed/delhi/600/400" },
    { title: "Fashion Week — Mumbai", slug: "fashion-week-mumbai", description: "Runway + backstage for brand", location: "Jio World", city: "Mumbai", startDate: new Date("2026-09-10T16:00:00Z"), endDate: new Date("2026-09-12T22:00:00Z"), status: "upcoming", coverImage: "https://picsum.photos/seed/mumbai/600/400" },
  ]).returning();

  await db.insert(galleryItems).values([
    { title: "Nike — Light Weaver", category: "brand", tags: ["brand","campaign","mumbai","light"], imageUrl: "https://picsum.photos/seed/nike1/800/600", thumbnailUrl: "https://picsum.photos/seed/nike1/200/150", isFeatured: true },
    { title: "Netflix Unit — Delhi Set", category: "production", tags: ["production","netflix","delhi","behind"], imageUrl: "https://picsum.photos/seed/netflix1/800/600", isFeatured: true },
    { title: "Udaipur Palace Dusk (Legacy)", category: "legacy", tags: ["legacy","palace","wedding"], imageUrl: "https://picsum.photos/seed/g1/800/600", thumbnailUrl: "https://picsum.photos/seed/g1/200/150", isFeatured: false, eventId: ev[0].id },
    { title: "Mumbai Runway — Brand", category: "fashion", tags: ["fashion","runway","brand"], imageUrl: "https://picsum.photos/seed/g3/800/600", isFeatured: true },
    { title: "Drone Fort Aerial", category: "drone", tags: ["drone","aerial","fort"], imageUrl: "https://picsum.photos/seed/g5/800/600", isFeatured: true },
    { title: "Corporate Summit Stage", category: "corporate", tags: ["corporate","stage","delhi"], imageUrl: "https://picsum.photos/seed/g2/800/600", isFeatured: false },
  ]);

  await db.insert(staff).values([
    { name: "Aman", role: "photographer", isActive: true },
    { name: "Neha", role: "photographer", isActive: true },
    { name: "Rohit", role: "videographer", isActive: true },
    { name: "Sara", role: "videographer", isActive: true },
    { name: "Kabir", role: "editor", isActive: true },
    { name: "Vikram", role: "drone_operator", isActive: true },
    { name: "Priya", role: "manager", isActive: true },
  ]);

  await db.insert(faqs).values([
    { question: "What does Stllr Media do?", answer: "We are India's First Community of Top Behind-the-Camera Artists — media production for brands, production houses, big clients. We weave light and tell extraordinary stories: ad films, brand campaigns, corporate films, music videos, drone.", category: "about", keywords: ["stllr","about","who","production"], isPublished: true },
    { question: "Do you do weddings?", answer: "We are not a wedding studio. Royal Wedding Udaipur is a legacy showcase only. We focus on production houses and brands.", category: "policy", keywords: ["wedding","royal","legacy"], isPublished: true },
    { question: "What is cancellation policy?", answer: "Free cancellation up to 7 days before shoot, 50% refund 3-7 days, no refund <3 days.", category: "policy", keywords: ["cancel","refund","policy"], isPublished: true },
    { question: "How long for delivery?", answer: "Photos 10-14 days, films 21-30 days, rush in 7 days at 20% extra.", category: "delivery", keywords: ["delivery","timeline"], isPublished: true },
    { question: "Contact info?", answer: "Email stllrmedia@gmail.com, New Delhi studio (behind-the-camera community).", category: "contact", keywords: ["contact","email","stllr"], isPublished: true },
  ]);

  console.log("seed done production-house");
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
