"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { getStrategy } from "@lumina/shared";
import { RiskBadge } from "@/components/RiskBadge";
import { FsaDepositFlow } from "@/components/FsaDepositFlow";
import { EvmDepositFlow } from "@/components/EvmDepositFlow";

type Path = "fsa" | "evm";

export default function ExecutePage() {
  const { strategyId } = useParams<{ strategyId: string }>();
  const strategy = getStrategy(strategyId);
  const [path, setPath] = useState<Path>("fsa");

  useEffect(() => {
    if (strategy) document.title = `${strategy.name} — guided deposit · Lumina`;
  }, [strategy]);

  if (!strategy) notFound();

  if (strategy.availability !== "live") {
    return (
      <div className="container-phone pb-safe px-4 pt-8">
        <h1 className="text-xl font-bold text-ink">Not executable on Coston2</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {strategy.availabilityNote ??
            "This strategy is reference-only — Lumina is testnet-only and this protocol has no Coston2 deployment yet."}
        </p>
        <Link
          href={`/strategies/${strategy.id}`}
          className="mt-4 inline-block text-sm font-semibold text-brand"
        >
          ← Back to strategy
        </Link>
      </div>
    );
  }

  const pathOptions: { id: Path; title: string; desc: string; preferred?: boolean }[] = [
    {
      id: "fsa",
      title: "Flare Smart Account",
      desc: "One XRPL signature. Lumina prepares the exact payment.",
      preferred: true,
    },
    {
      id: "evm",
      title: "EVM wallet",
      desc: "Connect any EVM wallet and deposit on-chain directly.",
    },
  ];

  return (
    <div className="container-phone pb-safe">
      <header className="px-4 pt-5">
        <Link href={`/strategies/${strategy.id}`} className="text-[13px] font-semibold text-brand">
          ← {strategy.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink">Guided deposit</h1>
          <RiskBadge tier={strategy.risk} size="sm" />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Put test FXRP to work in {strategy.name} on Coston2. Testnet only — no real
          value moves here.
        </p>
      </header>

      <main className="mt-4 px-4">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Execution path">
          {pathOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={path === o.id}
              onClick={() => setPath(o.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                path === o.id
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-brand/50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-ink">{o.title}</p>
                {o.preferred && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    Preferred
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{o.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-4" role="tabpanel">
          {path === "fsa" ? (
            <FsaDepositFlow strategy={strategy} />
          ) : (
            <EvmDepositFlow strategy={strategy} />
          )}
        </div>

        <p className="mt-6 rounded-xl bg-paper p-3 text-[12px] leading-snug text-muted">
          Lumina never holds your funds and never signs for you. Every transaction is
          prepared for your review and signed by your wallet. This is a testnet —
          deposit test FXRP only.
        </p>
      </main>
    </div>
  );
}
