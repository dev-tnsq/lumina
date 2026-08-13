import Link from "next/link";

/** Small, quiet footer — the only place the testnet nature is disclosed. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line/60">
      <div className="container-app flex flex-col gap-2 py-6 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="telemetry">
          Lumina · copilot for XRP on Flare · running on Coston2 with test assets —
          no real money moves here.
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/strategies" className="transition-colors hover:text-brand">
            Strategies
          </Link>
          <Link href="/agent" className="transition-colors hover:text-brand">
            Agent
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-brand">
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
