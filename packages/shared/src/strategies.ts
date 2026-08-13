import { COSTON2_CONTRACTS, COSTON2_VAULTS, REFERENCE_YIELD } from "./constants";
import { scoreRisk, type RiskScoreBreakdown } from "./risk";
import type { Strategy } from "./types";

/**
 * The Lumina strategy catalog.
 *
 * Every vault address here was verified on-chain on Coston2 (2026-08-14):
 * - vaultIds come from LuminaStrategyRegistry.getVaults() (Lumina's own
 *   on-chain registry, deployed 2026-08-14 at
 *   COSTON2_CONTRACTS.luminaStrategyRegistry)
 * - names/symbols from vault.name()/symbol()
 * - the FXRP asset from AssetManagerFXRP.fAsset()
 *
 * The registry is the source of truth: a strategy is executable only if its
 * vault is registered and active on-chain. The strategies page reads the
 * registry live and cross-checks this catalog against it.
 *
 * Yield context is honest: on-chain derived where possible, otherwise clearly
 * labelled reference ranges. We never present a single glossy APY.
 */

const fxrpAsset = {
  symbol: "FXRP",
  decimals: 6,
  address: COSTON2_CONTRACTS.fxrp,
} as const;

function clearstarRisk() {
  return scoreRisk({
    audited: true,
    stage: "testnet",
    complexity: "medium",
    withdrawal: "period",
    tvl: "moderate",
  });
}

function firelightRisk() {
  return scoreRisk({
    audited: true,
    stage: "testnet",
    complexity: "simple",
    withdrawal: "period",
    tvl: "large",
  });
}

function monarqRisk() {
  return scoreRisk({
    audited: true,
    stage: "live-mainnet",
    complexity: "high",
    withdrawal: "period",
    tvl: "moderate",
  });
}

function kineticRisk() {
  return scoreRisk({
    audited: true,
    stage: "testnet",
    complexity: "simple",
    withdrawal: "instant",
    tvl: "unknown",
  });
}

export const STRATEGIES: Strategy[] = [
  {
    id: "clearstar-earnxrp",
    name: "Clearstar XRP Yield Vault",
    protocol: "Clearstar / Upshift",
    description:
      "Deposit FXRP into a single vault that automatically allocates across lending, liquid staking and liquidity positions on Flare. Returns are denominated in XRP and compounded automatically.",
    risk: clearstarRisk().label,
    riskNotes: [
      ...clearstarRisk().defaultNotes,
      ...clearstarRisk().factors.map((f) => f.reason),
      "Variable yield — not a fixed rate. Past performance does not predict future returns.",
      "Underlying strategies include lending and liquidity provision with their own smart-contract risk.",
    ],
    yieldContext: {
      summary:
        "On Coston2 the test vault share price has actually appreciated ~5.9% since it started accruing (real on-chain data). This is testnet data, not a promise of mainnet returns.",
      range: {
        low: REFERENCE_YIELD.clearstarEarnXrp.low,
        high: REFERENCE_YIELD.clearstarEarnXrp.high,
        sourceLabel: REFERENCE_YIELD.clearstarEarnXrp.source,
      },
      sharePriceGrowth: {
        percent: 5.9,
        since: "vault start on Coston2",
        isTestnet: true,
      },
      derivedFromOnChain: true,
    },
    tvlSignal: "Largest dedicated FXRP vault family on Flare (mainnet). Test vault on Coston2 is active.",
    vault: COSTON2_VAULTS[1] ?? null,
    availability: "live",
    preferredPath: "both",
    asset: fxrpAsset,
    externalUrl: "https://app.upshift.finance/pools/14/0x373D7d201C8134D4a2f7b5c63560da217e3dEA28",
  },
  {
    id: "firelight-stxrp",
    name: "Firelight stXRP",
    protocol: "Firelight",
    description:
      "Deposit FXRP to receive stXRP — a liquid staking style receipt that accrues network-aligned rewards. The core building block of the Flare XRPFi stack.",
    risk: firelightRisk().label,
    riskNotes: [
      ...firelightRisk().defaultNotes,
      ...firelightRisk().factors.map((f) => f.reason),
      "Liquid staking specific risks (protocol design, slashing where applicable).",
      "Exits go through a period-based withdrawal flow.",
    ],
    yieldContext: {
      summary:
        "stXRP on Coston2 is live and holding deposits. The share price is currently 1:1 (no yield accrued on the test vault yet). Reference ranges below are mainnet guidance only.",
      range: {
        low: REFERENCE_YIELD.firelight.low,
        high: REFERENCE_YIELD.firelight.high,
        sourceLabel: REFERENCE_YIELD.firelight.source,
      },
      derivedFromOnChain: true,
    },
    tvlSignal: "Live on Coston2 with the largest testnet stXRP vault (~101k FXRP total assets on-chain).",
    vault: COSTON2_VAULTS[0] ?? null,
    availability: "live",
    preferredPath: "both",
    asset: fxrpAsset,
    externalUrl: "https://firelight.fi",
  },
  {
    id: "monarq-mxrpy",
    name: "Monarq XRP Yield Vault",
    protocol: "Monarq",
    description:
      "Multi-strategy vault combining options, basis/funding capture and on-chain XRPFi. Higher complexity and a different, less transparent risk profile.",
    risk: monarqRisk().label,
    riskNotes: [
      ...monarqRisk().defaultNotes,
      ...monarqRisk().factors.map((f) => f.reason),
      "Strategy risk from options and off-chain components.",
      "Manager / curator risk.",
      "Returns can be more volatile than pure on-chain vaults.",
    ],
    yieldContext: {
      summary:
        "Not available on the Coston2 testnet. The range below is from Monarq's public material on mainnet — shown for comparison only, never as a promise.",
      range: {
        low: REFERENCE_YIELD.monarq.low,
        high: REFERENCE_YIELD.monarq.high,
        sourceLabel: REFERENCE_YIELD.monarq.source,
      },
      derivedFromOnChain: false,
    },
    tvlSignal: "Live on Flare mainnet.",
    vault: null,
    availability: "reference-only",
    availabilityNote:
      "No Monarq vault is registered on Coston2 yet. Lumina is testnet-only — this strategy is shown for research and comparison.",
    preferredPath: "both",
    externalUrl: "https://monarq.fi",
  },
  {
    id: "kinetic-supply",
    name: "Kinetic Supply (FXRP)",
    protocol: "Kinetic",
    description:
      "Supply FXRP to the Kinetic lending market and earn borrow-side interest. Simple, transparent, with withdrawals generally available.",
    risk: kineticRisk().label,
    riskNotes: [
      ...kineticRisk().defaultNotes,
      ...kineticRisk().factors.map((f) => f.reason),
      "Lending risk: if borrowers default beyond reserves you could lose principal.",
      "No dedicated Kinetic FXRP market is registered on Coston2 yet — this entry is research-level.",
    ],
    yieldContext: {
      summary:
        "No live FXRP market on Coston2 to read on-chain today. Shown for comparison based on Kinetic's public rates (mainnet).",
      derivedFromOnChain: false,
    },
    tvlSignal: "Live on Flare mainnet.",
    vault: null,
    availability: "reference-only",
    availabilityNote:
      "Kinetic is not registered as an FSA vault on Coston2 and no test FXRP market was found. Lumina is testnet-only, so this strategy is not executable yet.",
    preferredPath: "evm",
    externalUrl: "https://app.kinetic.market",
  },
];

export function getStrategy(id: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.id === id);
}

const RISK_BREAKDOWNS: Record<string, RiskScoreBreakdown> = {
  "clearstar-earnxrp": clearstarRisk(),
  "firelight-stxrp": firelightRisk(),
  "monarq-mxrpy": monarqRisk(),
  "kinetic-supply": kineticRisk(),
};

/**
 * The mechanical risk score breakdown for a strategy — the exact factors and
 * weights that produced its label. Shown on the strategy detail page so the
 * risk label is never a black box.
 */
export function getStrategyRiskBreakdown(id: string): RiskScoreBreakdown | undefined {
  return RISK_BREAKDOWNS[id];
}

/** Strategies that are live and executable on Coston2. */
export function getLiveStrategies(): Strategy[] {
  return STRATEGIES.filter((s) => s.availability === "live");
}
