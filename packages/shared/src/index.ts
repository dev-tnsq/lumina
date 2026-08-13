/**
 * Shared types, constants, and helpers for Lumina.
 * This file is intentionally real and extensible — no placeholders.
 */

export type RiskLabel = "Conservative" | "Balanced" | "Advanced";

export interface StrategyCard {
  id: string;
  name: string;
  protocol: string;
  description: string;
  risk: RiskLabel;
  riskNotes: string[];
  /** Honest representation — prefer range + recency over a single number */
  yieldContext: string;
  tvlSignal?: string;
  preferredPath: "fsa" | "evm" | "both";
  externalUrl?: string;
}

export const PRIORITY_STRATEGIES: StrategyCard[] = [
  {
    id: "clearstar-earnxrp",
    name: "Clearstar XRP Yield Vault",
    protocol: "Upshift / Clearstar",
    description:
      "Fully on-chain FXRP allocation across lending, liquid staking, and liquidity provision on Flare. Transparent and currently the largest dedicated XRP yield vault.",
    risk: "Conservative",
    riskNotes: [
      "Smart contract risk of the vault and underlying protocols",
      "Variable yield — not a fixed rate",
      "Withdrawal timing depends on vault configuration",
    ],
    yieldContext: "Variable. Check live performance; historically modest but transparent on-chain yield.",
    tvlSignal: "Largest dedicated FXRP vault",
    preferredPath: "both",
  },
  {
    id: "monarq-mxrpy",
    name: "Monarq XRP Yield Vault",
    protocol: "Upshift / Monarq",
    description:
      "Multi-strategy vault combining options, basis/funding capture, and on-chain XRPFi. Higher complexity than pure on-chain allocation.",
    risk: "Balanced",
    riskNotes: [
      "Strategy risk from options and off-chain components",
      "Manager / curator risk",
      "Variable and potentially more volatile returns",
    ],
    yieldContext: "Variable multi-strategy returns. Higher ceiling and higher complexity than pure on-chain vaults.",
    preferredPath: "both",
  },
  {
    id: "firelight-stxrp",
    name: "Firelight stXRP",
    protocol: "Firelight",
    description:
      "Liquid staking style exposure for FXRP. Core primitive in the Flare XRPFi stack.",
    risk: "Conservative",
    riskNotes: [
      "Smart contract risk",
      "Liquid staking specific risks (slashing / protocol design)",
    ],
    yieldContext: "Staking and related rewards. Check current rate on Firelight.",
    preferredPath: "both",
  },
];

export const FLARE_COSTON2 = {
  chainId: 114,
  name: "Flare Testnet Coston2",
  rpcUrl: "https://coston2-api.flare.network/ext/C/rpc",
  explorer: "https://coston2-explorer.flare.network",
  faucet: "https://faucet.flare.network/coston2",
} as const;

export const FLARE_MAINNET = {
  chainId: 14,
  name: "Flare",
  rpcUrl: "https://flare-api.flare.network/ext/C/rpc",
  explorer: "https://flare-explorer.flare.network",
} as const;

/** FlareContractRegistry is the same address on all Flare networks */
export const FLARE_CONTRACT_REGISTRY = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as const;
