import { defineChain } from "viem";
import { createConfig, http, injected } from "wagmi";
import { ACTIVE_NETWORK } from "@lumina/shared";

/**
 * The chain Lumina reads from — derived from the active deployment config
 * (NEXT_PUBLIC_LUMINA_NETWORK). To switch networks you change the env var,
 * not this file.
 */
export const activeChain = defineChain({
  id: ACTIVE_NETWORK.chainId,
  name: ACTIVE_NETWORK.name,
  nativeCurrency: {
    name: ACTIVE_NETWORK.nativeCurrency.name,
    symbol: ACTIVE_NETWORK.nativeCurrency.symbol,
    decimals: ACTIVE_NETWORK.nativeCurrency.decimals,
  },
  rpcUrls: {
    default: { http: [ACTIVE_NETWORK.rpcUrl] },
  },
  blockExplorers: {
    default: { name: ACTIVE_NETWORK.explorerName, url: ACTIVE_NETWORK.explorer },
  },
});

/** Backwards-compatible alias. */
export const coston2 = activeChain;

export const wagmiConfig = createConfig({
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(ACTIVE_NETWORK.rpcUrl),
  },
  connectors: [injected()],
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
