# 03 — Architecture

## High-level system

Lumina is a consumer-facing application layered on top of existing Flare infrastructure. It does **not** try to replace FAssets or the major vaults. It owns the guidance, risk presentation, recommendation, and smooth execution layer.

```
┌─────────────────────────────────────────────────────────────┐
│                     Lumina Frontend                         │
│              (Next.js, mobile-first, product UI)            │
└───────────────────────┬─────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
┌─────────▼─────────┐       ┌─────────▼─────────┐
│  Yield & Risk     │       │  Execution Layer  │
│  Engine           │       │  (FSA + wallets)  │
│  (aggregator +    │       │                   │
│   scoring)        │       │                   │
└─────────┬─────────┘       └─────────┬─────────┘
          │                           │
          └─────────────┬─────────────┘
                        │
          ┌─────────────▼─────────────┐
          │   Flare + XRPL + Vaults   │
          │  FAssets · FSA · Clearstar│
          │  Monarq · Firelight · etc │
          └───────────────────────────┘
```

## Frontend

- Next.js (App Router)
- Mobile-first responsive design
- Wallet connectivity:
  - XRPL wallets (Xaman, Bifrost, etc.) for FSA path
  - EVM wallets (via Wagmi / viem) for pure Flare path
- State management focused on user journey and position state
- Real-time or near-real-time position and yield data

## Yield & Risk Engine

- Aggregates live or near-live data from priority protocols
- Normalizes APY presentation (range + recency)
- Assigns risk labels using a transparent scoring model
- Powers recommendations and the dashboard
- Can start with well-structured static + on-chain reads and evolve to a small backend service

## Execution layer

Primary path: Flare Smart Accounts (one XRPL signature → mint + deposit)
Secondary path: Classic EVM wallet interactions with clear step-by-step guidance

Any thin contracts we introduce (e.g. helper routers, position registries, or recommendation on-chain anchors) live in `packages/contracts` and must be minimal, audited-style, and well-tested.

## Data principles

- Prefer on-chain truth
- Never invent APY numbers
- Always show risk context next to yield
- Cache aggressively for UX but invalidate correctly

## Security posture

- No custody of user funds
- All critical actions go through user signatures (XRPL or EVM)
- Clear disclosure of smart contract and strategy risks
- Minimize new attack surface; integrate rather than reinvent
