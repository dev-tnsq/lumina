/**
 * Lumina deployment configuration.
 *
 * This file is the single place that knows which network Lumina runs on and
 * where its contracts live. EVERYTHING else in the product reads from here —
 * RPC endpoints, explorers, faucets, the XRPL endpoint, contract addresses,
 * registered vaults and lot sizes. Nothing network-specific is hardcoded
 * anywhere else.
 *
 * Switching networks is a deployment operation, not a code change:
 *   1. Deploy the Lumina contracts on the target network.
 *   2. Fill in the addresses in LUMINA_NETWORKS.<id>.contracts.
 *   3. Set `deployed: true` and adjust the deployment note.
 *   4. Run the app with NEXT_PUBLIC_LUMINA_NETWORK=<id> (default: coston2).
 *
 * The active network is chosen by `NEXT_PUBLIC_LUMINA_NETWORK` (a public
 * value — it is not a secret). It defaults to `coston2`.
 */

export type LuminaNetworkId = "coston2" | "flare-mainnet";

export interface LuminaContracts {
  /** FlareContractRegistry — the same address on every Flare network. */
  flareContractRegistry: `0x${string}`;
  flareAssetRegistry: `0x${string}`;
  assetManagerController: `0x${string}`;
  assetManagerFXRP: `0x${string}`;
  /** Flare Smart Accounts MasterAccountController (diamond). */
  masterAccountController: `0x${string}`;
  delegationAccountManager: `0x${string}`;
  /** The FAsset FXRP token (FTestXRP on Coston2, FXRP on mainnet), 6 decimals. */
  fxrp: `0x${string}`;
  /**
   * LuminaStrategyRegistry — Lumina's own on-chain vault registry. The single
   * source of truth for which vaults Lumina considers registered/executable.
   * This is the contract you deploy on a new network.
   */
  luminaStrategyRegistry: `0x${string}`;
}

export interface LuminaRegisteredVault {
  vaultId: number;
  type: "firelight" | "upshift";
  address: `0x${string}`;
  name: string;
  symbol: string;
  /** Mirrors the LuminaStrategyRegistry record (1–5). */
  riskScore: number;
  /** Mirrors the LuminaStrategyRegistry record. */
  apyRange: string;
}

export interface LuminaNetwork {
  id: LuminaNetworkId;
  chainId: number;
  name: string;
  shortName: string;
  networkId: string;
  /**
   * Product-facing network label shown in the UI. Always the product name
   * ("Flare") regardless of the underlying test/mainnet network.
   */
  label: string;
  isTestnet: boolean;
  rpcUrl: string;
  explorer: string;
  explorerName: string;
  faucetUrl: string | null;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  /** The XRPL network that pairs with this Flare network (FSA path). */
  xrpl: {
    name: string;
    server: string;
    faucetUrl: string;
    isTestnet: boolean;
  };
  contracts: LuminaContracts;
  /** Vaults registered in LuminaStrategyRegistry on this network. */
  vaults: LuminaRegisteredVault[];
  /** FAsset lot size in 6-decimal units (e.g. 10 FXRP = 10_000_000). */
  fxrpLotSize: bigint;
  /** Faucet allowance info, or null when this network has no faucet. */
  faucetAllowance: {
    native: string;
    fxrp: string;
    usdt0: string;
    period: string;
  } | null;
  /**
   * Deployment state of Lumina's own contracts. When false, Lumina refuses to
   * read or execute anything (there is nothing deployed to read) and the UI
   * explains that the network is not deployed yet.
   */
  deployed: boolean;
  /** Shown in the UI to operators/users when `deployed` is false. */
  deploymentNote: string;
}

const ZERO = "0x0000000000000000000000000000000000000000";

/**
 * FlareContractRegistry — same address on every Flare network (documented by
 * Flare: it is identical across Coston, Coston2 and mainnet).
 */
const FLARE_CONTRACT_REGISTRY = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019" as const;

export const LUMINA_NETWORKS: Record<LuminaNetworkId, LuminaNetwork> = {
  coston2: {
    id: "coston2",
    chainId: 114,
    name: "Flare Testnet Coston2",
    shortName: "Coston2",
    networkId: "coston2",
    label: "Flare",
    isTestnet: true,
    rpcUrl: "https://coston2-api.flare.network/ext/C/rpc",
    explorer: "https://coston2-explorer.flare.network",
    explorerName: "Coston2 Explorer",
    faucetUrl: "https://faucet.flare.network/",
    nativeCurrency: { name: "Coston2 FLR", symbol: "C2FLR", decimals: 18 },
    xrpl: {
      name: "XRPL Testnet",
      server: "wss://s.altnet.rippletest.net:51233",
      faucetUrl: "https://faucet.xrpl.org",
      isTestnet: true,
    },
    contracts: {
      flareContractRegistry: FLARE_CONTRACT_REGISTRY,
      flareAssetRegistry: "0xC79E6Dc1817DddcB4206a0aDbb56832F476F4b67",
      assetManagerController: "0x1C772F700308aF4c13897cc7b9c41EFfB82c50C0",
      assetManagerFXRP: "0xc1Ca88b937d0b528842F95d5731ffB586f4fbDFA",
      masterAccountController: "0x434936d47503353f06750Db1A444DBDC5F0AD37c",
      delegationAccountManager: "0x5Ddb590530EF66775E6225671eaBD94959e9AE0e",
      fxrp: "0x0b6A3645c240605887a5532109323A3E12273dc7",
      // LuminaStrategyRegistry — deployed by Lumina on Coston2 (2026-08-14).
      luminaStrategyRegistry: "0x36d0B0617e02690373AA521b8E978a62321295D7",
    },
    vaults: [
      {
        vaultId: 1,
        type: "firelight",
        address: "0xC90D6847747b85d1fa2E07859869fb9fB72c0361",
        name: "Firelight stXRP",
        symbol: "stXRP",
        riskScore: 2,
        apyRange: "3.00% - 8.00%",
      },
      {
        vaultId: 2,
        type: "upshift",
        address: "0x9E63a5D282F2fBb7DcE822B98e363b2719D28319",
        name: "Clearstar earnXRP",
        symbol: "earnXRP",
        riskScore: 3,
        apyRange: "4.00% - 12.00%",
      },
      {
        vaultId: 3,
        type: "upshift",
        address: "0x4066A1363a04ce3B23eEcB53dEfa65f94A24355E",
        name: "Upshift stXRP",
        symbol: "stXRP",
        riskScore: 3,
        apyRange: "4.00% - 12.00%",
      },
      {
        vaultId: 4,
        type: "upshift",
        address: "0xD91324A6e8884147F6425E9ddd60e11Aea060B5b",
        name: "Upshift stXRP",
        symbol: "stXRP",
        riskScore: 3,
        apyRange: "4.00% - 12.00%",
      },
    ],
    fxrpLotSize: 10_000_000n, // 10 FXRP, in 6-decimal units
    faucetAllowance: { native: "100", fxrp: "10", usdt0: "10", period: "24 hours" },
    deployed: true,
    deploymentNote: "",
  },

  /**
   * Flare mainnet — structurally ready but NOT deployed. To go live:
   * deploy LuminaStrategyRegistry on mainnet, then fill in the contracts
   * below (the Flare-protocol addresses resolve via FlareContractRegistry at
   * runtime where possible; `fxrp` and `masterAccountController` are read
   * directly). Then set `deployed: true` and deploy the app with
   * NEXT_PUBLIC_LUMINA_NETWORK=flare-mainnet.
   */
  "flare-mainnet": {
    id: "flare-mainnet",
    chainId: 14,
    name: "Flare",
    shortName: "Flare",
    networkId: "mainnet",
    label: "Flare",
    isTestnet: false,
    rpcUrl: "https://flare-api.flare.network/ext/C/rpc",
    explorer: "https://flare-explorer.flare.network",
    explorerName: "Flare Explorer",
    faucetUrl: null,
    nativeCurrency: { name: "Flare", symbol: "FLR", decimals: 18 },
    xrpl: {
      name: "XRPL Mainnet",
      server: "wss://xrplcluster.com",
      faucetUrl: "",
      isTestnet: false,
    },
    contracts: {
      flareContractRegistry: FLARE_CONTRACT_REGISTRY,
      flareAssetRegistry: ZERO,
      assetManagerController: ZERO,
      assetManagerFXRP: ZERO,
      masterAccountController: ZERO,
      delegationAccountManager: ZERO,
      fxrp: ZERO,
      luminaStrategyRegistry: ZERO,
    },
    vaults: [],
    fxrpLotSize: 10_000_000n,
    faucetAllowance: null,
    deployed: false,
    deploymentNote:
      "Lumina is not deployed on Flare mainnet yet. Deploy LuminaStrategyRegistry, link the addresses in LUMINA_NETWORKS['flare-mainnet'] and redeploy.",
  },
};

export function getNetwork(id: LuminaNetworkId): LuminaNetwork {
  return LUMINA_NETWORKS[id];
}

/**
 * The active network. Read from NEXT_PUBLIC_LUMINA_NETWORK so it is inlined
 * identically into client and server bundles (public value, not a secret).
 * Falls back to Coston2 (testnet-first) when unset.
 */
export const ACTIVE_LUMINA_NETWORK: LuminaNetwork =
  LUMINA_NETWORKS[
    (process.env.NEXT_PUBLIC_LUMINA_NETWORK as LuminaNetworkId | undefined) ?? "coston2"
  ] ?? LUMINA_NETWORKS.coston2;
