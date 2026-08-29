"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <>
      {/* floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-black text-white px-5 py-3 text-sm font-medium shadow-lg hover:bg-zinc-800 dark:bg-white dark:text-black"
        aria-label="Open support chat"
      >
        Support
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          {/* modal */}
          <div className="relative bg-white dark:bg-zinc-900 w-full sm:max-w-[420px] sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col h-[85vh] sm:h-[520px] max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-zinc-800">
              <div>
                <p className="font-semibold text-sm">STLLR Support</p>
                <p className="text-xs text-zinc-500">Weavers of light • stllrmedia@gmail.com</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">✕</button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-zinc-50 dark:bg-zinc-900">
              {messages.length === 0 && (
                <div className="text-sm text-zinc-500 pt-8 text-center">
                  <p>Ask about services, portfolio, events, or policies.</p>
                  <p className="mt-2 text-xs">Try: “What do you do?” or “Show upcoming events”</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                      m.role === "user" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-800 border dark:border-zinc-700"
                    }`}
                  >
                    {m.parts.map((p, i) => {
                      if (p.type === "text") return <span key={i}>{p.text}</span>;
                      if (p.type === "reasoning") return null; // hide reasoning
                      if (p.type.startsWith("tool-")) return null; // hide raw tool json, text will contain answer
                      // @ts-ignore
                      return null;
                    })}
                    {/* fallback if parts empty and text exists */}
                    {/* @ts-ignore */}
                    {m.parts.length === 0 && (m as any).content ? (m as any).content : null}
                  </div>
                </div>
              ))}
              {isLoading && <p className="text-xs text-zinc-400">… weaving response</p>}
            </div>

            <form onSubmit={onSend} className="p-3 border-t dark:border-zinc-800 flex gap-2 bg-white dark:bg-zinc-900 sm:rounded-b-2xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something…"
                className="flex-1 rounded-full border px-3 py-2 text-sm outline-none dark:bg-zinc-800 dark:border-zinc-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-full bg-black text-white px-4 py-2 text-sm font-medium disabled:opacity-40 dark:bg-white dark:text-black"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
