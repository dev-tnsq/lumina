# 04 — Data & User Flows

## Primary happy path (FSA / XRPL preferred)

1. User lands on Lumina (mobile)
2. Connects XRPL-compatible wallet or starts guided flow
3. Sees plain-language explanation of what will happen to their XRP
4. Chooses risk preference or explores ranked strategies
5. Selects a strategy (e.g. Clearstar earnXRP)
6. Lumina prepares the correct FSA instruction / memo
7. User signs one XRPL Payment
8. Operator + FDC + MasterAccountController execute mint + deposit
9. Lumina detects the new position and shows it on the dashboard with risk status

## Alternative path (existing Flare wallet)

1. User connects EVM wallet on Flare / Coston2
2. If they already hold FXRP → go straight to strategy selection and deposit
3. If not → guided minting instructions or link to official minting dApps + clear next steps
4. Deposit into chosen vault
5. Position appears on dashboard

## Yield comparison data flow

- On-chain reads / subgraph / official APIs for TVL, share price, recent performance
- Normalization layer produces comparable cards
- Risk engine attaches label + key risk bullets
- Recommendation engine re-ranks based on user preference

## Position tracking

- Detect FXRP balances and vault shares belonging to the user’s addresses (personal account + EVM)
- Map vault shares back to human-readable strategy names
- Surface current estimated value and risk status

## Error & recovery flows

- Failed mint / deposit → clear status + exact recovery steps
- Insufficient amount / wrong network → immediate plain-language feedback
- Withdrawal queue or restricted period → honest messaging + estimated timing

All flows must be testable end-to-end with Playwright as a real user.
