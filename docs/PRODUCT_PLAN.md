# Lumina — Product Plan: AI Vaults

> **Thesis (one line):** Lumina is where you *ask for a vault* instead of *building a vault* — a conversational AI that designs, deploys, and continuously manages XRPFi vaults on Flare/FXRP, with every decision auditable on-chain.
>
> Defindex gives you a form. Lumina gives you a conversation that produces a live, managed vault.

---

## 1. Market research — what exists today (Aug 2026)

| Project | What it is | What Lumina takes from it |
|---|---|---|
| **Defindex** (Stellar/Soroban) | Form-based vault factory: user fills name/symbol/asset/strategies/fees, gets an ERC-4626-style vault with 4 roles (Manager, Emergency, Rebalance, Fee Receiver). SDK returns unsigned XDRs. | The **vault-factory model** — but Lumina replaces the form with a conversation. Lumina is the Flare/FXRP equivalent of the *vault primitive*, not of the form. |
| **ForgeVault** | "Your private hedge fund AI": set risk + target yield → agent launches with its **own on-chain wallet**, does regime detection, multi-strategy allocation, self-evolves; transparent audit trail; guardian staking. | **Risk + target → autonomous agent vault.** The "tell me your risk appetite and goal, I build the fund" framing. |
| **Sommelier** | Cosmos app-chain. Strategists (incl. AI) submit **Cellar** (ERC-4626 vault) rebalance *recommendations*; validators **vote**; executed via Gravity Bridge. | **AI proposes, governance/vault-owner approves.** The proposal→approval→execute loop keeps the agent powerful but not unchecked. |
| **Agentic Vault Curation** (ETHGlobal Lisboa winner) | ERC-4626 vault whose **curator is an LLM agent**. Co-design a mandate in natural language → vault wraps the mandate → agent (own key) allocates capital. Vault is **sole custodian**; no human override. | The **mandate** concept: a natural-language strategy contract, written at creation, that the agent must follow. Provenance feed for every decision. |
| **Morpho** ($5.8B TVL) | Curated vaults, isolated markets, blue-chip curated allocators. | Curated, label-driven vault surfaces; institutional-grade transparency. |
| **Kamino** ($3.2B, Solana) | Concentrated-liquidity vaults, autocompounding. | Performance/risk labeling done right. |
| **Neko** | ERC-4626 vault + **DeFAI Multiagent System**: strategist AI (offline) + worker executor + valuer with keeper-signed price updates. | Hybrid on/off-chain: AI thinks off-chain, signs/executes on-chain with keeper-verified data. |
| **Zyfai Agent Vault** | ERC-4626 + ERC-7540 (async withdrawals), **automated curation lifecycle** (NAV updates, withdrawals, rebalance) owned by a Safe, executed via Smart Account. | Async withdrawal UX + lifecycle automation patterns. |
| **Akka** | AI directional vault on Hyperliquid; confidence-driven leverage with a **deterministic risk layer**; on-chain published decision book. | Risk caps must be deterministic and on-chain, independent of the AI. |
| **ConfluxMind** | AI yield aggregator with a **3-factor scoring** (yield rate, utilization risk, liquidity depth); on-chain rebalance weights; **transparent AI reasoning logs**. | Score + explainability: the agent must show *why* (which live facts) it picked weights. |
| **Fello / OPRAI / Crest / AgentVault** | "Describe don't do": plain language → structured plan → **one-tap approval** → automation. Agent never holds user keys; policy-constrained autonomy with an on-chain activity feed. | The **plan → approve → run** UX. The agent is an operator, never a custodian. |
| **Yearn V3** | Vaults + **DebtAllocator** (Python optimizer + keepers) moving funds across strategies. | Keeper-driven allocation + strategy lifecycle (debt limits, apy thresholds). |

### The winning pattern (synthesis)

Every serious 2026 DeFAI product converges on the same five rails:

1. **Conversation → structured mandate.** Natural language becomes a machine-checkable strategy contract ("≤40% in any one strategy, rebalance when drift >10%, risk tier 3").
2. **Human approves, agent executes.** The agent drafts; the user signs (or the vault's owner role approves). Sommelier's vote + Fello's plan-approval + AgentVault's policy layer.
3. **Agent is an operator, never a custodian.** The agent's key can rebalance/allocate but **cannot withdraw user funds**. The vault contract is the sole custodian.
4. **Deterministic guardrails around the stochastic brain.** Risk caps, max allocation, allowed-strategy allowlists, min/max time between rebalances — enforced *in code*, not in the prompt.
5. **Every decision has provenance.** The agent logs the live facts it used (vault share price, APY, utilization) with sources, so each rebalance is explainable and auditable on-chain.

**Lumina's wedge:** nobody is doing this *on Flare for FXRP*, and nobody is doing it with the **FAssets one-signature flow** (FSA deposit with a single XRP signature). That combination — conversational AI vaults + the easiest deposit path in DeFi — is the moat.

---

## 2. The product, end to end

### 2.1 Core concept: the AI Vault

An **AI Vault** is a managed FXRP position with three parts:

1. **A mandate** — the natural-language strategy contract, co-designed with the agent, hashed and committed to the registry at creation ("conservative, 60% Firelight / 40% Clearstar, auto-rebalance on >10% drift, never more than 40% in one strategy").
2. **A live allocation** — the agent reads live vault data (share prices, APY, utilization) and *recommends* weights; the vault owner approves; execution happens on-chain.
3. **A decision feed** — every recommendation, its reasoning, and the exact facts it was based on, timestamped and shown next to the vault (auditable even if not all on-chain).

### 2.2 Product pillars

```
┌──────────────────────────────────────────────────────────────┐
│                      LUMINA — AI VAULTS                       │
├───────────────┬───────────────────┬──────────────────────────┤
│  1. COMPOSER  │  2. GUARDIAN      │  3. INTELLIGENCE         │
│  "design it"  │  "run it"         │  "prove it"              │
│               │                   │                          │
│ Convo →       │ Rebalance loop    │ Decision feed (why)      │
│ mandate →     │ (agent proposes,  │ Live allocations         │
│ preview →     │  user approves)   │ Portfolio view           │
│ one-sig deploy│ Drift/regime      │ Honest yield disclosure  │
│               │  alerts           │ Compare across vaults    │
├───────────────┴───────────────────┴──────────────────────────┤
│  One connect-wallet in the header · FSA one-sig deposit       │
│  Strategy registry = on-chain source of truth                 │
└──────────────────────────────────────────────────────────────┘
```

#### Pillar 1 — Composer (the headline demo)

The user lands and is asked one thing: **"What should your vault do?"**

- User: *"I want to earn on my XRP but I'm scared of losing it. ~5% would be nice."*
- The agent (grounded in the live registry + risk model) proposes a **vault card**:
  - Mandate (plain English + structured spec)
  - Allocation: 60% Firelight stXRP (liquid staking, lowest risk), 40% Clearstar (multi-strategy)
  - Risk score breakdown (same mechanical model as today's RiskBadge — not a black box)
  - Expected yield range (honest reference range, sourced)
  - Path: **FSA** (one XRP signature) or EVM
- User approves → one-signature FSA deposit executes across the allocation → the vault is **recorded in the registry** with its mandate hash.
- From then on, the **Guardian** watches it.

**Composer variants (future):**
- *Blank-slate:* fully open mandate.
- *Templates:* "Lazy yield", "Balanced XRPFi", "Max yield (research-grade)" — pre-vetted starting points the agent adapts.
- *Refine:* "More conservative" / "I need it liquid" — agent re-proposes within the deterministic guardrails.

#### Pillar 2 — Guardian (the agent as keeper)

Once a vault exists, the agent runs a **monitoring loop** (periodic, keeper-triggered, and on user request):

- Reads live share prices / APYs / utilization for each strategy in the vault.
- Detects drift (weights vs mandate), regime changes, APY collapse, or a strategy going inactive (registry `setActive(false)`).
- Produces a **rebalance proposal**: new weights, the facts behind them (each fact with source + timestamp), and a plain-English rationale.
- Submits it. The **vault owner approves** (one signature). Execution allocates within the vault.
- All proposals are logged to the **decision feed**.

Guardrails enforced in the registry contract: per-strategy max weight, drift threshold, min interval between rebalances, strategy allowlist (only `active` registered vaults), user-only withdrawals. The agent can never withdraw user funds.

#### Pillar 3 — Intelligence (proof, not promises)

- **Decision feed** per vault: `[time] proposed 60/40 → 50/50 because Firelight APY fell 4.2%→2.9% (source: on-chain share price 0.987→0.951, 14:02 UTC)`. Verifiable, sortable, filterable.
- **Live allocations** — current weights, each strategy's current contribution, TVL, share price.
- **Portfolio view** (dashboard): all of the user's vaults and deposits in one place — the current `Positions` read generalized.
- **Honest yield language** stays: reference ranges, "history not a promise", `derivedFromOnChain` flags. This is Lumina's brand — never a glossy fake APY.

### 2.3 What we keep from today, what changes

**Keep (proven, working, honest):**
- Strategy registry contract + catalog (`STRATEGIES`) + risk model + `RiskBadge`/`RiskPanel`
- FSA one-signature deposit flow (`FsaDepositFlow`), EVM flow (`EvmDepositFlow`)
- Agent chat grounded in live on-chain data (`lib/agent.ts`, `/api/agent`)
- Vault readout, live vault stats, registry audit page, compare table, yield disclosure
- The e2e suite as the quality gate (now: 29 passed / 1 flaky-on-429 / 1 skipped)

**Change / add:**
- **One Connect Wallet in the header** (user's explicit ask). Remove the per-connector button grids in `Dashboard.tsx` (line ~74) and `EvmDepositFlow.tsx` (lines ~122–136); a single header button opens a connector modal. Header shows connected address + a small disconnect affordance.
- New **Vaults** page (AI vault marketplace) + **Vault detail** page (mandate + allocation + decision feed).
- New **Composer** flow (chat → vault card → approval → one-sig deposit).
- Registry upgrade: add `mandateHash`, allocation weights, and Guardian proposal/approval event surface (new lightweight contract, not a breaking change to the existing one).
- UI reimagining: white/minimal/professional theme (brief already written at `/var/folders/.../lumina-ui-*/brief.md`) — clean cards, small type, one accent, no heavy glow/gradients.

---

## 3. Layout / UI plan (page by page)

> Direction: **white, minimal, professional, small precise type**. The current dark navy "agent console" flips to a clean light surface with a single teal accent. One action per page. Numbers, not decoration.

### Global chrome

```
┌────────────────────────────────────────────────────────────────┐
│ ◈ Lumina   Home · Strategies · Vaults · Agent · Dashboard      │
│                                  [● Coston2 · live] [Connect]  │  ← ONE connect
└────────────────────────────────────────────────────────────────┘
```

- **Header:** logo · nav (add **Vaults** between Strategies and Agent) · status pill · **one Connect Wallet button** (connector modal). Mobile: 5-tab bottom row stays; connect moves into a header row above it.
- **Footer:** unchanged (SiteFooter), plus link to registry audit.

### 1. Home (`/`)
- Hero: "**Tell Lumina what your XRP should do.**" + the composer input bar ("Ask for a vault… e.g. 'conservative ~5%, keep it simple'") with a **Create your vault** CTA.
- 3-step strip: **Describe → Design → Deploy** (each one line).
- Live stats strip (current `LiveVaultStats`).
- Featured vaults (first 2–3 from the Vaults page) + link to all.

### 2. Strategies (`/strategies`, `/strategies/[id]`)
- Keep the catalog + detail page (risk breakdown, yield disclosure, compare). It is the **library of building blocks** the composer draws from.
- Add an "Include in my vault" button on each live strategy → pre-seeds the composer.

### 3. Vaults (`/vaults`) — NEW
- Grid of **AI vaults**: name, mandate summary (2–3 words: "Balanced XRPFi"), risk badge, yield range, allocation mini-bars, TVL, decision-feed snippet. Card CTA: **View vault**.
- "Create your vault" CTA → composer.
- Filter: risk tier, yield range, status.

### 4. Vault detail (`/vaults/[id]`) — NEW
```
┌───────────────────────────────┬──────────────────────────────┐
│ Mandate (plain English)       │ Live allocation (bars)        │
│ Risk score breakdown          │  Firelight  60%  ▲4.1%        │
│ Yield range (sourced)         │  Clearstar  40%  ▲5.9%        │
│ [Deposit] [Withdraw]          │ TVL · share price · updated   │
│                               │ [View on Coston2]             │
├───────────────────────────────┴──────────────────────────────┤
│ Decision feed  (time · fact · reasoning · approve/reject)     │
│ · 14:02  proposed 60/40→50/50 — Firelight APY fell (share      │
│   price 0.987→0.951, on-chain)  [Approve] [Dismiss]           │
│ · 09:11  drift alarm: Clearstar +4.2% vs mandate (+3.1%)      │
└───────────────────────────────────────────────────────────────┘
```

### 5. Composer (`/vaults/composer`) — NEW (headline)
Two-panel layout on desktop, stacked on mobile:
- **Left — conversation:** agent chat (reuses `AgentChat` patterns). User states goal → agent asks 2–3 sharp questions (risk appetite, liquidity, amount) → proposes.
- **Right — live preview card:** updates as the conversation converges — mandate, allocation bars, risk breakdown, yield range, path (FSA/EVM), one **Review & deploy** button.
- Deploy → FSA one-signature flow → success state links to the vault detail page.

### 6. Agent (`/agent`)
- Keep, but add a **"Build a vault"** launcher card (→ composer) and a **Vault actions** tool group (check my vaults, propose rebalance, explain a decision).

### 7. Dashboard (`/dashboard`)
- Wallet-aware: connected → your vaults + positions; not connected → address lookup (keep) + "Connect wallet" hint.
- **Remove the per-connector button grid** (header button handles connect). Keep lookup + positions + empty state.

### 8. FAssets / Execute / Registry audit
- Keep as-is; they anchor trust (how FSA works, the execution path, the on-chain registry).

---

## 4. Architecture

```
┌────────────┐   propose/approve    ┌──────────────────────┐
│  AI Agent  │ ───────────────────► │  UI (Next.js app)    │
│  (Gemini,  │   mandate · weights  │  Composer · Vaults   │
│  tools:    │ ◄─────────────────── │  Dashboard · Agent   │
│  registry, │   approval signal    └─────────┬────────────┘
│  vaults,   │                               │ read/write
│  positions)│        ┌──────────────────────▼─────────────┐
└─────┬──────┘        │  Flare / Coston2 (Flare EVM + FSA) │
      │ live reads    │  LuminaStrategyRegistry (sorT of    │
      ▼               │    truth, non-custodial)            │
┌─────────────┐       │  + AI Vault contract (mandate hash, │
│ Keeper loop │       │    weights, proposals, approvals)   │
│ (drift,     │       │  + FSA vaults (Firelight, Upshift)  │
│  regime,    │       └─────────────────────────────────────┘
│  alerts)    │
└─────────────┘
```

- **Registry** stays the source of truth for strategy identity + risk (already on-chain, verified 2026-08-14, 4 vaults).
- **AI Vault contract** (new, minimal, non-custodial): stores mandateHash, current weights, proposal log; owner-approval-gated rebalance writes; user-only withdrawal. Modeled on the existing registry's zero-dependency style.
- **Agent tools** (extend `lib/agent.ts`): `list_vaults`, `read_vault`, `propose_rebalance`, `read_allocation`, `check_positions` (existing), `compose_vault`.
- **Keeper** (optional for MVP, demo-simulated): a `setInterval`/cron that calls the same drift logic the agent uses, surfacing proposals to the decision feed.
- **Data provenance:** every numeric fact the agent cites carries `{source, timestamp}`; the UI renders it as a small footnote (e.g. "on-chain share price").

---

## 5. Roadmap — start to end

### Phase 0 — Foundation polish (this week, hackathon-ready)
- UI reimagining to white/minimal/professional (brief exists → implement).
- **Single Connect Wallet button in the header** + connector modal; remove per-connector grids.
- Add **Vaults** nav item + stub page (real data in Phase 1).
- Keep e2e green through every change.

### Phase 1 — AI Vault MVP (demo centerpiece)
- Composer: conversation → structured mandate → vault card preview (reuses risk model + live registry reads).
- Registry-backed vault record (off-chain first: mandate JSON + hash stored; on-chain registration if time allows).
- Deploy path: FSA one-signature deposit (already built) into the composed allocation.
- Vault detail page: mandate + allocation + decision feed (first version: proposal log from agent sessions).
- E2E: "user composes a vault and sees the allocation".

### Phase 2 — Guardian
- Rebalance proposal loop: agent detects drift → proposes → user approves → executes (registry-backed).
- Alerts: drift alarm, APY collapse, strategy retired (registry `active=false`).
- Decision feed UI complete (facts + reasoning + approve/dismiss).

### Phase 3 — Intelligence & portfolio
- Dashboard portfolio view (all vaults + positions, wallet-aware).
- Vault marketplace filters + compare (reuse `CompareTable`).
- Audit trail page: every proposal, decision, and approval with on-chain receipts.

### Phase 4 — Production
- Mainnet Flare + verified FAssets.
- Vault-factory on-chain: anyone can deploy an AI vault via the registry.
- Strategy marketplace (publishers register strategies → Lumina risk model + agent curation).
- SDK/API for wallet builders (the Defindex B2B2C move, but with conversation instead of forms).

---

## 6. Risks & guardrails

| Risk | Mitigation |
|---|---|
| Agent hallucinates yields | All yield facts come from tool reads with `derivedFromOnChain` flag; prompt rules already forbid invented numbers; honest error on 429. |
| Agent proposes a bad rebalance | Deterministic guardrails in contract (max weight, allowlist, min interval); user approval; proposal log. |
| Agent key compromise | Agent key is operator-only (can propose/execute allocations, **cannot withdraw**); user withdraws directly from the vault contract. |
| Quota / rate limits (Gemini free tier, 20 req/day) | Fail honest + cache tool reads; keep the "not configured" path; test with quota-aware waits. |
| Dark-UI redesign regression | e2e suite is the gate; token-name-preserving re-theme (brief specifies utilities/tokens must not rename). |
| Scope creep at hackathon | Phase 0 + Phase 1 are the demo; Phases 2–4 are the trajectory, not the deadline. |

---

## 7. Demo script (Phase 0 + 1)

1. Land on home. **Connect wallet** (one button in the header).
2. Type: *"I want ~5% on my XRP, but I'm scared of losing it."*
3. Watch the composer draft a vault card: 60/40 Firelight/Clearstar, risk 2, honest yield range, FSA path.
4. **Review & deploy** → one XRP signature → deposit lands → vault page shows the live allocation + first decision-feed entry.
5. Ask the agent: *"Why 40% Clearstar?"* → it answers with the live facts (registry read, share price, risk breakdown).
6. Close with the strategy/registry audit page to prove it's all real on Coston2.

---

## 8. Immediate next actions

1. **Header connect wallet** (single button + modal; remove per-connector grids).
2. **White/minimal UI re-theme** (brief exists — implement in `globals.css` + component pass).
3. **Vaults page + composer page** (Phase 1), reusing `AgentChat`, risk model, and FSA flow.
4. Keep `pnpm test:e2e` green at each step.
