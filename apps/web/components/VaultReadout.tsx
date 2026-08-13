"use client";

import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import type { StrategyVault } from "@lumina/shared";
import { VAULT_ABI } from "@lumina/shared";
import { formatCompact, shortenAddress } from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";

const publicClient = createPublicClient({ chain: coston2, transport: http() });

/** On-chain readout for a single vault: address, share price, total assets. */
export function VaultReadout({
  vault,
  assetSymbol,
}: {
  vault: StrategyVault;
  assetSymbol: string;
}) {
  const query = useQuery({
    queryKey: ["vault-readout", vault.address],
    queryFn: async () => {
      const [totalAssets, totalSupply, decimals] = await Promise.all([
        publicClient.readContract({
          address: vault.address,
          abi: VAULT_ABI,
          functionName: "totalAssets",
        }) as Promise<bigint>,
        publicClient.readContract({
          address: vault.address,
          abi: VAULT_ABI,
          functionName: "totalSupply",
        }) as Promise<bigint>,
        publicClient.readContract({
          address: vault.address,
          abi: VAULT_ABI,
          functionName: "decimals",
        }) as Promise<number>,
      ]);
      return { totalAssets, totalSupply, decimals };
    },
  });

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <h2 className="text-sm font-semibold text-ink">Vault on Coston2</h2>

      <dl className="mt-2 space-y-1.5 text-[13px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Address</dt>
          <dd className="font-mono text-ink">{shortenAddress(vault.address, 6)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">vaultId</dt>
          <dd className="font-mono text-ink">{vault.vaultId}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Asset</dt>
          <dd className="text-ink">{assetSymbol}</dd>
        </div>
      </dl>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-paper p-3">
          <p className="text-[11px] text-muted">Total assets (on-chain)</p>
          {query.data ? (
            <p className="mt-0.5 text-base font-bold text-ink">
              {formatCompact(query.data.totalAssets, 6)} {assetSymbol}
            </p>
          ) : query.isError ? (
            <p className="mt-0.5 text-sm font-semibold text-warn">Unreachable</p>
          ) : (
            <p className="mt-0.5 h-5 w-20 animate-pulse rounded bg-line/60" />
          )}
        </div>
        <div className="rounded-xl bg-paper p-3">
          <p className="text-[11px] text-muted">Shares outstanding</p>
          {query.data ? (
            <p className="mt-0.5 text-base font-bold text-ink">
              {formatCompact(query.data.totalSupply, query.data.decimals)}
            </p>
          ) : query.isError ? (
            <p className="mt-0.5 text-sm font-semibold text-warn">Unreachable</p>
          ) : (
            <p className="mt-0.5 h-5 w-20 animate-pulse rounded bg-line/60" />
          )}
        </div>
      </div>
    </section>
  );
}
