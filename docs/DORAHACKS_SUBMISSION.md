# Lumina — the safest way to put XRP to work on Flare

> **Live demo:** [PASTE DEPLOYED URL] · **Source:** https://github.com/dev-tnsq/lumina · **Video:** [PASTE LOOM / YOUTUBE URL]

You hold XRP. You want it to earn. But DeFi feels like a trap — fragmented across a dozen apps, full of jargon, and the one number everyone shows you (the APY) is exactly the number that hides the risk. So most XRP holders do nothing.

**Lumina changes that.** It's the on-ramp Flare was missing: one place where you tell an AI copilot what your XRP should do, see *why* a strategy is rated the way it is, and deposit into a real FXRP vault with a **single XRP signature** — no EVM wallet, no gas token, no "connect your MetaMask" wall.

## The problem

- XRP holders want yield — but the Flare ecosystem is fragmented across half a dozen protocols, each with its own UI and mental model.
- Yield is sold as one glossy APY number. Risk is buried. After 2022, people don't trust that.
- The best rails on the market (FAssets, Flare Smart Accounts) have a learning curve that filters out exactly the users Flare needs.

## What Lumina is

A guided, honest copilot for Flare XRPFi. Three things, one product:

1. **Honest risk you can see.** Every strategy carries a risk score *derived in code* from five public factors — audit, stage, complexity, withdrawals, TVL — and Lumina shows you the reasoning for each factor. Yield is always a sourced range in context ("the share price has appreciated ~5.9% since launch — history, not a promise"), never a fake APY.
2. **A copilot that answers from the chain, not from vibes.** Ask "where should I put 500 FXRP?" and the agent reads live on-chain data — real vault totals, real registry records, real positions — explains in plain language, and prepares the exact transaction for your review.
3. **Deposit in one signature.** Via Flare Smart Accounts, Lumina turns your XRPL address into a full deposit plan: it derives your smart account on-chain, and prepares the exact XRPL payment that moves your XRP into the vault you chose. You sign it in your XRPL wallet (Xaman / Bifrost). Done. The easiest cross-chain deposit in DeFi — and it's Flare-native.

## How it works (60 seconds)

1. **Tell Lumina your risk comfort** in a 3-question onboarding — it ranks every live strategy with an explanation.
2. **Ask the copilot anything** — "compare Firelight vs Clearstar", "is this vault legit?", "what do I already hold?" — every answer grounded in a live chain read.
3. **Review the prepared deposit** — amount, destination, vault — and sign once from your XRPL wallet. Track the position on the dashboard, live from the chain.

## What's live today (try it now)

- **Strategies with real on-chain audits** — the catalog is cross-checked against Lumina's own `LuminaStrategyRegistry` contract on Coston2; a strategy is shown as executable only if it's registered and active on-chain.
- **Guided FSA deposit prep** — enter your XRPL address, get your smart account + exact payment prepared.
- **EVM path for those who prefer it** — connect a wallet, approve, deposit.
- **Live dashboard** — any Coston2 address, its FXRP balance and vault shares, straight from the chain.
- **AI copilot on every page** — grounded in 6 live-data tools; it *cannot* invent numbers.
- **Public API** — `GET /api/registry` and `GET /api/verify?address=0x…` so other Flare apps can build on the same source of truth.

## Why it matters to Flare

Lumina is built natively on Flare's newest infrastructure and showcases exactly what Flare is pushing: **FAssets (FXRP)** as the bridge for XRP, and **Flare Smart Accounts** as the killer UX — one XRP signature into EVM DeFi. It's not a wrapper; Lumina deploys its own on-chain contract (`LuminaStrategyRegistry`, zero-dependency, non-custodial) and turns it into shared infrastructure. More XRP holders, safely on-boarded, is more FXRP in Flare's vaults — that's the growth loop.

## Proven on-chain (not a slideware pitch)

Deployed and verified on **Coston2 (chainId 114)**:

- `LuminaStrategyRegistry`: [0x36d0…95D7](https://coston2-explorer.flare.network/address/0x36d0B0617e02690373AA521b8E978a62321295D7) — 4 real FXRP vaults registered and active (Firelight stXRP, Clearstar earnXRP, 2× Upshift stXRP), ~110K FXRP combined total assets read live.
- A real deposit executed end-to-end during the build: [approve](https://coston2-explorer.flare.network/tx/0xd0a9a753b2d680e3fc98f721c1aa16944b0fa9b4deacdf40602c6fe20878cb31) → [deposit 5 FXRP → 5 stXRP](https://coston2-explorer.flare.network/tx/0xcf9f129188637d9773bc23e3f190b321586c200dd2dda3a852635ac44f72b186) → position confirmed on the dashboard.
- 31 real-browser user journeys tested against the live chain (mobile-first).

## More of what Lumina does

Lumina is a full platform, not a single flow:

- **AI Vaults** — tell Lumina "I want ~5% but I'm scared of losing it"; it designs your allocation, you approve, and one signature deploys it as a managed position.
- **Guardian** — the copilot watches your vault, detects drift and yield changes, and proposes rebalances with the on-chain facts behind them. It can propose and execute — but it can never touch your funds without your signature.
- **Marketplace, not just an app** — any publisher can register a strategy through Lumina's risk model, and any wallet can embed "Powered by Lumina" via the public registry API.
- **Mainnet-ready** — the registry config is network-agnostic by design: the same deployment that runs on Coston2 today goes to Flare mainnet with verified FAssets and real FXRP.

*Lumina — where XRP goes to work. Safely. In one signature.*
