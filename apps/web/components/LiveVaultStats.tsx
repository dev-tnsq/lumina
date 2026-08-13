"use client";

import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http } from "viem";
import type { Strategy } from "@lumina/shared";
import { VAULT_ABI } from "@lumina/shared";
import { formatCompact, shortenAddress } from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";

const publicClient = createPublicClient({
  chain: coston2,
  transport: http(),
});

/**
 * Real on-chain vault totals (totalAssets) for every vault Lumina knows.
 * When the chain is unreachable we show an honest "offline" state instead of
 * inventing numbers.
 */
export function LiveVaultStats({ strategies }: { strategies: Strategy[] }) {
  const vaults = strategies
    .map((s) => s.vault)
    .filter((v): v is NonNullable<typeof v> => v != null);

  const query = useQuery({
    queryKey: ["vault-total-assets"],
    queryFn: async () => {
      const rows = await Promise.all(
        vaults.map(async (vault) => {
          try {
            const totalAssets = (await publicClient.readContract({
              address: vault.address,
              abi: VAULT_ABI,
              functionName: "totalAssets",
            })) as bigint;
            return { vault, totalAssets };
          } catch {
            return { vault, totalAssets: null };
          }
        })
      );
      return rows;
    },
  });

  if (query.isPending) {
    return (
      <div className="space-y-2">
        {vaults.map((v) => (
          <div key={v.address} className="h-16 animate-pulse rounded-2xl bg-line/60" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-2xl border border-warn/30 bg-warn/5 p-4 text-sm text-warn">
        Could not reach Coston2 right now. Vault totals will appear once the RPC is
        reachable again.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {query.data?.map(({ vault, totalAssets }) => (
        <li
          key={vault.address}
          className="flex items-center justify-between rounded-2xl border border-line bg-surface p-3.5 shadow-card"
        >
          <div>
            <p className="text-sm font-semibold text-ink">{vault.name}</p>
            <p className="font-mono text-[11px] text-muted">
              vaultId {vault.vaultId} · {shortenAddress(vault.address)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-ink">
              {totalAssets != null ? formatCompact(totalAssets, 6) : "—"} FXRP
            </p>
            <p className="text-[11px] text-muted">total assets</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
