/**
 * Lumina core domain types.
 *
 * These types are the shared contract between the frontend, the yield & risk
 * engine, the execution layer, and the position dashboard.
 */

/** The networks Lumina supports. The active one is chosen by config. */
export type NetworkId = "coston2" | "flare-mainnet";

/** Who publishes / operates a strategy, and how Lumina verified it. */
export interface Publisher {
  /** Protocol / team that built and operates the strategy. */
  name: string;
  /** Short handle, e.g. @firelight. */
  handle: string;
  /**
   * Public signer address used by the publisher for on-chain verification,
   * when Lumina has been able to verify it. Absent = not yet verified on-chain.
   */
  address?: `0x${string}`;
  /** True when Lumina verified the publisher's on-chain relationship to the vault. */
  verified: boolean;
  /** One-line plain-language note about who publishes/operates this strategy. */
  note?: string;
}

/** Risk tiers used across the product. Conservative < Balanced < Advanced. */
export type RiskTier = "Conservative" | "Balanced" | "Advanced";

/** How a strategy can be executed. */
export type ExecutionPath = "fsa" | "evm" | "both";

/** Vault types supported by the Flare Smart Accounts MasterAccountController. */
export type VaultType = "firelight" | "upshift";

/** A strategy's availability on the active network. */
export type StrategyAvailability = "live" | "reference-only";

/** Verified on-chain vault information (resolved from the FSA vault registry). */
export interface StrategyVault {
  /** vaultId as registered in LuminaStrategyRegistry / the FSA vault registry. */
  vaultId: number;
  type: VaultType;
  /** Contract address on Coston2. */
  address: `0x${string}`;
  name: string;
  symbol: string;
  /** Registry risk score (1–5), mirrors LuminaStrategyRegistry record. */
  riskScore?: number;
  /** Registry APY range string, mirrors LuminaStrategyRegistry record. */
  apyRange?: string;
}

/** Honest yield presentation: range + recency + provenance. Never a single glossy number. */
export interface YieldContext {
  /**
   * Human-readable summary, e.g.
   * "Since vault launch on Coston2 the share price has appreciated ~5.9% (testnet data)."
   */
  summary: string;
  /** Optional historical APY range, always with a clear label of what it refers to. */
  range?: {
    low: number;
    high: number;
    /** e.g. "mainnet marketing range (reference only)" */
    sourceLabel: string;
  };
  /** On-chain share-price growth since a reference point, if derivable. */
  sharePriceGrowth?: {
    percent: number;
    since: string;
    isTestnet: boolean;
  };
  /** True when the number above is derived from live on-chain data on Coston2. */
  derivedFromOnChain: boolean;
}

export interface Strategy {
  id: string;
  name: string;
  protocol: string;
  /** Who publishes / operates this strategy (transparency). */
  publisher: Publisher;
  /** One or two sentences, plain language. */
  description: string;
  risk: RiskTier;
  /** Transparent risk notes — always shown, never hidden. */
  riskNotes: string[];
  yieldContext: YieldContext;
  /** TVL / liquidity signal on Coston2 (from on-chain totalAssets where available). */
  tvlSignal?: string;
  /** On-chain verified vault(s) for this strategy on Coston2. */
  vault: StrategyVault | null;
  /** Live on Coston2, or mainnet reference only. */
  availability: StrategyAvailability;
  availabilityNote?: string;
  preferredPath: ExecutionPath;
  externalUrl?: string;
  /** When the vault is live on Coston2, this is the asset token it accepts. */
  asset?: {
    symbol: string;
    decimals: number;
    address: `0x${string}`;
  };
}

/** A user position inside a strategy vault. */
export interface VaultPosition {
  strategyId: string;
  vault: StrategyVault;
  /** Share balance held by the user (in vault decimals). */
  shares: bigint;
  /** Asset balance the shares are worth (in asset decimals). */
  assets: bigint;
  /** Exchange rate: assets per 1 share unit, scaled by 1e6 (from on-chain convertToAssets). */
  sharePrice: bigint;
}

/** A detected position of the user on Coston2. */
export interface Position {
  id: string;
  kind: "fxrp-balance" | "vault-shares";
  strategyId?: string;
  tokenSymbol: string;
  tokenAddress: `0x${string}`;
  decimals: number;
  balance: bigint;
  /** For vault positions: what the shares are worth in underlying asset. */
  valueInAsset?: bigint;
  vault?: StrategyVault;
  updatedAt: number;
}

/** User risk preferences from the onboarding questionnaire. */
export interface RiskPreferences {
  riskTolerance: RiskTier;
  /** Accepts withdrawal queues / lock-up periods. */
  lockupComfort: "none" | "some" | "comfortable";
  /** Prefers simplest possible path. */
  simplicity: boolean;
}

/** A ranked recommendation produced by the recommendation engine. */
export interface Recommendation {
  strategyId: string;
  rank: number;
  /** Plain-language reason this strategy was ranked here. */
  reason: string;
  matchScore: number;
}
