# Lumina

**AI-powered copilot that helps XRP holders safely enter Flare XRPFi.**

Deposit XRP exposure via FAssets, compare real yield routes, see clear risk labels, and execute simple guided strategies — all in a mobile-first, product-level experience.

> Track: Interoperable Asset Products (Flare)

## Why Lumina wins

XRP holders want yield. DeFi on Flare is powerful but still fragmented and intimidating. Lumina closes that gap with guided onboarding, transparent risk, and one-click paths — exactly the pattern that previously won (2DeFi, Quince style).

It is tightly aligned with Flare’s current direction: FAssets (direct minting + Core Vault), Flare Smart Accounts (one-signature from XRPL), and the growing set of FXRP vaults and strategies.

## Product one-liner

“I hold XRP. I want safe yield on Flare. Lumina shows me the best routes, explains the risks in plain language, and helps me execute.”

## Current status

Product is built, deployed to Coston2 testnet and verified end-to-end with real
on-chain transactions:

**Deployed on Coston2 (chainId 114):**

| Contract | Address | Notes |
| --- | --- | --- |
| `LuminaStrategyRegistry` | `0x36d0B0617e02690373AA521b8E978a62321295D7` | Lumina's on-chain vault registry, deployed 2026-08-14. Owner: `0x6292…3f64`. 4 vaults registered + active. |

**Live verification (2026-08-14):**

- Registry read from the UI: the Strategies page renders the on-chain registry
  (`getActiveVaults()`) live and cross-checks it against the catalog.
- Real deposit into `Firelight stXRP` vault (`0xC90D…0361`):
  - approve: `0xd0a9a753b2d680e3fc98f721c1aa16944b0fa9b4deacdf40602c6fe20878cb31`
  - deposit 5 FXRP → 5 stXRP: `0xcf9f129188637d9773bc23e3f190b321586c200dd2dda3a852635ac44f72b186`
  - Dashboard lookup of the depositor shows `5 FXRP` balance + `5 stXRP` shares
    (caught and fixed a shares-decimals bug during this pass).
- `pnpm test:e2e` — 14/14 Playwright journeys pass (mobile viewport, real Coston2 reads), covering the landing, strategies + registry audit, risk fit-check, FSA/EVM deposit prep, agent chat + executable intents, dashboard, the FAssets system tracker and the public registry API.

Full product surface: onboarding risk questionnaire → ranked matches → strategy
detail (risk breakdown, yield in context, live on-chain registry audit) →
guided FSA deposit prep + EVM deposit (with agent pre-filled intents) →
dashboard with live positions by address lookup → FAssets system tracker.

## Public registry API — "Powered by Lumina"

The on-chain registry is infrastructure, not just UI. Other Flare apps can read
Lumina's source of truth (what is executable, its real on-chain totals) as JSON:

| Endpoint | Returns |
| --- | --- |
| `GET /api/registry` | Live registry records (vaultId, address, name, risk score, APY range, active) + real `totalAssets` per vault + catalog cross-check. |
| `GET /api/verify?address=0x…` | Whether an address is registered in `LuminaStrategyRegistry`, its record, and whether it matches a Lumina catalog strategy (executable). |

All values are live reads from Coston2 — nothing is hardcoded or cached beyond a
30s CDN revalidation. The `/fassets` page in the UI documents and links these
endpoints.

## Quick start for OpenCode

1. Clone this repo
2. Install OpenCode
3. Open the repo in OpenCode
4. Paste the full prompt from [`docs/OPENCODE_MASTER_PROMPT.md`](docs/OPENCODE_MASTER_PROMPT.md)
5. Let the multi-agent system run recursively until the product is clean, tested, and mobile-first product-ready. Do not stop early.

## Key documents

- [`docs/01-RESEARCH.md`](docs/01-RESEARCH.md) — Current Flare XRPFi reality (FAssets, Smart Accounts, vaults, risks)
- [`docs/02-PRD.md`](docs/02-PRD.md) — Full product requirements
- [`docs/03-ARCHITECTURE.md`](docs/03-ARCHITECTURE.md) — System design
- [`docs/04-DATA_FLOW.md`](docs/04-DATA_FLOW.md) — Exact user & data journeys
- [`docs/05-AGENT_SYSTEM.md`](docs/05-AGENT_SYSTEM.md) — Multi-agent roles & rules for OpenCode
- [`docs/06-TEST_STRATEGY.md`](docs/06-TEST_STRATEGY.md) — Testing philosophy (user-perspective Playwright + targeted re-runs)
- [`docs/07-TECH_STACK.md`](docs/07-TECH_STACK.md) — Chosen stack and rationale
- [`docs/OPENCODE_MASTER_PROMPT.md`](docs/OPENCODE_MASTER_PROMPT.md) — **The exact prompt you paste into OpenCode**

## Rules that must never be broken

- No placeholders, no TODOs that leave incomplete code, no mock data that pretends to be real.
- If something fails, fix the actual error. Do not paper over it.
- Prefer running only the specific failing test when iterating.
- Mobile-first, product-level UI. Not a developer dashboard.
- Think and act as a real XRP holder using the product from the UI.
- Continuous improvement agent must keep scanning for quality, risk clarity, and UX gaps.

## License

MIT
