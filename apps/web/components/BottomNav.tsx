"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/strategies", label: "Strategies", icon: LayersIcon },
  { href: "/dashboard", label: "Dashboard", icon: WalletIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="container-phone grid grid-cols-3">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-brand" : "text-muted hover:text-ink"
              }`}
            >
              <item.icon active={active} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5 12 3l9 7.5"
        stroke={active ? "#0e7c66" : "#667085"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 9.5V20h13V9.5"
        stroke={active ? "#0e7c66" : "#667085"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayersIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 3 9 5-9 5-9-5 9-5Z"
        stroke={active ? "#0e7c66" : "#667085"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m3 12.5 9 5 9-5"
        stroke={active ? "#0e7c66" : "#667085"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2.5"
        stroke={active ? "#0e7c66" : "#667085"}
        strokeWidth="1.8"
      />
      <path
        d="M16.5 12.5h.01"
        stroke={active ? "#0e7c66" : "#667085"}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M3 10h18" stroke={active ? "#0e7c66" : "#667085"} strokeWidth="1.8" />
    </svg>
  );
}
