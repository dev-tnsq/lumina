"use client";

import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import {
  COSTON2_CONTRACTS,
  LUMINA_STRATEGY_REGISTRY_ABI,
  shortenAddress,
  type Strategy,
} from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";
import { RiskBadge } from "@/components/RiskBadge";

const publicClient = createPublicClient({
  chain: coston2,
  transport: http(),
});

/** Map the registry's 1–5 risk score onto the product's risk tiers. */
function tierForScore(score: number): "Conservative" | "Balanced" | "Advanced" {
  if (score <= 2) return "Conservative";
  if (score === 3) return "Balanced";
  return "Advanced";
}

interface RegistryRecord {
  vaultId: bigint;
  vault: `0x${string}`;
  name: string;
  symbol: string;
  kind: number;
  riskScore: number;
  apyRange: string;
  metadataURI: string;
  active: boolean;
}

/**
 * Live read of LuminaStrategyRegistry on Coston2 — the on-chain source of
 * truth for which vaults Lumina considers registered. Every vault shown on
 * this page can be cross-checked against this panel: if it's not in the
 * registry it's not executable, no matter what the marketing says.
 */
export function RegistryAudit({ strategies }: { strategies: Strategy[] }) {
  const query = useQuery({
    queryKey: ["registry-audit", COSTON2_CONTRACTS.luminaStrategyRegistry],
    queryFn: async () => {
      const [records, owner, count] = await Promise.all([
        publicClient.readContract({
          address: COSTON2_CONTRACTS.luminaStrategyRegistry as `0x${string}`,
          abi: LUMINA_STRATEGY_REGISTRY_ABI,
          functionName: "getActiveVaults",
        }),
        publicClient.readContract({
          address: COSTON2_CONTRACTS.luminaStrategyRegistry as `0x${string}`,
          abi: LUMINA_STRATEGY_REGISTRY_ABI,
          functionName: "owner",
        }),
        publicClient.readContract({
          address: COSTON2_CONTRACTS.luminaStrategyRegistry as `0x${string}`,
          abi: LUMINA_STRATEGY_REGISTRY_ABI,
          functionName: "vaultCount",
        }),
      ]);
      return { records: records as unknown as RegistryRecord[], owner, count };
    },
  });

  const catalogAddresses = new Set(
    strategies
      .map((s) => s.vault?.address as `0x${string}` | undefined)
      .filter((a): a is `0x${string}` => Boolean(a))
      .map((a) => a.toLowerCase())
  );

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="micro">On-chain registry</h2>
        <p className="font-mono text-[10px] text-muted">
          {shortenAddress(COSTON2_CONTRACTS.luminaStrategyRegistry, 6)}
        </p>
      </div>
      <p className="mt-1 max-w-2xl text-[13px] leading-snug text-muted">
        Live from LuminaStrategyRegistry on Coston2 — the contract that decides what
        Lumina considers executable. The catalog above is cross-checked against it.
      </p>

      {query.isPending && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-line/40" />
          ))}
        </div>
      )}

      {query.isError && (
        <div className="mt-4 rounded-2xl border border-warn/30 bg-warn/5 p-4 text-[13px] text-warn">
          Could not reach Coston2 right now. The registry read will retry once the RPC
          is reachable.
        </div>
      )}

      {query.data && (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {query.data.records.map((r) => {
            const inCatalog = catalogAddresses.has(r.vault.toLowerCase());
            return (
              <li key={r.vaultId.toString()} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink">
                      #{r.vaultId.toString()} · {r.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted">
                      {r.symbol} · {shortenAddress(r.vault)}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-snug text-muted">
                      {r.kind === 0 ? "Firelight" : "Upshift"} · APY range {r.apyRange}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <RiskBadge tier={tierForScore(r.riskScore)} size="sm" />
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                        inCatalog
                          ? "bg-brand/10 text-brand"
                          : "bg-gold-soft text-gold"
                      }`}
                    >
                      {inCatalog ? "in catalog" : "registry only"}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
          {query.data.records.length === 0 && (
            <li className="card p-4 text-[13px] text-muted">
              No active vaults registered on-chain.
            </li>
          )}
        </ul>
      )}

      {query.data && (
        <p className="mt-3 font-mono text-[10px] text-muted">
          owner {shortenAddress(query.data.owner)} · {query.data.count.toString()} vaults
          total · read live from Coston2
        </p>
      )}
    </section>
  );
}
