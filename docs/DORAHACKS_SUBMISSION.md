# Lumina — the safe on-ramp for XRP holders into Flare XRPFi

**Track: Bounty 1 — Interoperable Asset Products (Flare Summer Signal)**

XRP holders want yield. DeFi on Flare is powerful but fragmented across half a dozen protocols, and today's dashboards show a single glossy APY while hiding the risk. **Lumina is the missing layer on top of Flare's FAssets stack: it guides, explains, and executes — with honest risk, live on-chain data, and the easiest deposit path in DeFi (one XRPL signature via Flare Smart Accounts).**

**The core insight:** the fastest way to grow Flare's FXRP ecosystem is to make entry *trustworthy*. Lumina does three things no other Flare app does together:

1. **Transparent, mechanical risk labels.** A five-factor risk model (audit 30%, protocol stage 20%, complexity 20%, withdrawal behaviour 15%, TVL 15%) derives every risk score in code — Conservative / Balanced / Advanced — and shows each factor's reasoning on screen. Yield is always a sourced reference range with recency context, never a single invented APY. Marketing copy cannot override the score.
2. **The Flare Smart Account execution path.** Lumina prepares the exact XRPL payment that converts XRP and deposits FXRP into the chosen vault — amount, destination, and the FSA deposit instruction encoded with Flare's official instruction layout — so the user signs **one XRPL transaction** and it is done. No EVM wallet required. (An EVM approve + deposit path exists for users who prefer it.)
3. **An AI copilot grounded in live chain reads.** A Gemini agent with six function-calling tools reads the chain live (strategies, registry records, positions, comparisons, vault verification, deposit prep). Its system prompt forbids invented numbers — every figure it cites comes from a tool. When you ask it to invest, it returns a structured, executable intent that pre-fills the deposit page: the conversation ends in a real transaction, not marketing.

## Target user

XRP holders who want yield but are intimidated by DeFi — plus Flare-native users who want a safer, clearer way to manage FXRP vault positions. Primary profile: *"I hold XRP. I want safe yield on Flare. Show me the best routes, explain the risks in plain language, and help me execute."*

## How the project uses Flare

Not a wrapper — Lumina is built natively on the Flare stack and deploys its own on-chain infrastructure:

- **FAssets / FXRP** — deposits convert XRP into FXRP (FTestXRP on Coston2) via Flare's asset manager (lot size read on-chain). The FAssets system tracker page reads the live minted-token layer: FXRP minted, collateral, and system state.
- **Flare Smart Accounts** — the headline path. `MasterAccountController.getPersonalAccount()` derives the user's smart account from their XRPL address; Lumina then builds the exact XRPL payment whose memo carries the FSA deposit instruction (Firelight/Upshift layout, walletId 0x01), so one XRP signature completes the whole deposit.
- **FlareContractRegistry** — protocol addresses (asset registry, asset manager, FSA controllers) are resolved from Flare's own contract registry, not hardcoded.
- **Lumina's own contract** — `LuminaStrategyRegistry`, deployed on Coston2, is the on-chain source of truth for which vaults are registered and executable, with risk score and APY range per vault (two-step ownership, zero-dependency, holds no funds).
- **Live, verified vaults** — Firelight stXRP and the Clearstar/Upshift earnXRP family, registered and read live from the chain.

## What was newly built during the program

Everything is new in this cycle, built and verified end-to-end on Coston2:

- **`LuminaStrategyRegistry` contract** (Solidity 0.8.24, audited-style minimal surface, no external dependencies) — deployed with 4 real FXRP vaults registered and active.
- **Full onboarding → execution product** — risk questionnaire with ranked, explained matches; strategy catalog with factor-by-factor risk breakdowns and a live on-chain registry audit; guided FSA deposit prep (XRPL address validation → smart-account derivation → lot-size check → exact payment build); EVM approve + deposit flow; dashboard with live positions by address lookup; FAssets system tracker.
- **AI copilot** — Gemini function-calling agent with 6 live-data tools, grounded answers, and executable deposit intents that pre-fill the execute page.
- **Public registry API** — `GET /api/registry` (live records + real per-vault totals) and `GET /api/verify?address=0x…` — JSON infrastructure other Flare apps can build on ("Powered by Lumina").
- **Quality gate** — 31 Playwright e2e journeys (mobile-first viewport) against real Coston2 reads, plus a real approved + executed deposit transaction verified on-chain during the build.

## Smart contracts & deployment details

| Item | Address / detail |
|---|---|
| Network | Flare Coston2, chainId **114** (testnet-first; mainnet switch is config-only) |
| `LuminaStrategyRegistry` | `0x36d0B0617e02690373AA521b8E978a62321295D7` — deployed 2026-08-14, owner `0x6292…3f64`, 4 vaults registered + active |
| Firelight stXRP vault | `0xC90D6847747b85d1fa2E07859869fb9fB72c0361` — risk 2 · APY 3–8% · total assets ~101,531 FXRP |
| Clearstar earnXRP vault | `0x9E63a5D282F2fBb7DcE822B98e363b2719D28319` — risk 3 · APY 4–12% · total assets ~7,222 FXRP |
| Upshift stXRP vault | `0x4066A1363a04ce3B23eEcB53dEfa65f94A24355E` — risk 3 · APY 4–12% · ~1,796 FXRP |
| Upshift stXRP vault (2) | `0xD91324A6e8884147F6425E9ddd60e11Aea060B5b` — risk 3 · APY 4–12% · ~95.8 FXRP |
| FXRP (FTestXRP) token | `0x0b6A3645c240605887a5532109323A3E12273dc7` · 6 decimals · lot size 10 FXRP |
| Real verified deposit | approve `0xd0a9a753…78cb31` → deposit 5 FXRP → 5 stXRP `0xcf9f1291…72b186` |

All vault totals above are **live reads re-taken on submission day** — nothing cached or mocked.

## Tech stack

- **Web app:** Next.js 15 (App Router) · TypeScript strict · Tailwind · wagmi v2 + viem · `xrpl.js` · React Query
- **Agent:** Google Gemini (function calling, temperature 0.3) with server-side live-data tools
- **Contracts:** Solidity 0.8.24, zero external dependencies, minimal registry
- **Repo:** pnpm monorepo (`apps/web` · `packages/shared` · `packages/contracts`), single network config file — switching to Flare mainnet is a deployment operation, not a code change
- **Testing:** Playwright e2e (31 journeys, real Coston2 reads) · Vitest unit tests for the risk model and FSA encoders

## Traction & testing (real, early)

- Deployed on **Coston2** with the registry live and 4 vaults registered; every journey verified by real browser tests against the chain.
- A real user flow was executed end-to-end during the build: faucet → approve → deposit 5 FXRP into Firelight stXRP → dashboard shows the position (this pass caught and fixed a shares-decimals bug).
- 31/31 Playwright journeys pass (mobile-first, real RPC), covering landing → onboarding → strategies → deposit prep → agent → dashboard → registry audit → public API.
- Testnet-first by design: every money screen carries a persistent "Coston2 · testnet" badge so users never mistake test value for real value.

## Roadmap / next steps

1. **AI Vaults** — conversational vault creation ("I want ~5% but I'm scared of losing it") → structured mandate → live allocation → one-signature deploy.
2. **Guardian** — automated drift/regime monitoring, rebalance proposals with a fact-provenance decision feed, user approval, contract-enforced guardrails (the agent can propose and execute allocations but can never withdraw user funds).
3. **Flare mainnet** — deploy `LuminaStrategyRegistry` on mainnet (config already structured), verified FAssets, real FXRP vaults.
4. **Vault factory + marketplace** — let any publisher register a strategy through Lumina's risk model; expose a "Powered by Lumina" API/embed for wallet builders.

## Links

- **GitHub:** https://github.com/dev-tnsq/lumina
- **Demo (working app):** [PASTE DEPLOYED URL]
- **Demo video:** [PASTE LOOM / YOUTUBE URL]
- **Contract on Coston2 Explorer:** https://coston2-explorer.flare.network/address/0x36d0B0617e02690373AA521b8E978a62321295D7
- **Registry API:** GET /api/registry · GET /api/verify?address=0x…

*Lumina is testnet-first and honest by design: every number on screen is a live read from the chain, every risk label is derived in code, and no user funds are ever custodied.*
