import type { Metadata } from "next";
import { AgentChat } from "@/components/AgentChat";
import { LiveVaultStats } from "@/components/LiveVaultStats";
import { STRATEGIES } from "@lumina/shared";

export const metadata: Metadata = {
  title: "Agent",
  description:
    "Talk to the Lumina copilot: strategy briefs, risk explanations, deposit guidance and live on-chain numbers — grounded in real data.",
};

export default function AgentPage() {
  return (
    <div className="container-app py-8">
      <div className="max-w-2xl">
        <p className="micro">Copilot</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">
          Ask Lumina anything
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Every answer is grounded in the real strategy catalog and live Coston2 reads.
          No invented yields, no made-up numbers — if Lumina doesn&apos;t know, it says so.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <AgentChat />

        <aside className="space-y-4">
          <div className="card p-4">
            <p className="micro">What it knows</p>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-ink-soft">
              <li className="flex gap-2">
                <span className="text-brand">▸</span> Full strategy catalog with risk
                breakdowns and yield context
              </li>
              <li className="flex gap-2">
                <span className="text-brand">▸</span> Deposit guidance — FSA and EVM
                paths, step by step
              </li>
              <li className="flex gap-2">
                <span className="text-brand">▸</span> Live on-chain vault totals and
                registry verification
              </li>
            </ul>
          </div>

          <div className="card p-4">
            <p className="micro">On-chain right now</p>
            <div className="mt-3">
              <LiveVaultStats strategies={STRATEGIES} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
