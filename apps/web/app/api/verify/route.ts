import { createPublicClient, getAddress, http, isAddress } from "viem";
import { readRegistryLive, STRATEGIES } from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = createPublicClient({ chain: coston2, transport: http() });

/**
 * Verify endpoint — "is this vault executable on Lumina?"
 *
 *   GET /api/verify?address=0x…
 *
 * Returns whether the address is registered in LuminaStrategyRegistry and
 * whether it matches a Lumina catalog strategy. Useful for other Flare apps
 * that want to show only executable vaults.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("address") ?? "";
  const address = raw.trim().toLowerCase();

  if (!isAddress(address)) {
    return Response.json(
      { schema: "lumina.verify/v1", error: "Invalid address. Use ?address=0x…" },
      { status: 400 }
    );
  }

  try {
    const live = await readRegistryLive(client);
    const record =
      live.records.find((r) => r.address.toLowerCase() === address) ?? null;

    const catalogMatch = record
      ? STRATEGIES.find(
          (s) => s.vault?.address.toLowerCase() === record.address.toLowerCase()
        ) ?? null
      : null;

    return Response.json(
      {
        schema: "lumina.verify/v1",
        address: getAddress(address),
        registered: record != null,
        active: record?.active ?? false,
        record: record
          ? {
              vaultId: record.vaultId,
              name: record.name,
              symbol: record.symbol,
              riskScore: record.riskScore,
              apyRange: record.apyRange,
            }
          : null,
        inCatalog: catalogMatch != null,
        catalogStrategy: catalogMatch
          ? {
              id: catalogMatch.id,
              name: catalogMatch.name,
              risk: catalogMatch.risk,
              executable: catalogMatch.availability === "live",
            }
          : null,
        source: "live read from LuminaStrategyRegistry on Coston2",
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
        schema: "lumina.verify/v1",
        error: "Could not read the registry on Coston2 right now.",
        detail: (e as Error).message,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
