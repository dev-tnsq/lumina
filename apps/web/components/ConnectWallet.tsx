"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortenAddress } from "@lumina/shared";

/**
 * The single wallet entry point for the whole app — lives in the header.
 * No per-connector button grids anywhere else; this is the one "Connect
 * Wallet". Connected state shows the short address with a tiny disconnect
 * affordance.
 *
 * Hydration-safe: wagmi reconnects an injected wallet synchronously on the
 * client, so the server HTML (disconnected) would mismatch the client's
 * first render (connected). We render the disconnected button until the
 * component has mounted, then switch to live state.
 */
export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button type="button" className="btn-primary !px-3 !py-1.5 !text-xs" disabled>
        Connect Wallet
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[11px] font-semibold text-ink sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-risk-conservative" aria-hidden="true" />
          {shortenAddress(address)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-lg px-2 py-1 text-[12px] font-semibold text-muted transition-colors hover:text-ink"
          aria-label="Disconnect wallet"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        const c = connectors[0];
        if (c) connect({ connector: c });
      }}
      className="btn-primary !px-3 !py-1.5 !text-xs"
    >
      Connect Wallet
    </button>
  );
}
