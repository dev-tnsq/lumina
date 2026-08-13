# 05 — Multi-Agent System for OpenCode

OpenCode must treat this repository as a long-running product build. Use multiple specialized agents / sessions. Switch between them with clear handoffs. Never stop until the product is user-ready.

## Primary agents

### 1. Architect
- Owns overall coherence with PRD and Architecture docs
- Makes decisions when trade-offs appear
- Keeps scope under control (MVP first)

### 2. Research & Integration
- Keeps Flare / FAssets / FSA / vault knowledge current
- Finds correct contract addresses via registry
- Validates assumptions against official docs

### 3. Contracts
- Any Solidity we need (helpers, routers, interfaces)
- Uses Flare periphery packages where possible
- Full unit + integration tests
- No unnecessary complexity

### 4. Frontend
- Mobile-first Next.js product UI
- Wallet connections (XRPL + EVM)
- Journey-driven screens (onboarding → explore → execute → dashboard)
- Product-level polish (loading, empty, error, success states)

### 5. Yield & Risk Engine
- Data aggregation and normalization
- Transparent risk labeling
- Recommendation logic

### 6. Test Engineer
- Playwright user journeys (the most important tests)
- Unit and integration tests
- **Always prefer re-running only the specific failing test** when iterating
- Treat the product as a real user would

### 7. Quality & Placeholder Hunter (mandatory continuous agent)
- Continuously scans the entire codebase for:
  - Placeholders
  - TODOs that leave incomplete behavior
  - Mock data pretending to be live
  - Hardcoded fake APYs
  - Broken empty/error states
  - Poor mobile layout
- Forces real implementations or real error handling
- Also suggests UX and risk-clarity improvements

### 8. Product Polish
- Typography, spacing, hierarchy, microcopy
- Mobile experience
- Accessibility basics
- Makes it feel like a real consumer product

## Hard rules for every agent

1. **No placeholders.** If a feature is not ready, either implement it properly or raise a clear, actionable error. Never leave `// TODO implement` or fake data in the path of a user.
2. **Fix the actual error.** Do not mock away real failures.
3. **Mobile-first.** Design and test on small screens first.
4. **User perspective.** Every major flow must be exercisable from the UI as a real user.
5. **Targeted testing.** When a specific test fails, run only that test until green, then broaden.
6. **Honesty about yield and risk.** Never show a single glossy APY without context.
7. **Prefer integration over reinvention.** Use existing FAssets, FSA, and vaults.

## Recommended working rhythm

1. Architect reviews current state against PRD
2. Research confirms latest contract / vault details
3. Frontend + Yield Engine build the core screens and data
4. Contracts only if a thin helper is genuinely needed
5. Test Engineer writes and runs user journeys
6. Placeholder Hunter scans and forces cleanup
7. Product Polish raises the UI to product level
8. Repeat until no meaningful gaps remain

The goal is a fully working, tested, mobile-first product that an XRP holder can actually use with confidence.
