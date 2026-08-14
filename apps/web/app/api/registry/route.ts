import { createPublicClient, http } from "viem";
import {
  ACTIVE_NETWORK,
  formatApyRange,
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
 * vault and the catalog cross-check with publisher info. Everything is a
 * live read from the active Flare network; nothing is hardcoded.
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
          chainId: ACTIVE_NETWORK.chainId,
          network: ACTIVE_NETWORK.networkId,
        },
        vaults,
        catalog: STRATEGIES.map((s) => ({
          id: s.id,
          name: s.name,
          protocol: s.protocol,
          availability: s.availability,
          publisher: {
            name: s.publisher.name,
            handle: s.publisher.handle,
            verified: s.publisher.verified,
          },
        })),
        compare: STRATEGIES.map((s) => {
          const total = s.vault ? live.totals[s.vault.address.toLowerCase()] ?? 0n : 0n;
          return {
            id: s.id,
            name: s.name,
            protocol: s.protocol,
            risk: s.risk,
            availability: s.availability,
            preferredPath: s.preferredPath,
            publisher: {
              name: s.publisher.name,
              handle: s.publisher.handle,
              verified: s.publisher.verified,
            },
            yieldRange: s.yieldContext.range
              ? formatApyRange(s.yieldContext.range.low, s.yieldContext.range.high)
              : null,
            yieldRangeSource: s.yieldContext.range?.sourceLabel ?? null,
            totalAssetsFormatted: s.vault ? formatUnitsValue(total, 6) : null,
            vaultId: s.vault?.vaultId ?? null,
          };
        }),
        source: `live read from LuminaStrategyRegistry + vault contracts on ${ACTIVE_NETWORK.label}`,
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
        error: `Could not read the registry on ${ACTIVE_NETWORK.label} right now.`,
        detail: (e as Error).message,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
