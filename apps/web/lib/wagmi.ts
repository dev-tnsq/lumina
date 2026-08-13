import { defineChain } from "viem";
import { createConfig, http, injected } from "wagmi";

/** Flare Coston2 — the only network Lumina operates on (testnet-first). */
export const coston2 = defineChain({
  id: 114,
  name: "Flare Testnet Coston2",
  nativeCurrency: { name: "Coston2 FLR", symbol: "C2FLR", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://coston2-api.flare.network/ext/C/rpc"] },
  },
  blockExplorers: {
    default: { name: "Coston2 Explorer", url: "https://coston2-explorer.flare.network" },
  },
});

export const wagmiConfig = createConfig({
  chains: [coston2],
  transports: {
    [coston2.id]: http("https://coston2-api.flare.network/ext/C/rpc"),
  },
  connectors: [injected()],
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
