import Link from "next/link";
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
    <div className="container-app py-10">
      <header className="max-w-2xl">
        <Link href="/" className="text-[13px] font-semibold text-brand hover:underline">
          ← Home
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Strategies</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Every option on Flare XRPFi, with its real risk profile. Yield is always shown
          in context — and the whole catalog is cross-checked against the on-chain
          registry below.
        </p>
      </header>

      <main className="mt-8">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="micro">Executable on Coston2</h2>
            <span className="rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
              {live.length} live
            </span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {live.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="micro">Not on Coston2 yet</h2>
          <p className="mt-1 max-w-xl text-[13px] leading-snug text-muted">
            Shown for research and comparison. These protocols run on Flare mainnet but
            have no registered vault on Coston2, so Lumina cannot execute them — and
            their numbers are never presented as promises.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reference.map((s) => (
              <StrategyCard key={s.id} strategy={s} />
            ))}
          </div>
        </section>

        <RegistryAudit strategies={STRATEGIES} />
      </main>
    </div>
  );
}
