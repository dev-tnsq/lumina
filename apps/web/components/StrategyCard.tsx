import type { Strategy } from "@lumina/shared";
import Link from "next/link";
import { RiskBadge } from "./RiskBadge";
import { formatApyRange } from "@lumina/shared";

/** The primary strategy card — risk first, yield second, always in context. */
export function StrategyCard({ strategy }: { strategy: Strategy }) {
  const { yieldContext } = strategy;
  const hasRange = yieldContext.range != null;

  return (
    <Link
      href={`/strategies/${strategy.id}`}
      className="card group block p-5 transition-all hover:border-brand/50 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="micro flex items-center gap-1.5">
            <span className="truncate">{strategy.protocol}</span>
            {strategy.publisher.verified && (
              <span
                title={`${strategy.publisher.name} — verified on-chain`}
                className="rounded-full bg-brand/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-brand"
              >
                ✓ verified
              </span>
            )}
          </p>
          <h3 className="mt-1.5 truncate text-[15px] font-semibold text-ink">
            {strategy.name}
          </h3>
        </div>
        <RiskBadge tier={strategy.risk} size="sm" />
      </div>

      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
        {strategy.description}
      </p>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line/60 pt-3">
        <div>
          {hasRange && yieldContext.range ? (
            <p className="font-mono text-[15px] font-bold text-ink">
              {formatApyRange(yieldContext.range.low, yieldContext.range.high)}
            </p>
          ) : (
            <p className="text-[13px] font-semibold text-muted">Yield not verified</p>
          )}
          {hasRange && yieldContext.range && (
            <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-muted">
              {yieldContext.range.sourceLabel}
            </p>
          )}
        </div>
        {strategy.availability === "live" ? (
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
            <span className="pulse-dot" aria-hidden="true" />
            live
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            reference
          </span>
        )}
      </div>

      <p className="mt-3 text-[12px] leading-snug text-muted">
        <span className="font-semibold text-ink-soft">Why this risk:</span>{" "}
        {strategy.riskNotes[0]}
      </p>
    </Link>
  );
}
