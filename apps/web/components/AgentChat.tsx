"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import {
  respondToUser,
  SUGGESTED_PROMPTS,
  VAULT_ABI,
  formatUnitsValue,
  type AgentLink,
} from "@lumina/shared";
import { getLiveStrategies } from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";

const publicClient = createPublicClient({ chain: coston2, transport: http() });

interface Message {
  role: "user" | "agent";
  text: string;
  links?: AgentLink[];
}

/** Live vault totals, passed to the agent so its on-chain answers are real reads. */
function useVaultTotals() {
  return useQuery({
    queryKey: ["agent-vault-totals"],
    queryFn: async () => {
      const vaults = getLiveStrategies()
        .map((s) => s.vault)
        .filter((v): v is NonNullable<typeof v> => v != null);
      const rows = await Promise.all(
        vaults.map(async (v) => {
          try {
            const totalAssets = (await publicClient.readContract({
              address: v.address,
              abi: VAULT_ABI,
              functionName: "totalAssets",
            })) as bigint;
            return { name: v.name, address: v.address, totalAssets: formatUnitsValue(totalAssets, 6) };
          } catch {
            return { name: v.name, address: v.address, totalAssets: "—" };
          }
        })
      );
      return rows;
    },
    staleTime: 30_000,
  });
}

export function AgentChat({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "Copilot online. I answer from the real strategy catalog and live Coston2 data — no invented numbers. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const totals = useVaultTotals();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function ask(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setThinking(true);
    // Small delay so the typing indicator is visible and the reply feels like an agent.
    window.setTimeout(() => {
      const res = respondToUser(text, {
        vaultTotals: totals.data,
      });
      setMessages((m) => [...m, { role: "agent", text: res.text, links: res.links }]);
      setThinking(false);
    }, 450);
  }

  return (
    <div className={`card flex flex-col ${compact ? "h-[440px]" : "h-[520px]"}`}>
      {/* Console header */}
      <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="pulse-dot" aria-hidden="true" />
          <p className="text-[13px] font-semibold text-ink">Lumina copilot</p>
          <span className="hidden rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand sm:inline">
            grounded · live data
          </span>
        </div>
        <p className="telemetry">coston2</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-md bg-brand text-[#03201b]"
                  : "rounded-bl-md border border-line/70 bg-surface-2 text-ink-soft"
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              {m.links && m.links.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {m.links.map((l) => (
                    <Link
                      key={l.href + l.label}
                      href={l.href}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        m.role === "user"
                          ? "bg-[#03201b]/20 text-[#03201b] hover:bg-[#03201b]/30"
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
          <div className="flex justify-start">
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
          {SUGGESTED_PROMPTS().map((p) => (
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
