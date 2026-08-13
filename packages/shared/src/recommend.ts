import { getLiveStrategies, STRATEGIES } from "./strategies";
import type { Recommendation, RiskPreferences, RiskTier, Strategy } from "./types";

/**
 * Lumina's recommendation engine.
 *
 * Pure, deterministic, and explainable: given a user's risk preferences it
 * ranks the live strategies and explains in plain language why each one was
 * placed where it was.
 */

const RISK_ORDER: RiskTier[] = ["Conservative", "Balanced", "Advanced"];

function riskIndex(tier: RiskTier): number {
  return RISK_ORDER.indexOf(tier);
}

function preferenceFit(strategy: Strategy, prefs: RiskPreferences): number {
  let score = 0;
  const strategyRiskIndex = riskIndex(strategy.risk);
  const toleranceIndex = riskIndex(prefs.riskTolerance);

  // Closer to the user's tolerance is better; within-tolerance is ideal.
  const diff = Math.abs(strategyRiskIndex - toleranceIndex);
  if (strategyRiskIndex <= toleranceIndex) {
    score += 10 - diff * 2; // 10, 8, 6...
  } else {
    score += 4 - diff; // above tolerance — penalised
  }

  // Lockup comfort: strategies with withdrawal periods need comfort.
  if (prefs.lockupComfort === "none") {
    if (strategy.risk === "Conservative" && strategy.id === "kinetic-supply") score += 5;
    score -= strategy.vault ? 2 : 0;
  } else if (prefs.lockupComfort === "some") {
    score += strategy.vault ? 2 : 0;
  } else {
    score += strategy.vault ? 4 : 0;
  }

  // Simplicity preference rewards the simplest live strategies.
  if (prefs.simplicity) {
    if (strategy.id === "firelight-stxrp" || strategy.id === "clearstar-earnxrp") score += 6;
    if (strategy.id === "monarq-mxrpy") score -= 4;
  }

  // Only live-on-Coston2 strategies can be executed; reference-only ones rank last.
  if (strategy.availability !== "live") score -= 100;

  return score;
}

export function recommend(
  strategies: Strategy[],
  prefs: RiskPreferences
): Recommendation[] {
  return strategies
    .map((s) => ({
      strategyId: s.id,
      matchScore: preferenceFit(s, prefs),
      strategy: s,
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .map((item, i) => ({
      strategyId: item.strategyId,
      rank: i + 1,
      matchScore: item.matchScore,
      reason: buildReason(item.strategy, prefs),
    }));
}

function buildReason(strategy: Strategy, prefs: RiskPreferences): string {
  if (strategy.availability !== "live") {
    return `${strategy.name} is not live on the Coston2 testnet yet, so it cannot be executed today.`;
  }
  const parts: string[] = [];
  if (strategy.risk === prefs.riskTolerance) {
    parts.push(`matches your ${prefs.riskTolerance.toLowerCase()} risk comfort`);
  } else if (riskIndex(strategy.risk) < riskIndex(prefs.riskTolerance)) {
    parts.push(`is more conservative than your ${prefs.riskTolerance.toLowerCase()} comfort`);
  } else {
    parts.push(`is above your ${prefs.riskTolerance.toLowerCase()} comfort — consider the higher risk`);
  }
  if (prefs.simplicity && (strategy.id === "firelight-stxrp" || strategy.id === "clearstar-earnxrp")) {
    parts.push("is a simple single-vault path");
  }
  if (prefs.lockupComfort === "none") {
    parts.push("exits are not instant — plan around the withdrawal period");
  }
  return strategy.name + " " + parts.join(" and ") + ".";
}

/** Convenience: recommend over the full catalog. */
export function recommendFromPreferences(prefs: RiskPreferences): Recommendation[] {
  return recommend(STRATEGIES, prefs);
}

/** Convenience: recommend over live strategies only. */
export function recommendLive(prefs: RiskPreferences): Recommendation[] {
  return recommend(getLiveStrategies(), prefs);
}
