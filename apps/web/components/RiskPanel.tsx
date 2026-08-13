import type { Strategy } from "@lumina/shared";
import { getStrategyRiskBreakdown } from "@lumina/shared";
import { RiskBadge } from "./RiskBadge";

/**
 * The explainable risk panel. Shows the mechanical factor breakdown behind the
 * label (weights are public in the shared risk model) plus the plain-language
 * notes. Risk is never hidden behind a single badge.
 */
export function RiskPanel({ strategy }: { strategy: Strategy }) {
  const breakdown = getStrategyRiskBreakdown(strategy.id);

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="micro">Risk breakdown</h2>
        <RiskBadge tier={strategy.risk} />
      </div>

      {breakdown && (
        <>
          <ul className="mt-4 space-y-3">
            {breakdown.factors.map((f) => (
              <li key={f.name} className="flex items-start gap-3">
                <ImpactBar impact={f.impact} />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">{f.name}</p>
                  <p className="text-[12px] leading-snug text-muted">{f.reason}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right text-[11px] text-muted">
            weighted score {breakdown.score}/100 · model is public in @lumina/shared
          </p>
        </>
      )}

      <ul className="mt-4 space-y-2 border-t border-line/60 pt-4">
        {strategy.riskNotes.map((note, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-snug text-ink-soft">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden="true" />
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ImpactBar({ impact }: { impact: number }) {
  const width = `${Math.min(impact, 100)}%`;
  const tone = impact < 25 ? "bg-risk-conservative" : impact < 50 ? "bg-risk-balanced" : "bg-risk-advanced";
  return (
    <div className="mt-0.5 w-14 shrink-0">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/50">
        <div className={`h-full rounded-full ${tone}`} style={{ width }} />
      </div>
      <p className="mt-0.5 text-right font-mono text-[10px] text-muted">{impact}</p>
    </div>
  );
}
