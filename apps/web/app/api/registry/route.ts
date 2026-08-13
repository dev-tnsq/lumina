import { createPublicClient, http } from "viem";
import {
  COSTON2,
  formatUnitsValue,
  readRegistryWithTotals,
  STRATEGIES,
} from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = createPublicClient({ chain: coston2, transport: http() });

/**
 * Public registry API — "Powered by Lumina".
 *
 * Returns the live LuminaStrategyRegistry records (the on-chain source of
 * truth for what Lumina considers executable) plus real totalAssets per
 * vault and the catalog cross-check. Everything is a live read from Coston2;
 * nothing is hardcoded.
 *
 *   GET /api/registry
 */
export async function GET() {
  try {
    const live = await readRegistryWithTotals(client);

    const vaults = live.records.map((r) => {
      const total = live.totals[r.address.toLowerCase()];
      return {
        vaultId: r.vaultId,
        address: r.address,
        name: r.name,
        symbol: r.symbol,
        kind: r.kind,
        riskScore: r.riskScore,
        apyRange: r.apyRange,
        metadataURI: r.metadataURI,
        active: r.active,
        totalAssets: total != null ? total.toString() : null,
        totalAssetsFormatted:
          total != null ? formatUnitsValue(total, 6) : null,
      };
    });

    return Response.json(
      {
        schema: "lumina.registry/v1",
        registry: {
          address: live.address,
          owner: live.owner,
          vaultCount: live.vaultCount,
          activeCount: live.activeCount,
          chainId: COSTON2.chainId,
          network: COSTON2.networkId,
        },
        vaults,
        catalog: STRATEGIES.map((s) => ({
          id: s.id,
          name: s.name,
          protocol: s.protocol,
          availability: s.availability,
        })),
        source: "live read from LuminaStrategyRegistry + vault contracts on Coston2",
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    return Response.json(
      {
        schema: "lumina.registry/v1",
        error: "Could not read the registry on Coston2 right now.",
        detail: (e as Error).message,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
