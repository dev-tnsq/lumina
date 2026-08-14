/**
 * Lumina shared package — types, risk model, network config, Flare helpers,
 * strategy catalog and recommendation engine.
 *
 * Every contract address in this package was verified on-chain against
 * Coston2 (2026-08-14). Network selection is config-driven
 * (NEXT_PUBLIC_LUMINA_NETWORK) — see ./networks.ts.
 */

export * from "./types";
export * from "./networks";
export * from "./constants";
export * from "./abis";
export * from "./risk";
export * from "./strategies";
export * from "./agent";
export * from "./flare";
export * from "./registry";
export * from "./fassets";
export * from "./format";
export * from "./recommend";
