import type { Metadata } from "next";
import { ExecuteClient } from "./ExecuteClient";

export const metadata: Metadata = {
  title: "Guided deposit · Lumina",
  description:
    "Lumina prepares the exact deposit transaction for the Flare Smart Account path or your EVM wallet. You review, you sign.",
};

/**
 * Server wrapper — parses the search params (amount/path/via) so the client
 * flow can pre-fill an agent-prepared intent without a hydration race.
 */
export default async function ExecutePage({
  params,
  searchParams,
}: {
  params: Promise<{ strategyId: string }>;
  searchParams: Promise<{ amount?: string; path?: string; via?: string }>;
}) {
  const { strategyId } = await params;
  const sp = await searchParams;
  return (
    <ExecuteClient
      strategyId={strategyId}
      initialAmount={sp.amount}
      initialPath={sp.path === "evm" ? "evm" : "fsa"}
      viaAgent={sp.via === "agent"}
    />
  );
}
