import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { getModel } from "@/lib/ai/provider";
import { chatTools } from "@/lib/ai/tools";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";

export const runtime = "nodejs";
export const maxDuration = 30;

// GET = health/tools list (ponytail: one route, two verbs)
export async function GET() {
  return Response.json({
    status: "ok",
    model: process.env.AI_MODEL || "openai/gpt-oss-20b",
    tools: Object.keys(chatTools),
    streaming: true,
    note: "POST {messages:[{role,content}]} for SSE",
  });
}

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0)
    return Response.json({ error: "messages[] required" }, { status: 400 });

  // basic rate limit: 10 req / min per IP (in-memory)
  // ponytail: global map, upgrade to Redis if needed
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  (globalThis as any)._rl ??= new Map<string, number[]>();
  const m: Map<string, number[]> = (globalThis as any)._rl;
  const arr = (m.get(ip) || []).filter(t => now - t < 60_000);
  if (arr.length >= 10) return Response.json({ error: "Rate limited, try in 60s" }, { status: 429 });
  arr.push(now); m.set(ip, arr);

  let model;
  try { model = getModel(); } catch (e: any) {
    return Response.json({ error: e.message, hint: "Add GROQ_API_KEY to .env, get free at console.groq.com" }, { status: 500 });
  }

  // support both UIMessage {parts} and simple {role,content}
  const isUIMessage = messages[0]?.parts !== undefined;
  const modelMessages = isUIMessage ? await convertToModelMessages(messages) : messages;

  // non-stream fallback: ?stream=false
  const url = new URL(req.url);
  if (url.searchParams.get("stream") === "false") {
    const { generateText } = await import("ai");
    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: chatTools,
      stopWhen: stepCountIs(5),
    });
    return Response.json({ text: result.text, steps: (result as any).steps?.length, toolCalls: (result as any).toolCalls });
  }

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: chatTools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
