"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { RiskBadge } from "./RiskBadge";

interface CompareRow {
  id: string;
  name: string;
  protocol: string;
  risk: "Conservative" | "Balanced" | "Advanced";
  availability: "live" | "reference-only";
  preferredPath: "fsa" | "evm" | "both";
  publisher: { name: string; handle: string; verified: boolean };
  yieldRange: string | null;
  yieldRangeSource: string | null;
  totalAssetsFormatted: string | null;
  vaultId: number | null;
}

interface RegistryResponse {
  compare: CompareRow[];
  updatedAt: string;
  source: string;
}

/**
 * Side-by-side comparison of every strategy with real data — risk, yield
 * range, publisher verification and live total assets from the registry.
 * The data comes from /api/registry, which reads the on-chain registry and
 * vault contracts live; nothing here is hardcoded or estimated.
 */
export function CompareTable() {
  const query = useQuery({
    queryKey: ["compare"],
    queryFn: async () => {
      const res = await fetch("/api/registry", { next: { revalidate: 30 } });
      if (!res.ok) throw new Error("Registry unavailable");
      return (await res.json()) as RegistryResponse;
    },
  });

  const rows = query.data ? query.data.compare.filter((r) => r.availability === "live") : [];

  return (
    <section id="compare" className="mt-14 scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="micro">Compare, side by side</h2>
        <p className="font-mono text-[10px] text-muted">
          {query.data
            ? `live from the registry · updated ${new Date(query.data.updatedAt).toLocaleTimeString()}`
            : "live from the registry"}
        </p>
      </div>
      <p className="mt-1 max-w-2xl text-[13px] leading-snug text-muted">
        Real data, one table: risk labels, yield context, publisher verification
        and live total assets per vault. Pick on facts, not marketing.
      </p>

      {query.isPending && (
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-line/40" />
          ))}
        </div>
      )}

      {query.isError && (
        <p className="mt-4 rounded-xl border border-warn/30 bg-warn/5 p-4 text-[13px] text-warn">
          Comparison data is unavailable right now — the live registry read is
          retrying. Refresh in a moment.
        </p>
      )}

      {query.data && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line/70">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line/70 bg-surface-2/60">
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Strategy
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Publisher
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Risk
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Yield context
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Live TVL
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Path
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-line/50 last:border-0 hover:bg-surface-2/40"
              >
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-semibold text-ink">{r.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{r.protocol}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-ink-soft">
                      {r.publisher.name}
                    </span>
                    {r.publisher.verified && (
                      <span
                        title="Lumina verified this publisher's vault contract on-chain"
                        className="rounded-full bg-brand/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-brand"
                      >
                        ✓ verified
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <RiskBadge tier={r.risk} size="sm" />
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-mono text-[12px] font-bold text-ink">
                    {r.yieldRange ?? "not verified"}
                  </p>
                  {r.yieldRangeSource && (
                    <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-muted">
                      {r.yieldRangeSource}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-mono text-[12px] font-semibold text-ink">
                    {r.totalAssetsFormatted ?? "—"}
                  </p>
                  <p className="text-[10px] text-muted">FXRP</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted">
                    {r.preferredPath === "both" ? "fsa / evm" : r.preferredPath}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Link
                    href={`/strategies/${r.id}`}
                    className="rounded-lg bg-brand/10 px-2.5 py-1.5 text-[11px] font-bold text-brand transition-colors hover:bg-brand/20"
                  >
                    Brief →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {query.data && rows.length === 0 && (
        <p className="mt-4 rounded-xl border border-line p-4 text-[13px] text-muted">
          No live strategies to compare right now.
        </p>
      )}

      {query.data && (
        <p className="mt-2 font-mono text-[10px] text-muted">{query.data.source}</p>
      )}
    </section>
  );
}
