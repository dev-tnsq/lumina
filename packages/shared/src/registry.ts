import { type PublicClient, getAddress } from "viem";
import { LUMINA_STRATEGY_REGISTRY_ABI, VAULT_ABI } from "./abis";
import { COSTON2_CONTRACTS } from "./constants";

/**
 * LuminaStrategyRegistry — the on-chain source of truth for which vaults
 * Lumina considers registered / executable. These helpers read the live
 * contract on Coston2 so every number is a real read, never a constant.
 */

export interface RegistryVaultRecord {
  vaultId: number;
  address: `0x${string}`;
  name: string;
  symbol: string;
  kind: number;
  riskScore: number;
  apyRange: string;
  metadataURI: string;
  active: boolean;
}

export interface RegistryLive {
  address: `0x${string}`;
  owner: `0x${string}`;
  vaultCount: number;
  activeCount: number;
  records: RegistryVaultRecord[];
}

export async function readRegistryLive(client: PublicClient): Promise<RegistryLive> {
  const address = COSTON2_CONTRACTS.luminaStrategyRegistry;
  const [owner, vaultCount, records] = await Promise.all([
    client.readContract({
      address,
      abi: LUMINA_STRATEGY_REGISTRY_ABI,
      functionName: "owner",
    }),
    client.readContract({
      address,
      abi: LUMINA_STRATEGY_REGISTRY_ABI,
      functionName: "vaultCount",
    }),
    client.readContract({
      address,
      abi: LUMINA_STRATEGY_REGISTRY_ABI,
      functionName: "getVaults",
    }),
  ]);

  const normalized: RegistryVaultRecord[] = records.map((r) => ({
    vaultId: Number(r.vaultId),
    address: getAddress(r.vault),
    name: r.name,
    symbol: r.symbol,
    kind: Number(r.kind),
    riskScore: Number(r.riskScore),
    apyRange: r.apyRange,
    metadataURI: r.metadataURI,
    active: r.active,
  }));

  return {
    address,
    owner: getAddress(owner as `0x${string}`),
    vaultCount: Number(vaultCount),
    activeCount: normalized.filter((r) => r.active).length,
    records: normalized,
  };
}

/** Registry records plus live totalAssets per active vault (real chain reads). */
export async function readRegistryWithTotals(
  client: PublicClient
): Promise<RegistryLive & { totals: Record<string, bigint> }> {
  const live = await readRegistryLive(client);
  const entries = await Promise.all(
    live.records
      .filter((r) => r.active)
      .map(async (r) => {
        try {
          const totalAssets = (await client.readContract({
            address: r.address,
            abi: VAULT_ABI,
            functionName: "totalAssets",
          })) as bigint;
          return [r.address.toLowerCase(), totalAssets] as const;
        } catch {
          return [r.address.toLowerCase(), 0n] as const;
        }
      })
  );
  return { ...live, totals: Object.fromEntries(entries) };
}

/** Sum of totalAssets across all active registered vaults. */
export function totalRegisteredAssets(
  live: RegistryLive & { totals: Record<string, bigint> }
): bigint {
  return live.records
    .filter((r) => r.active)
    .reduce((sum, r) => sum + (live.totals[r.address.toLowerCase()] ?? 0n), 0n);
}
