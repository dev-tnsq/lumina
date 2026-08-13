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
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="micro">Yield in context</h2>
        <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-brand">
          not a promise
        </span>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{summary}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {range && (
          <div className="rounded-xl border border-line/60 bg-surface-2 p-3.5">
            <p className="micro">Reference range</p>
            <p className="mt-1 font-mono text-xl font-bold text-ink">
              {formatApyRange(range.low, range.high)}
            </p>
            <p className="mt-1 text-[11px] leading-snug text-muted">{range.sourceLabel}</p>
          </div>
        )}

        {sharePriceGrowth && (
          <div className="rounded-xl border border-line/60 bg-surface-2 p-3.5">
            <p className="micro">On-chain share-price growth</p>
            <p className="mt-1 font-mono text-xl font-bold text-brand">
              +{sharePriceGrowth.percent.toFixed(1)}%
            </p>
            <p className="mt-1 text-[11px] leading-snug text-muted">
              Since {sharePriceGrowth.since}.{" "}
              {sharePriceGrowth.isTestnet
                ? "Testnet data — real numbers, test value only."
                : "Mainnet data."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
