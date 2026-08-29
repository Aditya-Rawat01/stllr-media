# STLLR Media — PRD v0 (Backend-Only)

## 0. Brand (2026-08-29 update)
"We are more than pixel wranglers and shutterbugs. We are weavers of light and storytellers of the extraordinary. At Stllr Media, we see the unseen potential in every moment, the hidden masterpiece trapped within every fleeting emotion. With precision and passion, we wield the tools of modern artistry, to capture the perfect moments and ceasing them forever in our content. Where moments become art, and art becomes your legacy."
— **STLLR Media** — India's First Community of Top Behind-the-Camera Artists, Media Production New Delhi, 2-10 employees, 36 followers, `stllrmedia@gmail.com`. Works with **production houses, professional shoots, brands & big clients**. **Not a wedding studio** — Royal Wedding Udaipur retained as legacy portfolio only.

## 1. Vision
Production-house / brand media studio (New Delhi) — homepage (weavers-of-light story), gallery (brand campaigns, not weddings), contact, about/community, who we worked with (brands), upcoming productions, booking.

## 2. Full Feature List (9)
1. Support bot with MCP/README reads → **Aditya** — READ-only
2. Resend mail → Aditya
3. Contact form → lead stored in DB + email → Aditya
4. Login as admin/customer → Aditya (Clerk later)
5. Booking calendar → Aditya/Abhinav
6. Admin dashboard (leads/clients/ads) → Aditya/Abhinav
7. AI chat summarization → stored with leads → Aditya
8. Reports (daily/weekly/monthly) → Aditya
9. Admin control room (staff availability) → Abhinav

## 3. Scope v0 — Current Sprint (Pure Backend, No Frontend)
**Goal:** `POST /api/chat` SSE streaming, reads Neon DB Singapore, groq free tier, 4-5 demo chats.

**In:**
- Neon Postgres `ap-southeast-1` (`DB_URI` pooler, `sslmode=require`)
- Drizzle ORM + drizzle-kit (push now, generate migrations later)
- Groq `openai/gpt-oss-20b` (was `llama-3.1-8b-instant` deprecated 2026-08, qwen alt) via `@ai-sdk/groq` + `ai` SSE `toUIMessageStreamResponse` + `stepCountIs(5)` multi-step, Date→ISO fix for tool outputs
- 5 READ tools only: `getServices`, `getPortfolio`, `getUpcomingEvents`, `getTeamAvailability`, `searchKnowledgeBase` (`lib/ai/tools.ts:9`)
- Tables: `services`, `gallery_items`, `events`, `staff`, `faqs` (drizzle `lib/db/schema.ts:1`)
- Rate limit / zod validation, Clerk gate stub (`userId?` optional, enforced later)

**Out (deferred):**
- Booking logic (availability at 30m, 1h-4w window) — design in appendix, no code
- Writes: `bookings` INSERT, `leads` submit, chat persistence, summaries, reports, control-room writes
- Frontend widget, Resend, ads

## 4. Data Model v0
```
services(id, slug, name, category[photography|videography|editing|combo|drone], description, base_price, duration_mins, is_active)
gallery_items(id, title, category, tags[text[]], image_url, thumbnail_url, is_featured, event_id?)
events(id, title, slug, description, location, city, start_date, end_date, status[upcoming|ongoing|completed|cancelled], cover_image)
staff(id, name, role[photographer|videographer|editor|drone_operator|manager], is_active)
faqs(id, question, answer, category, keywords[text[]], is_published)
```
All `id uuid PK gen_random_uuid()`, `created_at timestamptz default now()`. GIN on `tags`, `keywords`. Indexes on `category`, `start_date`, `status`.

Appendix (deferred booking):
```
bookings(id, service_id, booking_date date, start_time time, end_time time, status, location)
// read: 30m slots 09:00-21:00, query window min 1h max 28d
```

## 5. API Contract (Implemented `app/api/chat/route.ts:20`, `app/api/health/db/route.ts:1`)
```
POST /api/chat?stream=true (default SSE)
Req: { messages: [{role:"user"|"assistant", content:string}] } also supports UIMessage {parts}
Res: SSE `text/event-stream` (ai SDK UIMessage stream) — reasoning+tool-input→tool-output→text-delta verified
POST /api/chat?stream=false -> {text, steps, toolCalls}
GET /api/chat -> {status:"ok", tools:[...], model:"openai/gpt-oss-20b"}
GET /api/health/db -> {ok:true, latencyMs, region:"ap-southeast-1"}
Errors: 400 zod, 429 rate-limit (10/min/IP in-memory), 500 missing GROQ_API_KEY
```

## 6. Prompt Guardrails (`lib/ai/prompt.ts:1`)
System: Stllr production-house voice (weavers of light...), cite tool data, never invent, READ-only, escalate to `stllrmedia@gmail.com` contact form. Explicitly not a wedding studio; Royal Wedding is legacy only.
Seed reflects this: 6 active services (Ad Film/TVC, Brand Campaign, Corporate Film, Music Video, Drone, Post) + 1 legacy inactive `wedding-cinematic`; events = Nike Mumbai, Netflix Delhi, Tech Summit, Fashion Week + legacy Royal Wedding; gallery = brand/production; faqs include "Do you do weddings? No" + "What does Stllr do?"

## 7. Open Questions
- Booking availability deferred — revisit 30m/week design before bookings table migration
- Ads/reports schema later

## 8. Decisions Log
- Singapore region (available) over Mumbai
- Groq free tier over OpenAI (MVP 4-5 chats)
- Drizzle `push` now → `generate` later for committed migrations
- Ponytail: minimal tables, fewest files
