import Link from "next/link";
import { StrategyCard } from "@/components/StrategyCard";
import { LiveVaultStats } from "@/components/LiveVaultStats";
import { getLiveStrategies, STRATEGIES } from "@lumina/shared";

export default function HomePage() {
  const live = getLiveStrategies();

  return (
    <div className="container-app py-10 lg:py-16">
      {/* Hero */}
      <section className="max-w-3xl">
        <p className="micro flex items-center gap-2">
          <span className="pulse-dot" aria-hidden="true" />
          copilot online · flare coston2
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-ink lg:text-4xl">
          Put XRP to work on Flare.
          <br />
          <span className="text-brand">
            With an agent that won&apos;t lie to you.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-soft">
          Lumina is your copilot for Flare XRPFi. Ask it anything in plain language —
          it explains the real risk behind every strategy, prepares your deposit
          transaction, and reads your positions straight from the chain. Every number
          is real, nothing is invented.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/agent" className="btn-primary">
            Ask the agent
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/strategies" className="btn-ghost">
            Explore strategies
          </Link>
        </div>
        <p className="mt-5 text-[13px] text-muted">
          Not sure where to start?{" "}
          <Link href="/onboarding" className="font-semibold text-brand hover:underline">
            Take the 20-second fit check →
          </Link>
        </p>
      </section>

      {/* Live telemetry strip */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="micro">Live strategies · on-chain right now</h2>
          <Link href="/strategies" className="text-[12px] font-semibold text-brand hover:underline">
            view all →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {live.map((s) => (
            <StrategyCard key={s.id} strategy={s} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="micro">How Lumina helps</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "01 / Understand",
              d: "Every strategy shows its risk score, the factors behind it and what could go wrong — before you commit. The agent explains it in plain language.",
            },
            {
              t: "02 / Execute",
              d: "Lumina prepares the exact transaction for the Flare Smart Account path or your EVM wallet. You review, you sign, you stay in control.",
            },
            {
              t: "03 / Verify",
              d: "Positions, vault totals and the on-chain registry are read live from Coston2. What you see is what the chain says — nothing cached, nothing mocked.",
            },
          ].map((s) => (
            <div key={s.t} className="card p-5">
              <p className="font-mono text-[11px] font-semibold text-brand">{s.t}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* On-chain stats */}
      <section className="mt-14 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card p-5">
          <h2 className="micro">Vault telemetry</h2>
          <div className="mt-4">
            <LiveVaultStats strategies={STRATEGIES} />
          </div>
        </div>
        <div className="card flex flex-col justify-between p-5">
          <div>
            <p className="micro">Trust, by design</p>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
              Lumina is deliberately testnet-first: it earns trust with test assets
              before real money is involved. The strategy catalog is cross-checked
              against an on-chain registry you can inspect yourself.
            </p>
          </div>
          <Link
            href="/strategies"
            className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline"
          >
            See the registry audit →
          </Link>
        </div>
      </section>
    </div>
  );
}
