"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AgentIntent, AgentLink } from "@lumina/shared";

interface Message {
  role: "user" | "agent";
  text: string;
  links?: AgentLink[];
  intent?: AgentIntent;
}

interface AgentStatus {
  engine: "gemini";
  model: string;
  network: string;
  configured: boolean;
}

interface AgentReply {
  text?: string;
  links?: AgentLink[];
  intent?: AgentIntent;
  error?: string;
}

export function AgentChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "Copilot online. I answer from the real strategy catalog and live on-chain data — no invented numbers. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then((s: AgentStatus) => setStatus(s))
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function ask(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    const history: Message[] = [...messages, { role: "user", text }];
    setMessages(history);
    setInput("");
    setThinking(true);
    // Small delay so the typing indicator is visible and the reply feels like an agent.
    await new Promise((r) => setTimeout(r, 450));
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const reply = (await res.json()) as AgentReply;
      if (!res.ok || reply.error || !reply.text) {
        setMessages((m) => [
          ...m,
          {
            role: "agent",
            text:
              reply.error ??
              "I hit an error while answering that. Please try again in a moment.",
          },
        ]);
        return;
      }
      setMessages((m) => [...m, { role: "agent", text: reply.text!, links: reply.links, intent: reply.intent }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text: "I hit an error while answering that. Please try again in a moment.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  const engineLabel = status
    ? status.configured
      ? `gemini · ${status.model}`
      : "gemini · not configured"
    : "gemini";

  return (
    <div className={`card flex flex-col ${compact ? "h-[440px]" : "h-[520px]"}`}>
      {/* Console header */}
      <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="pulse-dot" aria-hidden="true" />
          <p className="text-[13px] font-semibold text-ink">Lumina copilot</p>
          <span className="hidden rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand sm:inline">
            {status ? engineLabel : "gemini"}
          </span>
        </div>
        <p className="telemetry">{status?.network ?? "flare"}</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            data-role={m.role === "user" ? "user-message" : "agent-message"}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-md bg-brand text-white"
                  : "rounded-bl-md border border-line/70 bg-surface-2 text-ink-soft"
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              {m.intent && (
                <div className="mt-2.5 rounded-xl border border-brand/40 bg-brand/10 p-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
                    intent · {m.intent.action}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-ink">
                    Deposit {m.intent.amount} FXRP · {m.intent.strategyId} ·{" "}
                    {m.intent.path.toUpperCase()}
                  </p>
                  <Link
                    href={`/execute/${m.intent.strategyId}?amount=${encodeURIComponent(
                      m.intent.amount
                    )}&path=${m.intent.path}&via=agent`}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-brand-strong"
                  >
                    Execute deposit →
                  </Link>
                </div>
              )}
              {m.links && m.links.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {m.links.map((l) => (
                    <Link
                      key={l.href + l.label}
                      href={l.href}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        m.role === "user"
                          ? "bg-white/15 text-white hover:bg-white/25"
                          : "bg-brand/10 text-brand hover:bg-brand/20"
                      }`}
                    >
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div data-role="typing-indicator" className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-line/70 bg-surface-2 px-3.5 py-3">
              <span className="agent-typing" aria-label="Agent is thinking">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && !compact && (
        <div className="flex flex-wrap gap-2 border-t border-line/60 px-4 py-2.5">
          {[
            "Which strategy is right for me?",
            "Compare Firelight vs Clearstar",
            "Explain Firelight stXRP and its risks",
            "How risky is Clearstar?",
            "How do I make a deposit?",
            "What's on-chain right now?",
          ].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => ask(p)}
              className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[11px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2 border-t border-line/60 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about strategies, risk, deposits…"
          aria-label="Ask the Lumina agent"
          className="field"
        />
        <button type="submit" disabled={!input.trim() || thinking} className="btn-primary shrink-0">
          Send
        </button>
      </form>
    </div>
  );
}
