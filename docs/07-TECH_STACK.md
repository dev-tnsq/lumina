# 07 — Tech Stack

## Frontend
- Next.js (App Router) + TypeScript
- Tailwind CSS + clean product design system
- Wagmi + viem for Flare EVM
- XRPL library / wallet adapters for the Smart Accounts path
- React Query (or equivalent) for data fetching and caching

## Contracts (minimal)
- Solidity 0.8.x
- Hardhat or Foundry
- @flarenetwork/flare-periphery-contracts where applicable
- OpenZeppelin only when needed

## Data / Backend
- Start with direct on-chain reads + light API routes in Next.js
- Evolve to a small dedicated service only if needed for aggregation or caching
- Prefer official Flare endpoints and on-chain truth

## Testing
- Vitest or Jest for unit
- Playwright for E2E (user journeys)
- Hardhat/Foundry tests for any contracts

## Tooling
- pnpm workspaces (monorepo)
- ESLint + Prettier
- TypeScript strict

## Networks
- Primary development: Flare Coston2
- XRPL Testnet for minting flow validation
- Mainnet only after thorough testing and clear risk disclosure

## Why this stack

- Fast iteration for a product UI
- Excellent TypeScript DX
- Strong existing Flare / Ethereum tooling
- Playwright is the best way to enforce real user quality
