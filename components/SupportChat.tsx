"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";

function legacyContent(message: unknown) {
  if (typeof message !== "object" || message === null || !("content" in message)) return null;
  const content = message.content;
  return typeof content === "string" ? content : null;
}

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useUser();

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  function handleOpen() {
    setOpen(true);
  }

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!isSignedIn) return;
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <>
      <style>{`
        @keyframes support-chat-drawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes support-chat-sheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* floating button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 rounded-full border border-[#f0ede8]/15 bg-[#f0ede8] px-5 py-3 font-[var(--font-dm-sans)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#080808] shadow-[0_14px_40px_rgba(0,0,0,0.45)] transition-colors hover:bg-white"
        aria-label="Open support chat"
      >
        STLLR Support
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
          {/* backdrop */}
          <div className="absolute inset-0 bg-[#080808]/70" onClick={() => setOpen(false)} />
          {/* modal */}
          <div className="relative flex h-[85vh] max-h-[90vh] w-full flex-col rounded-t-[6px] border border-[#1f1f1f] bg-[#080808] shadow-[0_18px_70px_rgba(0,0,0,0.65)] [animation:support-chat-sheet_220ms_var(--ease-smooth)] sm:h-full sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-y-0 sm:border-r-0 sm:[animation:support-chat-drawer_260ms_var(--ease-smooth)]">
            <div className="flex items-center justify-between border-b border-[#1f1f1f] px-4 py-3">
              <div>
                <p className="font-[var(--font-bebas-neue)] text-[1.35rem] leading-none tracking-[0.14em] text-[#f0ede8]">STLLR Support</p>
                <p className="mt-1 font-[var(--font-dm-sans)] text-[10px] uppercase tracking-[0.14em] text-[#f0ede8]/35">Weavers of light · stllrmedia@gmail.com</p>
              </div>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center border border-[#f0ede8]/10 text-[#f0ede8]/55 transition-colors hover:border-[#f0ede8]/25 hover:text-[#f0ede8] leading-none">✕</button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#0e0e0e] px-4 py-4">
              {!isSignedIn ? (
                <div className="space-y-3 pt-8 text-center font-[var(--font-dm-sans)] text-sm text-[#f0ede8]/60">
                  <p className="font-medium text-[#f0ede8]">Please sign in to get support</p>
                  <p className="text-xs leading-5 text-[#f0ede8]/45">Sign in to chat with our STLLR assistant about services, portfolio, and bookings.</p>
                  <SignInButton mode="modal">
                    <button className="mt-2 bg-[#f0ede8] px-5 py-2 font-[var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[0.18em] text-[#080808] hover:bg-white">Sign In</button>
                  </SignInButton>
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="pt-8 text-center font-[var(--font-dm-sans)] text-sm text-[#f0ede8]/45">
                      <p>Ask about services, portfolio, events, or policies.</p>
                      <p className="mt-2 text-xs text-[#f0ede8]/30">Try: “What do you do?” or “Show upcoming events”</p>
                    </div>
                  )}
                  {messages.map((m) => (
                    <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={`max-w-[80%] whitespace-pre-wrap break-words px-3 py-2 font-[var(--font-dm-sans)] text-sm leading-6 ${
                          m.role === "user" ? "bg-[#e63030] text-white" : "border border-[#1f1f1f] bg-[#080808] text-[#f0ede8]/75"
                        }`}
                      >
                        {m.parts.map((p, i) => {
                          if (p.type === "text") return <span key={i}>{String((p as any).text ?? "").replaceAll("**", "")}</span>;
                          if (p.type === "reasoning") return null;
                          if (p.type.startsWith("tool-")) return null;
                          return null;
                        })}
                        {m.parts.length === 0 ? (legacyContent(m) ? String(legacyContent(m)).replaceAll("**", "") : null) : null}
                      </div>
                    </div>
                  ))}
                  {isLoading && <p className="text-xs text-[#f0ede8]/35">… weaving response</p>}
                  {error && (
                    <div className="border border-[#e63030]/25 bg-[#e63030]/10 px-3 py-2 text-sm text-[#f0ede8]">
                      Please sign in to chat — <SignInButton mode="modal"><button className="underline">Sign In</button></SignInButton>
                    </div>
                  )}
                </>
              )}
            </div>

            <form onSubmit={onSend} className="flex gap-2 border-t border-[#1f1f1f] bg-[#080808] p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSignedIn ? "Ask something…" : "Please sign in to chat…"}
                className="min-w-0 flex-1 border border-[#1f1f1f] bg-[#0e0e0e] px-3 py-2 font-[var(--font-dm-sans)] text-sm text-[#f0ede8] outline-none placeholder:text-[#f0ede8]/25 focus:border-[#f0ede8]/25 disabled:opacity-50"
                disabled={isLoading || !isSignedIn}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !isSignedIn}
                className="bg-[#f0ede8] px-4 py-2 font-[var(--font-dm-sans)] text-[10px] font-medium uppercase tracking-[0.16em] text-[#080808] disabled:opacity-40"
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
