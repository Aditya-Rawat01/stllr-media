import { createGroq } from "@ai-sdk/groq";

export function getModel() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY in .env — add GROQ_API_KEY=gsk_... for live AI");
  const groq = createGroq({ apiKey: key });
  const name = process.env.AI_MODEL || "openai/gpt-oss-20b";
  return groq(name);
}
