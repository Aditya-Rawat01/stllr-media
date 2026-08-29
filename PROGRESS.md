# Progress — STLLR Media

## Current: v0 Backend-Only (Ponytail full)

### Done
- 2026-08-29 14:30: Repo verified Next 16.3.3 ap-southeast-1 Neon, PRD v0 written
- 2026-08-29 15:20: Drizzle `push --force` + `generate` → `drizzle/0000_cool_toad.sql` committed, 5 tables (services, events, gallery_items, staff, faqs) Singapore
- 2026-08-29 15:25: Seed 30 rows (6 services, 4 events, 6 gallery, 7 staff, 5 faqs) via `lib/db/seed.ts:1`
- 2026-08-29 15:30: `lib/ai/tools.ts:9` 5 READ tools + `lib/ai/provider.ts:1` groq `openai/gpt-oss-20b` (llama deprecated) + `app/api/chat/route.ts:20` SSE `streamText` + `stepCountIs(5)` + `GET /api/health/db`
- 2026-08-29 15:35: Verified: `npx tsc --noEmit` clean, `next build` ok, 5 chats: wedding services, portfolio, cancellation, upcoming events, team availability — SSE `text-delta` after `tool-output-available` confirmed
- Fixed: Date serialization bug (tool outputs `createdAt/startDate` Date→ISO) caused `AI_InvalidPromptError` on SSE second step, fixed in `lib/ai/tools.ts:27,37,54`

### Doing
- [x] All v0 — ready for Clerk gating

### Next
- Booking availability (deferred appendix PRD.md) — 30m 09-21, 1h-28d window
- Clerk auth gate on `/api/chat` (verify `auth()` before `getModel`)
- Leads/contact form + Resend + summarization

### Decisions
- DB_URI pooler Singapore — `.env` fixed `DB_URI =` → `DB_URI=` for Next env parsing
- No booking tool in v0 (ponytail YAGNI)
- Minimal tables — skip bookings/leads/chat until needed
- Drizzle: `push --force` for speed, `generate` for `drizzle/*.sql` audit (good migrations, commitment-able, rollback via Neon branch)

### How to Test v0
```bash
npx drizzle-kit push --force
DB_URI="..." npx tsx lib/db/seed.ts
npm run dev
curl http://localhost:3000/api/health/db              # {"ok":true}
curl http://localhost:3000/api/chat                   # {tools:[...]}
curl -s "http://localhost:3000/api/chat?stream=false" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"What services for a wedding?"}]}' | jq .text
curl -N http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Show upcoming events"}]}' # SSE with tool-output → text-delta
# 5 chats: wedding, cancellation, portfolio, upcoming, team
```

### Drizzle Migrations — Answer
Yes, good: `drizzle-kit generate` → `drizzle/0000_*.sql` + `meta/_journal.json` committed; `migrate` applies. See `drizzle/0000_cool_toad.sql:1` (ponytail: `push` now, `generate` before production)
