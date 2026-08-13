import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { RiskBadge } from "@/components/RiskBadge";
import { YieldDisclosure } from "@/components/YieldDisclosure";
import { RiskPanel } from "@/components/RiskPanel";
import { VaultReadout } from "@/components/VaultReadout";
import { getStrategy, STRATEGIES, shortenAddress } from "@lumina/shared";

export function generateStaticParams() {
  return STRATEGIES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const strategy = getStrategy(id);
  if (!strategy) return { title: "Strategy not found" };
  return {
    title: strategy.name,
    description: strategy.description,
  };
}

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const strategy = getStrategy(id);
  if (!strategy) notFound();

  return (
    <div className="container-phone pb-safe">
      <header className="px-4 pt-5">
        <Link href="/strategies" className="text-[13px] font-semibold text-brand">
          ← All strategies
        </Link>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {strategy.protocol}
            </p>
            <h1 className="mt-0.5 text-2xl font-bold leading-tight tracking-tight text-ink">
              {strategy.name}
            </h1>
          </div>
          <RiskBadge tier={strategy.risk} />
        </div>

        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          {strategy.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {strategy.availability === "live" ? (
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              Live on Coston2 — executable
            </span>
          ) : (
            <span className="rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold">
              Reference only
            </span>
          )}
          <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
            Path: {strategy.preferredPath === "both" ? "FSA or EVM" : strategy.preferredPath === "fsa" ? "FSA" : "EVM"}
          </span>
        </div>

        {strategy.availabilityNote && (
          <p className="mt-3 rounded-xl border border-gold/30 bg-gold-soft p-3 text-[13px] leading-snug text-gold">
            {strategy.availabilityNote}
          </p>
        )}
      </header>

      <main className="mt-5 space-y-4 px-4">
        <YieldDisclosure yieldContext={strategy.yieldContext} />

        {strategy.vault && (
          <VaultReadout
            vault={strategy.vault}
            assetSymbol={strategy.asset?.symbol ?? "FXRP"}
          />
        )}

        <RiskPanel strategy={strategy} />

        {strategy.externalUrl && (
          <a
            href={strategy.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-line bg-surface p-4 text-sm font-semibold text-brand shadow-card transition-colors hover:border-brand"
          >
            Read the protocol site{" "}
            <span className="font-normal text-muted">({strategy.externalUrl})</span> ↗
          </a>
        )}

        {strategy.availability === "live" && (
          <Link
            href={`/execute/${strategy.id}`}
            className="block w-full rounded-xl bg-brand px-4 py-3.5 text-center text-[15px] font-semibold text-white shadow-card transition-colors hover:bg-brand-strong"
          >
            Start guided deposit
          </Link>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
