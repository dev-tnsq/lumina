import type { Strategy } from "@lumina/shared";
import Link from "next/link";
import { RiskBadge } from "./RiskBadge";
import { formatApyRange } from "@lumina/shared";

/** The primary strategy card — shows risk first, yield second, always in context. */
export function StrategyCard({ strategy }: { strategy: Strategy }) {
  const { yieldContext } = strategy;
  const hasRange = yieldContext.range != null;

  return (
    <Link
      href={`/strategies/${strategy.id}`}
      className="block rounded-2xl border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {strategy.protocol}
          </p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-ink">
            {strategy.name}
          </h3>
        </div>
        <RiskBadge tier={strategy.risk} size="sm" />
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
        {strategy.description}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          {hasRange && yieldContext.range ? (
            <p className="text-lg font-bold text-ink">
              {formatApyRange(yieldContext.range.low, yieldContext.range.high)}
            </p>
          ) : (
            <p className="text-sm font-semibold text-muted">Yield not verified</p>
          )}
          {hasRange && yieldContext.range && (
            <p className="text-[11px] text-muted">{yieldContext.range.sourceLabel}</p>
          )}
        </div>
        {strategy.availability === "live" ? (
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
            Live on Coston2
          </span>
        ) : (
          <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-gold">
            Reference only
          </span>
        )}
      </div>

      <div className="mt-3 border-t border-line pt-2.5 text-xs text-muted">
        <span className="font-medium text-ink-soft">Why this risk:</span>{" "}
        {strategy.riskNotes[0]}
      </div>
    </Link>
  );
}
