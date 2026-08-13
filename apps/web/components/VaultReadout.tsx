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
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="micro">Vault on Coston2</h2>
        <span className="font-mono text-[11px] text-muted">vaultId {vault.vaultId}</span>
      </div>

      <dl className="mt-3 space-y-1.5 text-[13px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Address</dt>
          <dd className="font-mono text-ink">{shortenAddress(vault.address, 6)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Asset</dt>
          <dd className="text-ink">{assetSymbol}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Symbol</dt>
          <dd className="text-ink">{vault.symbol}</dd>
        </div>
        {vault.apyRange && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Registry APY range</dt>
            <dd className="font-mono text-ink">{vault.apyRange}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line/60 bg-surface-2 p-3.5">
          <p className="micro">Total assets · on-chain</p>
          {query.data ? (
            <p className="mt-1 font-mono text-lg font-bold text-ink">
              {formatCompact(query.data.totalAssets, 6)} {assetSymbol}
            </p>
          ) : query.isError ? (
            <p className="mt-1 text-sm font-semibold text-warn">Unreachable</p>
          ) : (
            <p className="mt-1.5 h-6 w-20 animate-pulse rounded bg-line/60" />
          )}
        </div>
        <div className="rounded-xl border border-line/60 bg-surface-2 p-3.5">
          <p className="micro">Shares outstanding</p>
          {query.data ? (
            <p className="mt-1 font-mono text-lg font-bold text-ink">
              {formatCompact(query.data.totalSupply, query.data.decimals)}
            </p>
          ) : query.isError ? (
            <p className="mt-1 text-sm font-semibold text-warn">Unreachable</p>
          ) : (
            <p className="mt-1.5 h-6 w-20 animate-pulse rounded bg-line/60" />
          )}
        </div>
      </div>
    </section>
  );
}
