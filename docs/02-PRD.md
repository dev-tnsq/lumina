# 02 — Product Requirements Document (PRD)

## Vision

Lumina is the safest and clearest way for an XRP holder to put XRP to work in Flare DeFi.

## Target user

- Holds XRP (often on exchange or XRPL wallet)
- Wants yield but is intimidated by DeFi complexity and risk
- Values clarity, safety, and mobile experience over maximum leverage or exotic strategies
- Willing to use Flare Smart Accounts / XRPL signing if the path is guided

## Core value proposition

1. **Onboarding clarity** — “Here’s exactly what happens to your XRP”
2. **Transparent comparison** — real yields + risk labels side by side
3. **Guided execution** — one-click / few-step paths using FSA where possible
4. **Position awareness** — single dashboard of what you own and its current risk
5. **Ongoing safety** — risk alerts and simple exit paths

## MVP Scope (must ship)

### 1. Onboarding flow
- Explain FAssets + FXRP in plain language
- Support both:
  - Direct FSA / XRPL path (preferred)
  - Existing Flare EVM wallet path
- Clear status of minting / deposit steps

### 2. Yield route explorer
- List priority strategies (Clearstar, Monarq, Firelight, Kinetic supply, etc.)
- Show:
  - Estimated / recent APY range (not single fake number)
  - TVL / liquidity signal
  - Risk label (Conservative / Balanced / Advanced)
  - One-sentence explanation of strategy
  - Key risks

### 3. Strategy recommendation engine
- Simple questionnaire or preference (risk tolerance, lock-up comfort, preferred simplicity)
- Ranked recommendations with reasoning
- Ability to simulate approximate outcome

### 4. One-click / guided execution
- Prefer Flare Smart Accounts flow when possible
- Clear transaction preview and status
- Fallback to manual steps with exact instructions if needed

### 5. Position dashboard
- All Lumina-managed or detected FXRP positions
- Current value, estimated yield, risk status
- Simple exit / redeem guidance

### 6. Risk alerts
- Basic alerts for material changes (protocol risk events, large APY swings, withdrawal restrictions)

### 7. Mobile-first product UI
- Looks and feels like a real consumer finance app, not a dApp explorer
- Excellent empty states, loading states, error states
- Clear typography and hierarchy

## Non-goals for MVP

- Building a new heavy yield aggregator vault (integrate existing ones)
- Full institutional features
- Cross-chain yield beyond Flare (can be later)
- Complex options / perps strategies as default (keep in Advanced section)

## Success metrics

- User can go from zero knowledge to a live position in < 5 minutes on mobile
- Clear understanding of risk before any transaction
- High completion rate of guided flows
- Low support / confusion rate
- Positive feedback on clarity vs pure DeFi frontends

## Future (post-MVP)

- Automated rebalancing suggestions
- Portfolio-level risk scoring
- Social / shared strategies
- Deeper integration with Derive and Spectra for advanced users
- Notification system

## Design principles

- Clarity over completeness
- Safety over maximum yield
- Mobile-first
- No dark patterns
- Honest about variable yields and risks
