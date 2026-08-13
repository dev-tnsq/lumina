"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http, isAddress } from "viem";
import type { Strategy, StrategyVault } from "@lumina/shared";
import {
  ERC20_ABI,
  VAULT_ABI,
  getLiveStrategies,
  getStrategy,
  COSTON2_CONTRACTS,
  formatUnitsValue,
  shortenAddress,
} from "@lumina/shared";
import { coston2 } from "@/lib/wagmi";

const publicClient = createPublicClient({ chain: coston2, transport: http() });

const ASSET = { symbol: "FXRP", decimals: 6, address: COSTON2_CONTRACTS.fxrp as `0x${string}` };

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [lookup, setLookup] = useState("");
  const [lookupAddress, setLookupAddress] = useState<`0x${string}` | null>(null);

  const target = lookupAddress ?? (isConnected ? address : undefined);

  function submitLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = lookup.trim();
    setLookupAddress(isAddress(trimmed) ? trimmed : null);
  }

  return (
    <div className="space-y-4">
      {/* Header: wallet + address lookup */}
      <section className="card p-5">
        <h2 className="micro">Whose positions?</h2>

        {isConnected && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-line/60 bg-surface-2 p-3">
            <div>
              <p className="font-mono text-sm font-semibold break-all text-ink">
                {shortenAddress(address!, 6)}
              </p>
              <p className="text-[11px] text-muted">connected EVM wallet</p>
            </div>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setLookupAddress(null);
              }}
              className="text-[13px] font-semibold text-muted underline"
            >
              Disconnect
            </button>
          </div>
        )}

        {!isConnected && (
          <div className="mt-2 flex flex-wrap gap-2">
            {connectors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => connect({ connector: c })}
                className="rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-brand"
              >
                Connect {c.name}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submitLookup} className="mt-3 flex gap-2">
          <input
            type="text"
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            placeholder="or look up any Coston2 address"
            aria-label="Look up any Coston2 address"
            className="flex-1 rounded-xl border border-line bg-surface-2 px-3 py-2.5 font-mono text-[13px] text-ink outline-none placeholder:font-sans placeholder:text-muted/60 focus:border-brand"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            Look up
          </button>
        </form>
        {lookup !== "" && !isAddress(lookup.trim()) && (
          <p className="mt-1.5 text-xs text-danger">That&apos;s not a valid address.</p>
        )}
      </section>

      {target ? (
        <Positions address={target} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function Positions({ address }: { address: `0x${string}` }) {
  const live = getLiveStrategies();

  const query = useQuery({
    queryKey: ["positions", address],
    queryFn: async () => {
      const [fxrpBalance] = await Promise.all([
        publicClient.readContract({
          address: ASSET.address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }) as Promise<bigint>,
      ]);

      const vaultRows = await Promise.all(
        live
          .filter((s): s is Strategy & { vault: StrategyVault } => s.vault != null)
          .map(async (s) => {
            try {
              const [shares, assets, decimals] = await Promise.all([
                publicClient.readContract({
                  address: s.vault.address,
                  abi: VAULT_ABI,
                  functionName: "balanceOf",
                  args: [address],
                }) as Promise<bigint>,
                publicClient.readContract({
                  address: s.vault.address,
                  abi: VAULT_ABI,
                  functionName: "convertToAssets",
                  args: [1n * 10n ** 6n],
                }) as Promise<bigint>,
                publicClient.readContract({
                  address: s.vault.address,
                  abi: VAULT_ABI,
                  functionName: "decimals",
                }) as Promise<number>,
              ]);
              const sharePrice = assets;
              const valueInAsset = (shares * sharePrice) / 10n ** 6n;
              return { strategy: s, shares, valueInAsset, shareDecimals: decimals };
            } catch {
              return { strategy: s, shares: 0n, valueInAsset: 0n, shareDecimals: 18 };
            }
          })
      );

      return { fxrpBalance, vaultRows };
    },
  });

  if (query.isPending) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-line/60" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-2xl border border-warn/30 bg-warn/5 p-4 text-sm leading-snug text-warn">
        Could not reach Coston2 to read positions. Check your connection and retry.
      </div>
    );
  }

  const { fxrpBalance, vaultRows } = query.data;
  const heldRows = vaultRows.filter((r) => r.shares > 0n);
  const hasAny = fxrpBalance > 0n || heldRows.length > 0;

  if (!hasAny) {
    return (
      <EmptyState>
        <p className="text-sm leading-relaxed text-ink-soft">
          {shortenAddress(address, 6)} has no FXRP and no vault shares on Coston2 yet.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {/* FXRP balance */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="micro">FXRP balance</h3>
          <span className="pulse-dot" aria-hidden="true" />
        </div>
        <p className="mt-2 font-mono text-3xl font-bold text-ink">
          {formatUnitsValue(fxrpBalance, ASSET.decimals)}{" "}
          <span className="text-base font-semibold text-muted">FXRP</span>
        </p>
        <p className="mt-1 text-[12px] text-muted">
          The Flare XRP test token. This is what vaults accept.
        </p>
      </section>

      {/* Vault positions */}
      <section>
        <h3 className="micro">Vault positions</h3>
        <div className="mt-2 space-y-3">
          {heldRows.length === 0 ? (
            <div className="card p-4 text-[13px] text-muted">
              No vault shares yet.{" "}
              <Link href="/strategies" className="font-semibold text-brand">
                Explore strategies
              </Link>{" "}
              to put that FXRP to work.
            </div>
          ) : (
            heldRows.map(({ strategy, shares, valueInAsset, shareDecimals }) => (
              <Link
                key={strategy.id}
                href={`/strategies/${strategy.id}`}
                className="block card p-5 transition-colors hover:border-brand"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{strategy.name}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {strategy.vault!.symbol} · vaultId {strategy.vault!.vaultId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">
                      {formatUnitsValue(valueInAsset, ASSET.decimals)}{" "}
                      <span className="font-semibold text-muted">FXRP</span>
                    </p>
                    <p className="text-[11px] text-muted">
                      {formatUnitsValue(shares, shareDecimals)} {strategy.vault!.symbol} shares
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <p className="rounded-xl border border-line/60 bg-surface-2 p-3 text-[12px] leading-snug text-muted">
        All values are read live from Coston2. “Value in FXRP” uses the vault&apos;s
        on-chain share price.
      </p>
    </div>
  );
}

function EmptyState({ children }: { children?: React.ReactNode }) {
  return (
    <section className="card border-dashed p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3"
            y="6"
            width="18"
            height="13"
            rx="2.5"
            stroke="#2dd4bf"
            strokeWidth="1.8"
          />
          <path d="M16.5 12.5h.01" stroke="#2dd4bf" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M3 10h18" stroke="#2dd4bf" strokeWidth="1.8" />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">
        {children ? "No positions yet" : "Your dashboard is ready"}
      </h3>
      {children ?? (
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
          Connect an EVM wallet or look up any Coston2 address to see real on-chain FXRP
          balances and vault shares.
        </p>
      )}
      <Link
        href="/strategies"
        className="mt-4 inline-flex rounded-xl bg-brand px-5 py-2.5 text-[13px] font-bold text-[#03201b] shadow-glow transition-colors hover:bg-brand-strong"
      >
        Explore strategies
      </Link>
    </section>
  );
}

export function DashboardHeader() {
  return (
    <header>
      <p className="micro flex items-center gap-2">
        <span className="pulse-dot" aria-hidden="true" />
        positions · live reads
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">Dashboard</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Your FXRP and vault positions on Coston2 — read live from the chain, nothing
        cached or estimated.
      </p>
    </header>
  );
}
