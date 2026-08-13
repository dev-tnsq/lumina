import { type PublicClient, getAddress } from "viem";
import { ASSET_MANAGER_FXRP_ABI, ERC20_ABI } from "./abis";
import { COSTON2_CONTRACTS } from "./constants";
import { getContractAddressByName } from "./flare";

/**
 * FAssets system reads — the minted-token layer of FAssets on Coston2,
 * resolved via the FlareContractRegistry at runtime (per Flare's guidance).
 *
 * Honesty note: Coston2's registry does not expose the v2 agent/collateral
 * layer (FlareAgentManager etc.), so Lumina only reports what is verifiable
 * on-chain: the FXRP token, its supply, and the asset-manager parameters.
 */

export interface FxrpTokenInfo {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export interface FxrpSystem {
  assetManager: `0x${string}`;
  lotSize: bigint;
  mintingDecimals: number;
  token: FxrpTokenInfo | null;
}

export async function readFxrpSystem(client: PublicClient): Promise<FxrpSystem> {
  const assetManager = await getContractAddressByName(client, "AssetManagerFXRP");
  const [lotSize, mintingDecimals, fAsset] = await Promise.all([
    client.readContract({
      address: assetManager,
      abi: ASSET_MANAGER_FXRP_ABI,
      functionName: "lotSize",
    }),
    client.readContract({
      address: assetManager,
      abi: ASSET_MANAGER_FXRP_ABI,
      functionName: "assetMintingDecimals",
    }),
    client.readContract({
      address: assetManager,
      abi: ASSET_MANAGER_FXRP_ABI,
      functionName: "fAsset",
    }),
  ]);

  let token: FxrpTokenInfo | null = null;
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      client.readContract({ address: fAsset, abi: ERC20_ABI, functionName: "name" }),
      client.readContract({ address: fAsset, abi: ERC20_ABI, functionName: "symbol" }),
      client.readContract({ address: fAsset, abi: ERC20_ABI, functionName: "decimals" }),
      client.readContract({ address: fAsset, abi: ERC20_ABI, functionName: "totalSupply" }),
    ]);
    token = {
      address: getAddress(fAsset),
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply as bigint,
    };
  } catch {
    // Token unreadable right now — keep it honest and leave token null.
  }

  return {
    assetManager,
    lotSize: lotSize as bigint,
    mintingDecimals: Number(mintingDecimals),
    token,
  };
}

/** Share (0..1) of the FXRP supply currently held inside registered vaults. */
export function vaultShareOfSupply(
  totalInVaults: bigint,
  totalSupply: bigint
): number | null {
  if (totalSupply <= 0n) return null;
  return Number((totalInVaults * 10_000n) / totalSupply) / 100;
}
