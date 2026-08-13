import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { StrategyCard } from "@/components/StrategyCard";
import { getLiveStrategies, STRATEGIES } from "@lumina/shared";
import { LiveVaultStats } from "@/components/LiveVaultStats";

export default function HomePage() {
  const live = getLiveStrategies();
  const featured = live.slice(0, 2);

  return (
    <div className="container-phone pb-safe">
      <header className="flex items-center justify-between px-4 pt-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M12 12V2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">Lumina</span>
        </div>
        <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">
          Coston2 testnet
        </span>
      </header>

      <main className="px-4">
        <section className="mt-6">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ink">
            Put XRP to work on Flare.
            <br />
            <span className="text-brand">Safely.</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Lumina is your copilot for Flare XRPFi. We explain the real risks behind every
            strategy, prepare your transactions, and keep your positions easy to see —
            no glossy APYs, no surprises.
          </p>
          <div className="mt-5 flex gap-3">
            <Link
              href="/onboarding"
              className="flex-1 rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-strong"
            >
              Get started
            </Link>
            <Link
              href="/strategies"
              className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-brand"
            >
              Explore strategies
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            How Lumina helps
          </h2>
          <ol className="mt-3 space-y-3">
            {[
              {
                n: "1",
                t: "Understand the risk",
                d: "Every strategy shows its risk score, the factors behind it, and what could go wrong — before you commit.",
              },
              {
                n: "2",
                t: "Get a guided path",
                d: "We prepare the exact transaction for the Flare Smart Account path and check the numbers on-chain.",
              },
              {
                n: "3",
                t: "See everything clearly",
                d: "Your FXRP balance and vault positions on Coston2, updated live from the chain.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-card">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{s.t}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Live strategies
            </h2>
            <Link href="/strategies" className="text-[13px] font-semibold text-brand">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {featured.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            On-chain right now
          </h2>
          <div className="mt-3">
            <LiveVaultStats strategies={STRATEGIES} />
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-ink p-4 text-paper shadow-card">
          <h2 className="text-sm font-semibold">Testnet only, on purpose</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-paper/80">
            Lumina currently operates on Flare Coston2 with test FXRP. Everything you can
            read here is real on-chain data, but nothing is real money. This is where we
            earn your trust before anything mainnet.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
