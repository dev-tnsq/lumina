/**
 * Lumina constants — derived from the active deployment configuration
 * (see ./networks.ts). Every address was verified on-chain against the Flare
 * Contract Registry and live contracts on Coston2 (2026-08-14).
 *
 * The names below are kept for backwards compatibility, but they now follow
 * the ACTIVE network, not "Coston2" specifically. To switch networks you
 * change NEXT_PUBLIC_LUMINA_NETWORK — nothing in the codebase hardcodes a
 * network anymore.
 */

import {
  ACTIVE_LUMINA_NETWORK,
  LUMINA_NETWORKS,
  type LuminaNetwork,
} from "./networks";

/** The Flare network Lumina is currently deployed on / reading from. */
export const ACTIVE_NETWORK: LuminaNetwork = ACTIVE_LUMINA_NETWORK;

/** True when Lumina's own contracts are deployed on the active network. */
export const LUMINA_DEPLOYED: boolean = ACTIVE_LUMINA_NETWORK.deployed;

/** FlareContractRegistry — same address on every Flare network. */
export const FLARE_CONTRACT_REGISTRY: `0x${string}` =
  ACTIVE_LUMINA_NETWORK.contracts.flareContractRegistry;

/** The active Flare network definition (kept for compatibility). */
export const COSTON2: LuminaNetwork = LUMINA_NETWORKS.coston2;

/** Flare mainnet definition — the target for the mainnet switch. */
export const FLARE_MAINNET: LuminaNetwork = LUMINA_NETWORKS["flare-mainnet"];

/** The XRPL network that pairs with the active Flare network (FSA path). */
export const XRPL_TESTNET: LuminaNetwork["xrpl"] = ACTIVE_LUMINA_NETWORK.xrpl;

/** Lumina's contract addresses on the active network. */
export const COSTON2_CONTRACTS: LuminaNetwork["contracts"] = ACTIVE_LUMINA_NETWORK.contracts;

/** Vaults registered in LuminaStrategyRegistry on the active network. */
export const COSTON2_VAULTS: LuminaNetwork["vaults"] = ACTIVE_LUMINA_NETWORK.vaults;

/** FAsset lot size on the active network (from AssetManagerFXRP.lotSize()). */
export const FXRP_LOT_SIZE: bigint = ACTIVE_LUMINA_NETWORK.fxrpLotSize;

/** Faucet allowance on the active network, when one exists. */
export const FAUCET_ALLOWANCE: LuminaNetwork["faucetAllowance"] =
  ACTIVE_LUMINA_NETWORK.faucetAllowance;

/** All supported network ids (for tooling / selectors). */
export { LUMINA_NETWORKS, type LuminaNetworkId } from "./networks";

/** Reference yield ranges from public protocol sources — shown as context, never as a promise. */
export const REFERENCE_YIELD = {
  clearstarEarnXrp: { low: 4, high: 12, source: "Upshift/Clearstar marketing material" },
  firelight: { low: 3, high: 8, source: "Firelight public communications" },
  monarq: { low: 8, high: 20, source: "Monarq marketing material" },
} as const;
