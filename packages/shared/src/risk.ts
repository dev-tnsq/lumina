import type { RiskTier } from "./types";

/**
 * Lumina's transparent risk model.
 *
 * Every factor is a public input; the label is derived mechanically so that a
 * user (or an auditor) can see exactly why a strategy got the label it did.
 * We never hide a factor, and we never let marketing material override the
 * scoring.
 */

export interface RiskFactorInput {
  /** True if the vault/strategy contracts have public audits from recognised firms. */
  audited: boolean | "unknown";
  /** Stage of the protocol: "live-mainnet" | "testnet" | "new" */
  stage: "live-mainnet" | "testnet" | "new";
  /** Complexity of the strategy: how many moving parts / off-chain components. */
  complexity: "simple" | "medium" | "high";
  /** Withdrawal behaviour. */
  withdrawal: "instant" | "queue" | "period";
  /** TVL signal relative to the ecosystem: "large" | "moderate" | "small" | "unknown". */
  tvl: "large" | "moderate" | "small" | "unknown";
}

export interface RiskScoreBreakdown {
  label: RiskTier;
  score: number; // 0 (safest) .. 100 (riskiest)
  factors: { name: string; impact: number; reason: string }[];
  defaultNotes: string[];
}

const WEIGHTS = {
  audit: 0.3,
  stage: 0.2,
  complexity: 0.2,
  withdrawal: 0.15,
  tvl: 0.15,
} as const;

function factorScore(value: unknown, levels: [unknown, number][], fallback: number): number {
  for (const [level, score] of levels) {
    if (value === level) return score;
  }
  return fallback;
}

export function scoreRisk(input: RiskFactorInput): RiskScoreBreakdown {
  const auditScore = factorScore(
    input.audited,
    [
      [true, 5],
      ["unknown", 45],
      [false, 80],
    ],
    50
  );
  const stageScore = factorScore(
    input.stage,
    [
      ["live-mainnet", 10],
      ["testnet", 35],
      ["new", 60],
    ],
    50
  );
  const complexityScore = factorScore(
    input.complexity,
    [
      ["simple", 10],
      ["medium", 40],
      ["high", 75],
    ],
    40
  );
  const withdrawalScore = factorScore(
    input.withdrawal,
    [
      ["instant", 5],
      ["queue", 30],
      ["period", 50],
    ],
    30
  );
  const tvlScore = factorScore(
    input.tvl,
    [
      ["large", 10],
      ["moderate", 30],
      ["small", 55],
      ["unknown", 40],
    ],
    40
  );

  const factors = [
    { name: "Smart contract audit", impact: Math.round(auditScore * WEIGHTS.audit), reason: describeAudit(input.audited) },
    { name: "Protocol stage", impact: Math.round(stageScore * WEIGHTS.stage), reason: describeStage(input.stage) },
    { name: "Strategy complexity", impact: Math.round(complexityScore * WEIGHTS.complexity), reason: describeComplexity(input.complexity) },
    { name: "Withdrawal behaviour", impact: Math.round(withdrawalScore * WEIGHTS.withdrawal), reason: describeWithdrawal(input.withdrawal) },
    { name: "TVL / liquidity", impact: Math.round(tvlScore * WEIGHTS.tvl), reason: describeTvl(input.tvl) },
  ];

  const score = factors.reduce((acc, f) => acc + f.impact, 0);

  const label: RiskTier = score < 25 ? "Conservative" : score < 50 ? "Balanced" : "Advanced";

  return {
    label,
    score,
    factors,
    defaultNotes: buildDefaultNotes(input, label),
  };
}

function describeAudit(audited: RiskFactorInput["audited"]): string {
  if (audited === true) return "Audited by recognised firms; audits reduce but do not eliminate risk.";
  if (audited === "unknown") return "Audit status not publicly confirmed — treated as a risk factor.";
  return "No public audit found — significant risk factor.";
}

function describeStage(stage: RiskFactorInput["stage"]): string {
  if (stage === "live-mainnet") return "Live on mainnet with a track record.";
  if (stage === "testnet") return "Testnet deployment only — behaviour not proven with real value at risk.";
  return "New / early stage protocol.";
}

function describeComplexity(c: RiskFactorInput["complexity"]): string {
  if (c === "simple") return "Single, well-understood mechanism (e.g. one vault).";
  if (c === "medium") return "Several integrated mechanisms (allocation across markets).";
  return "Many moving parts incl. options/off-chain components — harder to reason about.";
}

function describeWithdrawal(w: RiskFactorInput["withdrawal"]): string {
  if (w === "instant") return "Withdrawals generally available immediately.";
  if (w === "queue") return "Withdrawals may be queued or limited by vault conditions.";
  return "Withdrawal requires waiting a full period before claiming.";
}

function describeTvl(t: RiskFactorInput["tvl"]): string {
  if (t === "large") return "Large TVL signal — better liquidity, more users stress-testing.";
  if (t === "moderate") return "Moderate TVL signal.";
  if (t === "small") return "Small TVL — easier for large exits to move the market.";
  return "TVL not known.";
}

function buildDefaultNotes(input: RiskFactorInput, label: RiskTier): string[] {
  const notes: string[] = [];
  if (input.stage === "testnet") {
    notes.push("Testnet deployment — funds are test tokens with no real value. Do not send real XRP here.");
  }
  if (input.audited !== true) {
    notes.push("Audit status not confirmed. Understand this before depositing.");
  }
  if (input.withdrawal !== "instant") {
    notes.push("Exits are not instant — review the vault's withdrawal rules before depositing.");
  }
  if (label === "Advanced") {
    notes.push("High complexity — suitable only for users who understand the strategy mechanics.");
  }
  if (input.complexity === "high") {
    notes.push("Strategy uses options / off-chain components whose outcomes are hard to predict.");
  }
  return notes;
}
