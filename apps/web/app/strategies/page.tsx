import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { StrategyCard } from "@/components/StrategyCard";
import { RegistryAudit } from "@/components/RegistryAudit";
import { STRATEGIES } from "@lumina/shared";

export const metadata = {
  title: "Explore strategies",
  description:
    "Lumina strategy catalog with honest risk labels and yield context for Flare XRPFi on Coston2.",
};

export default function StrategiesPage() {
  const live = STRATEGIES.filter((s) => s.availability === "live");
  const reference = STRATEGIES.filter((s) => s.availability === "reference-only");

  return (
    <div className="container-phone pb-safe">
      <header className="px-4 pt-5">
        <Link href="/" className="text-[13px] font-semibold text-brand">
          ← Home
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Strategies</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Every option on Flare XRPFi, with its real risk profile. Yield is shown in
          context, never as a single promise.
        </p>
      </header>

      <main className="px-4">
        <section className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Executable on Coston2
          </h2>
          <div className="mt-2 space-y-3">
            {live.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Reference only (mainnet)
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-muted">
            Shown for research and comparison. Lumina is testnet-only, so these are not
            executable yet — and their numbers are never presented as promises.
          </p>
          <div className="mt-2 space-y-3">
            {reference.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>
        </section>

        <RegistryAudit strategies={STRATEGIES} />
      </main>

      <BottomNav />
    </div>
  );
}
