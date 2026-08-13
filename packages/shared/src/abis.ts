/**
 * Minimal ABIs for the Flare contracts Lumina reads on Coston2.
 * Selectors verified against the live contracts on Coston2 (2026-08-14).
 */

export const FLARE_CONTRACT_REGISTRY_ABI = [
  {
    type: "function",
    name: "getContractAddressByName",
    stateMutability: "view",
    inputs: [{ type: "string", name: "_name" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "getAllContracts",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { type: "string[]" },
      { type: "address[]" },
    ],
  },
] as const;

export const ASSET_MANAGER_FXRP_ABI = [
  {
    type: "function",
    name: "fAsset",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "lotSize",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "assetMintingDecimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "assetMintingGranularityUBA",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export const MASTER_ACCOUNT_CONTROLLER_ABI = [
  {
    type: "function",
    name: "getPersonalAccount",
    stateMutability: "view",
    inputs: [{ type: "string", name: "_xrplOwner" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "getVaults",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { type: "uint256[]" },
      { type: "address[]" },
      { type: "uint8[]" },
    ],
  },
  {
    type: "function",
    name: "getNonce",
    stateMutability: "view",
    inputs: [{ type: "address", name: "_personalAccount" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getExecutor",
    stateMutability: "view",
    inputs: [{ type: "address", name: "_personalAccount" }],
    outputs: [{ type: "address" }],
  },
] as const;

/** ERC-4626 style vault interface (Upshift + Firelight share the core view methods). */
export const VAULT_ABI = [
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "asset",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "convertToAssets",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "shares" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "convertToShares",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "assets" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "previewDeposit",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "assets" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "previewRedeem",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "shares" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "assets" },
      { type: "address", name: "receiver" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "redeem",
    stateMutability: "nonpayable",
    inputs: [
      { type: "uint256", name: "shares" },
      { type: "address", name: "receiver" },
      { type: "address", name: "owner" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

/**
 * LuminaStrategyRegistry — the on-chain registry Lumina owns and curates.
 * Deployed on Coston2 at COSTON2_CONTRACTS.luminaStrategyRegistry (2026-08-14).
 * The strategies page reads getActiveVaults() live from this contract so the
 * executable catalog is never a static hardcode.
 */
export const LUMINA_STRATEGY_REGISTRY_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "vaultCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "isRegistered",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "vaultId" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getVault",
    stateMutability: "view",
    inputs: [{ type: "uint256", name: "vaultId" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { type: "uint64", name: "vaultId" },
          { type: "address", name: "vault" },
          { type: "string", name: "name" },
          { type: "string", name: "symbol" },
          { type: "uint8", name: "kind" },
          { type: "uint8", name: "riskScore" },
          { type: "string", name: "apyRange" },
          { type: "string", name: "metadataURI" },
          { type: "bool", name: "active" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getVaults",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { type: "uint64", name: "vaultId" },
          { type: "address", name: "vault" },
          { type: "string", name: "name" },
          { type: "string", name: "symbol" },
          { type: "uint8", name: "kind" },
          { type: "uint8", name: "riskScore" },
          { type: "string", name: "apyRange" },
          { type: "string", name: "metadataURI" },
          { type: "bool", name: "active" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getActiveVaults",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { type: "uint64", name: "vaultId" },
          { type: "address", name: "vault" },
          { type: "string", name: "name" },
          { type: "string", name: "symbol" },
          { type: "uint8", name: "kind" },
          { type: "uint8", name: "riskScore" },
          { type: "string", name: "apyRange" },
          { type: "string", name: "metadataURI" },
          { type: "bool", name: "active" },
        ],
      },
    ],
  },
] as const;

export const FLARE_ASSET_REGISTRY_ABI = [
  {
    type: "function",
    name: "assetBySymbol",
    stateMutability: "view",
    inputs: [{ type: "string", name: "symbol" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "isFlareAsset",
    stateMutability: "view",
    inputs: [{ type: "address", name: "token" }],
    outputs: [{ type: "bool" }],
  },
] as const;
