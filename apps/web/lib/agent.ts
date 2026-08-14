import { createPublicClient, getAddress, http, isAddress } from "viem";
import {
  ACTIVE_NETWORK,
  STRATEGIES,
  getStrategy,
  getLiveStrategies,
  readRegistryLive,
  readRegistryWithTotals,
  formatUnitsValue,
  formatApyRange,
  ERC20_ABI,
  VAULT_ABI,
  MASTER_ACCOUNT_CONTROLLER_ABI,
  encodeVaultDepositMemo,
  buildXrplPayment,
  FSA_INSTRUCTION,
  fxrpAmountToLots,
  type AgentIntent,
  type AgentLink,
} from "@lumina/shared";
import { coston2 } from "./wagmi";

export const runtime = "nodejs";

const publicClient = createPublicClient({ chain: coston2, transport: http() });

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export interface AgentEngineResult {
  engine: "gemini";
  model: string;
  text: string;
  links?: AgentLink[];
  intent?: AgentIntent;
}

/* ------------------------------------------------------------------ */
/* Live-data tools (server-side, real chain reads — never fabricated)  */
/* ------------------------------------------------------------------ */

interface PreparedDeposit {
  intent: AgentIntent;
  summary: string;
  lots: string;
  memo?: string;
  destination?: string;
  payment?: Record<string, unknown>;
  note?: string;
}

const TOOL_DECLARATIONS = [
  {
    name: "list_strategies",
    description:
      "List every strategy in the Lumina catalog with its protocol, publisher, availability and live on-chain total assets. Use for 'what can I invest in', 'what's on-chain', 'options'.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "get_strategy_brief",
    description:
      "Full grounded brief for one strategy: description, publisher, risk label and notes, yield context, live total assets, registry status. Use whenever the user asks about a specific strategy or vault.",
    parameters: {
      type: "OBJECT",
      properties: {
        strategyId: { type: "string", description: "Strategy id, e.g. firelight-stxrp or clearstar-earnxrp" },
      },
      required: ["strategyId"],
    },
  },
  {
    name: "verify_vault",
    description:
      "Check whether a vault address is registered in LuminaStrategyRegistry and executable. Use when the user asks about a specific contract address or 'is this vault legit'.",
    parameters: {
      type: "OBJECT",
      properties: {
        address: { type: "string", description: "EVM address (0x…)" },
      },
      required: ["address"],
    },
  },
  {
    name: "lookup_positions",
    description:
      "Read an address's real positions: FXRP balance and vault share balances (with the asset value) straight from the chain. Use for 'my positions', 'my balance', 'what do I hold'.",
    parameters: {
      type: "OBJECT",
      properties: {
        address: { type: "string", description: "EVM address (0x…)" },
      },
      required: ["address"],
    },
  },
  {
    name: "compare_strategies",
    description:
      "Side-by-side comparison of strategies with real data: risk label, yield range, publisher and on-chain verification, live total assets, execution path. Use when the user wants to choose between strategies, compare them, or asks 'which is better'. Pass strategyIds (catalog ids) or omit to compare all live strategies.",
    parameters: {
      type: "OBJECT",
      properties: {
        strategyIds: {
          type: "ARRAY",
          items: { type: "string" },
          description: "Strategy ids to compare, e.g. ['firelight-stxrp','clearstar-earnxrp']. Omit for all live strategies.",
        },
      },
    },
  },
  {
    name: "prepare_deposit",
    description:
      "Prepare a real deposit intent for a strategy: resolves strategy, amount, execution path (fsa = Flare Smart Account via one XRPL payment, evm = EVM wallet) and encodes the exact FSA instruction. Call this when the user wants to deposit/invest/put money to work. Never call it without an explicit amount and a concrete strategy. The path argument is optional: when the user did not specify one, omit it and the system defaults to the strategy's preferred execution path.",
    parameters: {
      type: "OBJECT",
      properties: {
        strategyId: { type: "string", description: "Strategy id from the catalog" },
        amount: { type: "string", description: "Amount of FXRP to deposit, e.g. '500'" },
        path: { type: "string", enum: ["fsa", "evm"], description: "Execution path (optional — omit to use the strategy's preferred path)" },
        xrplAddress: { type: "string", description: "Optional XRPL address for the FSA path, to also build the signed-ready payment" },
      },
      required: ["strategyId", "amount"],
    },
  },
];

async function listStrategies() {
  const live = await readRegistryWithTotals(publicClient);
  const totals = live.totals;
  return {
    strategies: STRATEGIES.map((s) => ({
      id: s.id,
      name: s.name,
      protocol: s.protocol,
      publisher: s.publisher.name,
      publisherVerified: s.publisher.verified,
      risk: s.risk,
      availability: s.availability,
      vaultId: s.vault?.vaultId ?? null,
      totalAssetsFormatted: s.vault
        ? formatUnitsValue(totals[s.vault.address.toLowerCase()] ?? 0n, 6)
        : null,
    })),
  };
}

async function getStrategyBrief(strategyId: string) {
  const s = getStrategy(strategyId);
  if (!s) return { error: `No strategy with id "${strategyId}". Call list_strategies to see valid ids.` };
  const live = await readRegistryWithTotals(publicClient);
  const record = s.vault
    ? live.records.find((r) => r.address.toLowerCase() === s.vault!.address.toLowerCase()) ?? null
    : null;
  return {
    id: s.id,
    name: s.name,
    protocol: s.protocol,
    publisher: s.publisher,
    description: s.description,
    risk: s.risk,
    riskNotes: s.riskNotes,
    yieldContext: s.yieldContext,
    availability: s.availability,
    availabilityNote: s.availabilityNote ?? null,
    preferredPath: s.preferredPath,
    externalUrl: s.externalUrl ?? null,
    vault: s.vault
      ? {
          vaultId: s.vault.vaultId,
          address: s.vault.address,
          name: s.vault.name,
          symbol: s.vault.symbol,
          totalAssetsFormatted: formatUnitsValue(
            live.totals[s.vault.address.toLowerCase()] ?? 0n,
            6
          ),
          registryRecord: record,
        }
      : null,
  };
}

async function compareStrategies(strategyIds?: string[]) {
  const live = await readRegistryWithTotals(publicClient);
  const ids = strategyIds && strategyIds.length > 0 ? strategyIds : getLiveStrategies().map((s) => s.id);
  const rows = ids
    .map((id) => {
      const s = getStrategy(id);
      if (!s) return null;
      const total = s.vault ? live.totals[s.vault.address.toLowerCase()] ?? 0n : 0n;
      return {
        id: s.id,
        name: s.name,
        protocol: s.protocol,
        publisher: s.publisher.name,
        publisherVerified: s.publisher.verified,
        risk: s.risk,
        topRiskNote: s.riskNotes[0] ?? null,
        yieldRange: s.yieldContext.range
          ? `${formatApyRange(s.yieldContext.range.low, s.yieldContext.range.high)}`
          : null,
        yieldRangeSource: s.yieldContext.range?.sourceLabel ?? null,
        availability: s.availability,
        preferredPath: s.preferredPath,
        totalAssetsFormatted: s.vault ? formatUnitsValue(total, 6) : null,
        vaultId: s.vault?.vaultId ?? null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null);
  return { count: rows.length, rows };
}

async function verifyVault(address: string) {
  if (!isAddress(address)) {
    return { error: "That is not a valid EVM address (0x…)." };
  }
  const live = await readRegistryLive(publicClient);
  const norm = getAddress(address);
  const record = live.records.find((r) => r.address.toLowerCase() === norm.toLowerCase()) ?? null;
  const match = record
    ? STRATEGIES.find((s) => s.vault?.address.toLowerCase() === record.address.toLowerCase()) ?? null
    : null;
  return {
    address: norm,
    registered: record != null,
    active: record?.active ?? false,
    record: record ?? null,
    inCatalog: match != null,
    catalogStrategy: match
      ? {
          id: match.id,
          name: match.name,
          risk: match.risk,
          executable: match.availability === "live",
          publisher: match.publisher,
        }
      : null,
  };
}

async function lookupPositions(address: string) {
  if (!isAddress(address)) {
    return { error: "That is not a valid EVM address (0x…)." };
  }
  const norm = getAddress(address);
  const [fxrpBal, vaults] = await Promise.all([
    publicClient.readContract({
      address: ACTIVE_NETWORK.contracts.fxrp,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [norm],
    }),
    getLiveStrategies()
      .map((s) => s.vault)
      .filter((v): v is NonNullable<typeof v> => v != null),
  ]);
  const rows: { kind: string; symbol: string; balanceFormatted: string; valueInAssetFormatted?: string }[] = [
    { kind: "fxrp-balance", symbol: "FXRP", balanceFormatted: formatUnitsValue(fxrpBal as bigint, 6) },
  ];
  let totalValue = fxrpBal as bigint;
  for (const v of vaults) {
    const shares = (await publicClient.readContract({
      address: v.address,
      abi: VAULT_ABI,
      functionName: "balanceOf",
      args: [norm],
    })) as bigint;
    const value = (await publicClient.readContract({
      address: v.address,
      abi: VAULT_ABI,
      functionName: "convertToAssets",
      args: [shares],
    })) as bigint;
    totalValue += value;
    rows.push({
      kind: "vault-shares",
      symbol: v.symbol,
      balanceFormatted: formatUnitsValue(shares, 6),
      valueInAssetFormatted: formatUnitsValue(value, 6),
    });
  }
  return {
    address: norm,
    totalValueFormatted: formatUnitsValue(totalValue, 6),
    positions: rows,
  };
}

async function prepareDeposit(args: {
  strategyId: string;
  amount: string;
  path: string;
  xrplAddress?: string;
}): Promise<PreparedDeposit | { error: string }> {
  const s = getStrategy(args.strategyId);
  if (!s) return { error: `No strategy with id "${args.strategyId}".` };
  if (s.availability !== "live" || !s.vault) {
    return { error: `${s.name} is not available on ${ACTIVE_NETWORK.label} yet — pick a live strategy.` };
  }
  // Tolerate "500 xrp", "1,000", "500.00" — normalize to a clean decimal.
  const raw = String(args.amount ?? "").trim();
  const parsed = Number(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { error: "The amount must be a positive number." };
  }
  const amount = String(parsed);
  const path =
    args.path === "evm" ? "evm" : args.path === "fsa" ? "fsa" : s.preferredPath === "evm" ? "evm" : "fsa";
  const intent: AgentIntent = { action: "deposit", strategyId: s.id, amount, path };
  const pathLabel = path === "fsa" ? "the Flare Smart Account (one XRPL signature)" : "an EVM wallet";

  let memo: string | undefined;
  let destination: string | undefined;
  let payment: Record<string, unknown> | undefined;

  if (path === "fsa") {
    const { xrpToDrops } = await import("xrpl");
    let drops: string | null = null;
    try {
      drops = xrpToDrops(amount);
    } catch {
      return { error: `"${amount}" is not a valid XRP amount.` };
    }
    const dropsBig = BigInt(drops);
    const lots = fxrpAmountToLots(dropsBig);
    const instruction =
      s.vault.type === "firelight"
        ? FSA_INSTRUCTION.FIRELIGHT_DEPOSIT
        : FSA_INSTRUCTION.UPSHIFT_DEPOSIT;
    memo = encodeVaultDepositMemo({ instruction, drops: dropsBig, vaultId: s.vault.vaultId });

    if (args.xrplAddress && /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(args.xrplAddress)) {
      const fsaEvm = (await publicClient.readContract({
        address: ACTIVE_NETWORK.contracts.masterAccountController,
        abi: MASTER_ACCOUNT_CONTROLLER_ABI,
        functionName: "getPersonalAccount",
        args: [args.xrplAddress],
      })) as `0x${string}`;
      if (fsaEvm !== "0x0000000000000000000000000000000000000000") {
        const { evmToXrplAddress } = await import("@/lib/xrpl");
        destination = evmToXrplAddress(fsaEvm);
        payment = buildXrplPayment({
          account: args.xrplAddress,
          destination,
          amount: drops,
          memoHex: memo as `0x${string}`,
        });
      }
    }
    return {
      intent,
      summary: `Deposit ${amount} FXRP into ${s.name} via ${pathLabel}.`,
      lots: lots.toString(),
      memo,
      destination,
      payment,
      note: payment
        ? `Payment prepared: ${amount} XRP → ${destination} with the deposit instruction in the memo.`
        : `The FSA destination is derived from your XRPL address on the execute page.`,
    };
  }

  return {
    intent,
    summary: `Deposit ${amount} FXRP into ${s.name} via ${pathLabel}.`,
    lots: "",
    note: "The EVM path connects your wallet on the execute page — you approve the vault, then deposit.",
  };
}

const TOOL_HANDLERS: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  list_strategies: () => listStrategies(),
  get_strategy_brief: (a) => getStrategyBrief(String(a.strategyId ?? "")),
  verify_vault: (a) => verifyVault(String(a.address ?? "")),
  lookup_positions: (a) => lookupPositions(String(a.address ?? "")),
  compare_strategies: (a) => {
    const raw = a.strategyIds;
    const ids = Array.isArray(raw)
      ? raw.map((x) => String(x)).filter((x) => x.length > 0)
      : undefined;
    return compareStrategies(ids);
  },
  prepare_deposit: (a) =>
    prepareDeposit({
      strategyId: String(a.strategyId ?? ""),
      amount: String(a.amount ?? ""),
      path: String(a.path ?? "fsa"),
      xrplAddress: a.xrplAddress != null ? String(a.xrplAddress) : undefined,
    }),
};

/* ------------------------------------------------------------------ */
/* Gemini (function calling) — falls back to local rules without a key */
/* ------------------------------------------------------------------ */

const SYSTEM_PROMPT = `You are Lumina, the official copilot for Flare XRPFi — putting XRP to work on Flare safely.

Rules:
1. Answer ONLY from the tools plus your knowledge of how Flare / FAssets / Flare Smart Accounts work. Never invent numbers, addresses, yields, TVL or transaction data. If a tool returns data, base your answer on it. If you genuinely don't know, say so plainly and suggest what the user can ask instead.
2. When the user wants to deposit / invest / put money to work, call prepare_deposit with the resolved strategy and amount. If the user did not specify an execution path, omit the path argument — the system defaults to the strategy's preferred execution path. Never ask the user which path to use first; just call the tool.
3. When the user asks about a specific strategy, call get_strategy_brief.
4. When the user asks what is live or what the options are, call list_strategies.
5. When the user wants to choose between strategies or compare them, call compare_strategies.
6. When the user asks about a contract address or whether a vault is legit, call verify_vault.
7. When the user asks about positions or balances, call lookup_positions.
8. Be concise and calm, use short paragraphs and bullets. This is a financial product: precise language, no hype, no promises about returns.
9. The current network is ${ACTIVE_NETWORK.label}. You may refer to it as "Flare".`;

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: unknown };
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

async function callGemini(contents: GeminiContent[], tools: unknown): Promise<{
  parts: GeminiPart[];
  usage: { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number } | null;
}> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        tools,
        toolConfig: { functionCallingConfig: { mode: "AUTO" } },
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 400)}`);
  }
  const json = await res.json();
  const candidate = json.candidates?.[0];
  const parts: GeminiPart[] = candidate?.content?.parts ?? [];
  const usage = json.usageMetadata ?? null;
  if (!parts.length) {
    throw new Error(`Gemini returned no content (finishReason: ${candidate?.finishReason ?? "unknown"}).`);
  }
  return { parts, usage };
}

function finalizeGemini(parts: GeminiPart[], toolCalls: string[]): AgentEngineResult {
  const textParts = parts
    .filter((p): p is GeminiPart & { text: string } => typeof p.text === "string")
    .map((p) => p.text)
    .join("\n");
  const links: AgentLink[] = [];
  if (toolCalls.includes("get_strategy_brief") || toolCalls.includes("list_strategies")) {
    links.push({ label: "Full strategy brief", href: "/strategies" });
  }
  if (toolCalls.includes("compare_strategies")) {
    links.push({ label: "Compare on the strategies page", href: "/strategies#compare" });
  }
  if (toolCalls.includes("lookup_positions")) {
    links.push({ label: "Open dashboard", href: "/dashboard" });
  }
  if (toolCalls.includes("verify_vault")) {
    links.push({ label: "Registry audit", href: "/strategies" });
  }
  return { engine: "gemini", model: GEMINI_MODEL, text: textParts, links: links.length ? links : undefined };
}

export async function runAgent(messages: { role: "user" | "assistant"; content: string }[]): Promise<AgentEngineResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Gemini is the engine. No silent fallback: without a key the agent
  // refuses to answer rather than pretend.
  if (!apiKey) {
    throw new Error("Lumina agent is not configured: GEMINI_API_KEY is not set.");
  }

  const contents: GeminiContent[] = messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const toolCalls: string[] = [];
  let lastParts: GeminiPart[] = [];

  for (let round = 0; round < 5; round++) {
    const { parts } = await callGemini(contents, [{ functionDeclarations: TOOL_DECLARATIONS }]);
    lastParts = parts;
    const call = parts.find((p) => p.functionCall);
    if (!call?.functionCall) break;

    const { name, args } = call.functionCall;
    toolCalls.push(name);
    contents.push({ role: "model", parts: [{ functionCall: call.functionCall }] });

    let result: unknown;
    try {
      const handler = TOOL_HANDLERS[name];
      if (!handler) {
        result = { error: `Unknown tool "${name}".` };
      } else {
        result = await handler(args ?? {});
      }
    } catch (e) {
      result = { error: (e as Error).message };
    }
    contents.push({
      role: "user",
      parts: [{ functionResponse: { name, response: result } }],
    });
  }

  const final = finalizeGemini(lastParts, toolCalls);

  // If the user wants to deposit, surface the executable intent card.
  const depositTool = toolCalls.lastIndexOf("prepare_deposit");
  if (depositTool >= 0) {
    const respPart = contents.find(
      (c) => c.role === "user" && c.parts.some((p) => p.functionResponse?.name === "prepare_deposit")
    );
    const response = respPart?.parts.find((p) => p.functionResponse)?.functionResponse?.response as
      | { intent?: AgentIntent }
      | undefined;
    if (response?.intent) {
      final.intent = response.intent;
    }
  }

  return final;
}

export interface AgentStatus {
  engine: "gemini";
  model: string;
  network: string;
  /** False when GEMINI_API_KEY is missing — the agent refuses to answer. */
  configured: boolean;
}

export function getAgentStatus(): AgentStatus {
  return {
    engine: "gemini",
    model: GEMINI_MODEL,
    network: ACTIVE_NETWORK.label,
    configured: Boolean(process.env.GEMINI_API_KEY),
  };
}
