import type { YieldContext } from "@lumina/shared";
import { formatApyRange } from "@lumina/shared";

/**
 * Honest yield presentation. Never a single glossy APY:
 * a clear summary, a labelled reference range, and (when available) on-chain
 * share-price growth flagged as testnet data.
 */
export function YieldDisclosure({ yieldContext }: { yieldContext: YieldContext }) {
  const { summary, range, sharePriceGrowth } = yieldContext;

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-ink">Yield in context</h2>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
          Not a promise
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{summary}</p>

      {range && (
        <div className="mt-3 rounded-xl bg-paper p-3">
          <p className="text-xs text-muted">Reference range</p>
          <p className="mt-0.5 text-lg font-bold text-ink">
            {formatApyRange(range.low, range.high)}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">{range.sourceLabel}</p>
        </div>
      )}

      {sharePriceGrowth && (
        <div className="mt-3 rounded-xl bg-paper p-3">
          <p className="text-xs text-muted">On-chain share-price growth</p>
          <p className="mt-0.5 text-lg font-bold text-ink">
            +{sharePriceGrowth.percent.toFixed(1)}%
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            Since {sharePriceGrowth.since}.{" "}
            {sharePriceGrowth.isTestnet
              ? "Testnet data — real numbers, but test value only."
              : "Mainnet data."}
          </p>
        </div>
      )}
    </section>
  );
}
