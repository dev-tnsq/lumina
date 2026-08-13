"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import {
  formatCompact,
  formatUnitsValue,
  readFxrpSystem,
  readRegistryWithTotals,
  totalRegisteredAssets,
  vaultShareOfSupply,
} from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";

const publicClient = createPublicClient({ chain: coston2, transport: http() });

/**
 * FAssets system tracker — the minted-token layer of FAssets on Coston2,
 * read live from the chain. Honesty rule: if the registry doesn't expose a
 * contract (e.g. the v2 agent layer), Lumina says so instead of inventing it.
 */
export default function FAssetsPage() {
  const system = useQuery({
    queryKey: ["fassets-system"],
    queryFn: () => readFxrpSystem(publicClient),
    staleTime: 30_000,
  });

  const registry = useQuery({
    queryKey: ["fassets-registry"],
    queryFn: () => readRegistryWithTotals(publicClient),
    staleTime: 30_000,
  });

  const supply = system.data?.token?.totalSupply;
  const deployed = registry.data ? totalRegisteredAssets(registry.data) : null;
  const share =
    supply != null && deployed != null ? vaultShareOfSupply(deployed, supply) : null;

  const loading = system.isPending || registry.isPending;
  const error = system.isError || registry.isError;

  return (
    <div className="container-app py-10">
      <div className="max-w-3xl">
        <p className="micro flex items-center gap-2">
          <span className="pulse-dot" aria-hidden="true" />
          fassets · coston2 · live reads
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">FAssets system</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The minted-token layer of Flare&apos;s FAssets: how much FXRP exists, how the
          asset manager is configured, and what share of it is deployed through
          Lumina-registered vaults. Every number here is a live chain read.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-warn/30 bg-warn/5 p-4 text-[13px] text-warn">
          Could not reach Coston2 right now. The reads will retry once the RPC is
          reachable.
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="FXRP supply"
          value={
            system.data?.token
              ? formatCompact(system.data.token.totalSupply, system.data.token.decimals)
              : loading
                ? "reading…"
                : "—"
          }
          sub={
            system.data?.token
              ? `${formatUnitsValue(system.data.token.totalSupply, system.data.token.decimals)} ${system.data.token.symbol}`
              : "FTestXRP · 6 decimals"
          }
        />
        <StatCard
          label="Lot size"
          value={system.data ? formatUnitsValue(system.data.lotSize, 6) : loading ? "reading…" : "—"}
          sub="min mint per payment (FXRP)"
        />
        <StatCard
          label="FXRP in registered vaults"
          value={deployed != null ? formatCompact(deployed, 6) : loading ? "reading…" : "—"}
          sub="live totalAssets, registry-capped"
        />
        <StatCard
          label="Share of supply deployed"
          value={share != null ? `${share.toFixed(2)}%` : loading ? "reading…" : "—"}
          sub="vaults hold this % of all FXRP"
        />
      </div>

      {/* Vault deployment table */}
      <section className="mt-10">
        <h2 className="micro">Where the supply sits</h2>
        {registry.data && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-line/70">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line/70 bg-surface-2 font-mono text-[10px] uppercase tracking-wider text-muted">
                  <th className="px-4 py-2.5 font-semibold">vault</th>
                  <th className="px-4 py-2.5 font-semibold">registry id</th>
                  <th className="px-4 py-2.5 text-right font-semibold">total assets</th>
                  <th className="px-4 py-2.5 text-right font-semibold">share of supply</th>
                </tr>
              </thead>
              <tbody>
                {registry.data.records
                  .filter((r) => r.active)
                  .map((r) => {
                    const total = registry.data!.totals[r.address.toLowerCase()] ?? 0n;
                    const rowShare =
                      supply && supply > 0n
                        ? ((Number((total * 10_000n) / supply) / 100).toFixed(2))
                        : "—";
                    return (
                      <tr key={r.vaultId} className="border-b border-line/50 last:border-0">
                        <td className="px-4 py-3">
                          <Link
                            href={`/strategies/${strategyIdForVault(r.address)}`}
                            className="font-semibold text-ink transition-colors hover:text-brand"
                          >
                            {r.name}
                          </Link>
                          <p className="font-mono text-[11px] text-muted">{r.symbol}</p>
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] text-muted">
                          #{r.vaultId}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                          {formatUnitsValue(total, 6)} FXRP
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-muted">
                          {rowShare}%
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Honesty note + API */}
      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <p className="micro">What we don&apos;t report</p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            FAssets v2&apos;s agent and collateral layer (FlareAgentManager and friends)
            is not exposed on the Coston2 contract registry, so Lumina does not publish
            agent-health or collateralization numbers here. We only report what we can
            verify on-chain — the minted-token layer above.
          </p>
        </div>
        <div className="card p-5">
          <p className="micro">Machine-readable</p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            This data is also a public API for other Flare apps — the registry, live
            totals and an is-executable check:
          </p>
          <ul className="mt-3 space-y-1.5 font-mono text-[12px] text-brand">
            <li>
              <a href="/api/registry" className="hover:underline">GET /api/registry</a>
            </li>
            <li>
              <a href="/api/verify?address=0x9E63a5D282F2fBb7DcE822B98e363b2719D28319" className="hover:underline">
                GET /api/verify?address=…
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card p-5">
      <p className="micro">{label}</p>
      <p className="mt-2 font-mono text-2xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-[12px] leading-snug text-muted">{sub}</p>
    </div>
  );
}

function strategyIdForVault(vaultAddress: `0x${string}`): string {
  const map: Record<string, string> = {
    "0xc90d6847747b85d1fa2e07859869fb9fb72c0361": "firelight-stxrp",
    "0x9e63a5d282f2fbb7dce822b98e363b2719d28319": "clearstar-earnxrp",
    "0x4066a1363a04ce3b23eecb53defa65f94a24355e": "upshift-stxrp",
    "0xd91324a6e8884147f6425e9ddd60e11aea060b5b": "upshift-stxrp",
  };
  return map[vaultAddress.toLowerCase()] ?? "/strategies";
}
