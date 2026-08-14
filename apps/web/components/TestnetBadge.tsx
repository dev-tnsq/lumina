/** Persistent "test value only" marker — Coston2 assets are fake money by design. */
export function TestnetBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warn/30 bg-warn/5 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-warn"
      title="Lumina runs on Flare Coston2. Every asset and balance here is test value only — nothing on this network is real money."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden="true" />
      Coston2 · testnet
    </span>
  );
}
