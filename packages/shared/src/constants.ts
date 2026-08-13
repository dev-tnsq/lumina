/**
 * Lumina constants — every address in this file was verified on-chain against
 * the Flare Contract Registry and live contracts on Coston2 (2026-08-14).
 */

/** FlareContractRegistry — same address on every Flare network. */
export const FLARE_CONTRACT_REGISTRY = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as const;

/** Flare Coston2 — the ONLY network Lumina operates on (testnet-first). */
export const COSTON2 = {
  chainId: 114,
  name: "Flare Testnet Coston2",
  shortName: "Coston2",
  networkId: "coston2" as const,
  rpcUrl: "https://coston2-api.flare.network/ext/C/rpc",
  explorer: "https://coston2-explorer.flare.network",
  faucetUrl: "https://faucet.flare.network/",
  nativeCurrency: {
    name: "Coston2 FLR",
    symbol: "C2FLR",
    decimals: 18,
  },
} as const;

/**
 * Flare mainnet — NOT enabled in the product. Kept for documentation and for
 * future reference only. Lumina is testnet-only.
 */
export const FLARE_MAINNET = {
  chainId: 14,
  name: "Flare",
  networkId: "mainnet",
  rpcUrl: "https://flare-api.flare.network/ext/C/rpc",
  explorer: "https://flare-explorer.flare.network",
} as const;

/** XRPL testnet (used only by the FSA guided path — the user signs there). */
export const XRPL_TESTNET = {
  name: "XRPL Testnet",
  server: "wss://s.altnet.rippletest.net:51233",
  faucetUrl: "https://faucet.xrpl.org",
} as const;

/**
 * Coston2 contract addresses (verified on-chain from the registry):
 * - FlareContractRegistry.getContractAddressByName(...)
 * - AssetManagerFXRP.fAsset() for the FTestXRP token
 */
export const COSTON2_CONTRACTS = {
  flareContractRegistry: FLARE_CONTRACT_REGISTRY,
  flareAssetRegistry: "0xC79E6Dc1817DddcB4206a0aDbb56832F476F4b67",
  assetManagerController: "0x1C772F700308aF4c13897cc7b9c41EFfB82c50C0",
  assetManagerFXRP: "0xc1Ca88b937d0b528842F95d5731ffB586f4fbDFA",
  /** Flare Smart Accounts MasterAccountController (diamond). */
  masterAccountController: "0x434936d47503353f06750Db1A444DBDC5F0AD37c",
  delegationAccountManager: "0x5Ddb590530EF66775E6225671eaBD94959e9AE0e",
  /** FXRP test token (FTestXRP), 6 decimals. */
  fxrp: "0x0b6A3645c240605887a5532109323A3E12273dc7",
  /**
   * LuminaStrategyRegistry — Lumina's own on-chain vault registry, deployed
   * by Lumina on Coston2 (2026-08-14). The single source of truth for which
   * vaults Lumina considers registered/executable. Vaults below mirror the
   * records in this contract (getVaults()).
   */
  luminaStrategyRegistry: "0x36d0B0617e02690373AA521b8E978a62321295D7",
} as const;

/**
 * Vaults registered in LuminaStrategyRegistry on Coston2
 * (verified via getVaults() on the deployed registry, 2026-08-14).
 * Fields mirror the registry records; riskScore/apyRange live on-chain too.
 */
export const COSTON2_VAULTS = [
  {
    vaultId: 1,
    type: "firelight" as const,
    address: "0xC90D6847747b85d1fa2E07859869fb9fB72c0361",
    name: "Firelight stXRP",
    symbol: "stXRP",
    riskScore: 2,
    apyRange: "3.00% - 8.00%",
  },
  {
    vaultId: 2,
    type: "upshift" as const,
    address: "0x9E63a5D282F2fBb7DcE822B98e363b2719D28319",
    name: "Clearstar earnXRP (test)",
    symbol: "TESTearnXRP",
    riskScore: 3,
    apyRange: "4.00% - 12.00%",
  },
  {
    vaultId: 3,
    type: "upshift" as const,
    address: "0x4066A1363a04ce3B23eEcB53dEfa65f94A24355E",
    name: "Upshift stXRP (test)",
    symbol: "TESTstXRP",
    riskScore: 3,
    apyRange: "4.00% - 12.00%",
  },
  {
    vaultId: 4,
    type: "upshift" as const,
    address: "0xD91324A6e8884147F6425E9ddd60e11Aea060B5b",
    name: "Upshift stXRP (test)",
    symbol: "TESTstXRP",
    riskScore: 3,
    apyRange: "4.00% - 12.00%",
  },
] as const;

/** FAsset lot size on Coston2 (from AssetManagerFXRP.lotSize()). */
export const FXRP_LOT_SIZE = 10_000_000n; // 10 FXRP, in 6-decimal units

/** Coston2 faucet daily allowance (official: 100 C2FLR, 10 FXRP, 10 USDT0). */
export const FAUCET_ALLOWANCE = {
  c2flr: "100",
  fxrp: "10",
  usdt0: "10",
  period: "24 hours",
} as const;

/** Reference yield ranges from public sources (mainnet marketing data — reference only). */
export const REFERENCE_YIELD = {
  clearstarEarnXrp: { low: 4, high: 12, source: "Upshift/Clearstar marketing material (mainnet)" },
  firelight: { low: 3, high: 8, source: "Firelight public communications (mainnet)" },
  monarq: { low: 8, high: 20, source: "Monarq marketing material (mainnet)" },
} as const;
