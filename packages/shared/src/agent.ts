import { STRATEGIES, getLiveStrategies } from "./strategies";
import { recommendLive } from "./recommend";
import { formatApyRange } from "./format";

/**
 * The Lumina agent — a grounded copilot that answers only from the real
 * strategy catalog, the public risk model and (optionally) live on-chain
 * data passed in from the UI. No hallucinated numbers: every claim maps to a
 * strategy record or a contract read.
 */

export interface AgentLink {
  label: string;
  href: string;
}

export interface AgentResponse {
  text: string;
  links?: AgentLink[];
}

export interface AgentContext {
  /** Live vault totals (totalAssets) keyed by vault address, from the UI. */
  vaultTotals?: { name: string; address: string; totalAssets: string }[];
  /** The connected / looked-up address, if any. */
  address?: string;
}

const LIVE = getLiveStrategies();

function strategyByName(input: string) {
  const q = input.toLowerCase();
  return STRATEGIES.find((s) => {
    const hay = `${s.id} ${s.name} ${s.protocol} ${s.asset?.symbol ?? ""} ${s.vault?.symbol ?? ""}`.toLowerCase();
    const tokens = q.split(/\s+/).filter((t) => t.length > 3);
    return tokens.some((t) => hay.includes(t));
  });
}

function intro(): AgentResponse {
  return {
    text: [
      "I'm the Lumina copilot — your guide to putting XRP to work on Flare, safely.",
      "",
      "I answer from the real strategy catalog and live on-chain data only. Try asking:",
      "• “Which strategy is right for me?”",
      "• “Explain Firelight stXRP and its risks”",
      "• “How do I make a deposit?”",
      "• “What's on-chain right now?”",
      "• “How risky is Clearstar?”",
    ].join("\n"),
  };
}

function explainStrategy(input: string): AgentResponse | null {
  const s = strategyByName(input);
  if (!s) return null;

  const range = s.yieldContext.range
    ? ` ${formatApyRange(s.yieldContext.range.low, s.yieldContext.range.high)} — ${s.yieldContext.range.sourceLabel}.`
    : " No verified yield range on Coston2.";
  const topRisk = s.riskNotes.slice(0, 3).map((n) => `• ${n}`).join("\n");

  const text = [
    `${s.name} (${s.protocol}).`,
    "",
    s.description,
    "",
    `Risk: ${s.risk} — ${topRisk}`,
    "",
    `Yield context: ${s.yieldContext.summary}${range}`,
    s.availability === "live"
      ? "It is live and executable on Coston2."
      : "It is reference-only — not registered on Coston2 yet.",
  ].join("\n");

  const links: AgentLink[] = [{ label: "Full strategy brief", href: `/strategies/${s.id}` }];
  if (s.availability === "live") {
    links.push({ label: "Start a guided deposit", href: `/execute/${s.id}` });
  }
  return { text, links };
}

function recommend(input: string): AgentResponse {
  const recs = recommendLive({ riskTolerance: "Balanced", lockupComfort: "some", simplicity: true });
  const lines = [
    "Based on a balanced risk profile, here's how I'd rank the live options on Coston2:",
    "",
    ...recs.map(
      (r, i) => `${i + 1}. ${STRATEGIES.find((s) => s.id === r.strategyId)?.name ?? r.strategyId} — ${r.reason}`
    ),
    "",
    "For a personalised ranking, answer the 3-question fit check — it only takes 20 seconds.",
  ];
  return {
    text: lines.join("\n"),
    links: [
      { label: "Take the fit check", href: "/onboarding" },
      { label: "Compare all strategies", href: "/strategies" },
    ],
  };
}

function riskExplain(input: string): AgentResponse {
  const tiers = [
    `• Conservative — capital preservation first. Examples: ${LIVE.filter((s) => s.risk === "Conservative").map((s) => s.name).join(", ") || "—"}.`,
    `• Balanced — some volatility for better returns. Examples: ${LIVE.filter((s) => s.risk === "Balanced").map((s) => s.name).join(", ") || "—"}.`,
    `• Advanced — complex strategies and volatile returns.`,
  ].join("\n");

  const text = [
    "Every strategy carries a transparent risk label built from a public factor model (audit status, testnet/mainnet stage, complexity, withdrawal period, TVL).",
    "",
    tiers,
    "",
    "On each strategy page you can expand the full breakdown — every factor, its weight, and the plain-language note. Risk is never a single badge.",
  ].join("\n");
  return { text, links: [{ label: "Explore strategies", href: "/strategies" }] };
}

function depositExplain(input: string): AgentResponse {
  return {
    text: [
      "Two ways to put FXRP to work — both are fully prepared by Lumina, and you sign everything yourself:",
      "",
      "1 · Flare Smart Account (preferred): from your XRPL wallet you make one XRP payment. Lumina encodes the exact instruction (deposit into the vault) in the payment memo, and the FSA executes the deposit on Flare. One signature total.",
      "",
      "2 · EVM wallet: connect any EVM wallet, approve the vault to move your FXRP, then deposit. Two signatures, fully on-chain.",
      "",
      "Pick a live strategy and Lumina walks you through every step with the exact transaction prepared for review.",
    ].join("\n"),
    links: [
      { label: "Firelight stXRP — guided deposit", href: "/execute/firelight-stxrp" },
      { label: "Clearstar earnXRP — guided deposit", href: "/execute/clearstar-earnxrp" },
    ],
  };
}

function onchainExplain(input: string, ctx: AgentContext): AgentResponse {
  const totals = ctx.vaultTotals ?? [];
  const lines: string[] = [
    "Here's what the vaults show on-chain right now (live reads from Coston2):",
    "",
  ];
  if (totals.length > 0) {
    for (const t of totals) {
      lines.push(`• ${t.name}: ${t.totalAssets} FXRP total assets`);
    }
    lines.push("");
  } else {
    lines.push("• (on-chain totals are loading — retry in a moment)",
      "");
  }
  lines.push(
    "All numbers come straight from the vault contracts — nothing is estimated or mocked.",
    "The strategies page also shows the on-chain registry audit, so you can verify exactly which vaults Lumina considers registered."
  );
  return { text: lines.join("\n"), links: [{ label: "Live on-chain stats", href: "/strategies" }] };
}

function faqExplain(input: string): AgentResponse {
  const q = input.toLowerCase();
  if (q.includes("fasset") || (q.includes("xrp") && q.includes("flare"))) {
    return {
      text: [
        "FAssets are Flare's system for bringing XRP onto Flare as a usable token (FXRP). You lock XRP with a collateralised agent pool and receive FXRP 1:1 on Flare — that FXRP is what the vaults accept.",
        "",
        "Lumina sits on top: it finds the vaults, explains their real risk, and prepares the deposits. On Coston2 everything runs with test XRP/FXRP that has no real value.",
      ].join("\n"),
      links: [{ label: "Read the full research brief", href: "/strategies" }],
    };
  }
  if (q.includes("smart account")) {
    return {
      text: [
        "A Flare Smart Account (FSA) is a deterministic account derived from your XRPL address — one XRPL signature controls it.",
        "",
        "Depositing via the FSA means a single XRP payment: the memo tells the FSA to deposit into a vault, and Flare does the rest. Lumina encodes that instruction with Flare's official encoder so the prepared payment is exactly what production would use.",
      ].join("\n"),
      links: [{ label: "Try the FSA path", href: "/execute/firelight-stxrp" }],
    };
  }
  return depositExplain(input);
}

function positionsExplain(ctx: AgentContext): AgentResponse {
  const addr = ctx.address;
  return {
    text: [
      addr
        ? `To see positions for ${addr}, open the dashboard — it reads FXRP balance and every vault's share balance live from Coston2.`
        : "Open the dashboard and either connect an EVM wallet or paste any Coston2 address to look it up — balances and vault shares are read live from the chain, never estimated.",
    ].join("\n"),
    links: [{ label: "Open dashboard", href: "/dashboard" }],
  };
}

export function SUGGESTED_PROMPTS(): string[] {
  return [
    "Which strategy is right for me?",
    "Explain Firelight stXRP and its risks",
    "How risky is Clearstar?",
    "How do I make a deposit?",
    "What's on-chain right now?",
  ];
}

/** Route a user prompt to a grounded answer. */
export function respondToUser(input: string, ctx: AgentContext = {}): AgentResponse {
  const q = input.trim().toLowerCase();
  if (!q) return intro();

  const explained = explainStrategy(input);
  if (explained) return explained;

  if (/(^|\s)(hi|hello|hey|yo|sup|help)\b/.test(q) || q.length < 4) return intro();

  if (/(recommend|suggest|best|which (one|strategy)|what should i|choose|match)/.test(q)) {
    return recommend(input);
  }

  if (/(risk|risky|safe|lose|losing|dangerous|volatil)/.test(q)) {
    return riskExplain(input);
  }

  if (/(deposit|how do i|how to|get started|start|execute|invest|put.*work|sign|path|fsa|evm wallet)/.test(q)) {
    return depositExplain(input);
  }

  if (/(tvl|on.?chain|total assets|live|stats|right now|apy|yield now)/.test(q)) {
    return onchainExplain(input, ctx);
  }

  if (/(balance|position|portfolio|dashboard|my (money|funds)|look up)/.test(q)) {
    return positionsExplain(ctx);
  }

  if (/(flare|fasset|xrp|smart account|fxa)/.test(q)) {
    return faqExplain(input);
  }

  return {
    text: [
      "I don't know that one — and I won't make it up.",
      "",
      "I answer only from the real strategy catalog and live on-chain data: strategy briefs, risk, deposits and on-chain numbers.",
      "",
      "Try: “Explain Firelight stXRP and its risks”, “How do I make a deposit?”, or “Which strategy is right for me?”",
    ].join("\n"),
    links: [{ label: "Explore all strategies", href: "/strategies" }],
  };
}
