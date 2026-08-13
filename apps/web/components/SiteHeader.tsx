"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/strategies", label: "Strategies" },
  { href: "/agent", label: "Agent" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

/** Sticky top navigation — desktop web chrome, not a mobile shell. */
export function SiteHeader() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="container-app flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand/40 bg-brand/10 text-brand shadow-glow">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M12 12V2" stroke="currentColor" strokeWidth="2" />
              <path d="m7 12 3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[17px] font-bold tracking-tight text-ink">Lumina</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-ink-soft hover:bg-surface hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 sm:flex">
            <span className="pulse-dot" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Coston2 · live
            </span>
          </span>
          <Link href="/agent" className="btn-primary !px-3 !py-1.5 !text-xs md:!px-4">
            Ask the agent
          </Link>
        </div>
      </div>

      {/* Mobile nav row */}
      <nav
        aria-label="Mobile navigation"
        className="flex border-t border-line/60 md:hidden"
      >
        <div className="container-app grid grid-cols-4">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`py-2.5 text-center text-[11px] font-medium ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
