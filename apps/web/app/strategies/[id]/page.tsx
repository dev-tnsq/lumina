import Link from "next/link";
import { notFound } from "next/navigation";
import { RiskBadge } from "@/components/RiskBadge";
import { YieldDisclosure } from "@/components/YieldDisclosure";
import { RiskPanel } from "@/components/RiskPanel";
import { VaultReadout } from "@/components/VaultReadout";
import { getStrategy, STRATEGIES } from "@lumina/shared";

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

  const live = strategy.availability === "live";

  return (
    <div className="container-app py-10">
      <Link href="/strategies" className="text-[13px] font-semibold text-brand hover:underline">
        ← All strategies
      </Link>

      <header className="mt-4 max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="micro">{strategy.protocol}</p>
            <h1 className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-ink">
              {strategy.name}
            </h1>
          </div>
          <RiskBadge tier={strategy.risk} />
        </div>

        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          {strategy.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {live ? (
            <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
              <span className="pulse-dot" aria-hidden="true" />
              executable on coston2
            </span>
          ) : (
            <span className="rounded-full bg-gold-soft px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold">
              reference only
            </span>
          )}
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
            path: {strategy.preferredPath === "both" ? "fsa / evm" : strategy.preferredPath}
          </span>
        </div>

        {strategy.availabilityNote && (
          <p className="mt-3 rounded-xl border border-gold/30 bg-gold-soft p-3 text-[13px] leading-snug text-gold">
            {strategy.availabilityNote}
          </p>
        )}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <main className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="micro">Who operates this</p>
                <p className="mt-1 truncate text-[15px] font-semibold text-ink">
                  {strategy.publisher.name}
                  {strategy.publisher.handle && (
                    <span className="ml-1.5 font-mono text-[11px] font-normal text-muted">
                      {strategy.publisher.handle}
                    </span>
                  )}
                </p>
                {strategy.publisher.note && (
                  <p className="mt-1 text-[12px] leading-snug text-ink-soft">
                    {strategy.publisher.note}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                  strategy.publisher.verified
                    ? "bg-brand/10 text-brand"
                    : "bg-gold-soft text-gold"
                }`}
              >
                {strategy.publisher.verified ? "✓ verified on-chain" : "not yet verified"}
              </span>
            </div>
          </div>

          <YieldDisclosure yieldContext={strategy.yieldContext} />
          {strategy.vault && (
            <VaultReadout vault={strategy.vault} assetSymbol={strategy.asset?.symbol ?? "FXRP"} />
          )}
          <RiskPanel strategy={strategy} />
          {strategy.externalUrl && (
            <a
              href={strategy.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card block p-4 text-[13px] font-semibold text-brand transition-colors hover:border-brand/50"
            >
              Read the protocol site ↗{" "}
              <span className="font-normal text-muted">({strategy.externalUrl})</span>
            </a>
          )}
        </main>

        {/* Sticky agent brief */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-line/60 px-5 py-4">
              <p className="micro flex items-center gap-2">
                <span className="pulse-dot" aria-hidden="true" />
                agent brief
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {live
                  ? "This strategy is live on Coston2. Ask the agent for the plain-language version, or start the guided deposit."
                  : "This strategy is not executable on Coston2 yet. It is shown for research only."}
              </p>
            </div>
            <div className="space-y-2.5 p-5">
              {live ? (
                <Link href={`/execute/${strategy.id}`} className="btn-primary w-full">
                  Start guided deposit
                </Link>
              ) : (
                <Link href="/strategies" className="btn-ghost w-full">
                  Browse executable strategies
                </Link>
              )}
              <Link href="/agent" className="btn-ghost w-full">
                Ask the agent about this strategy
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
