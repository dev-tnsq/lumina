# 01 — Research: Flare XRPFi Reality (August 2026)

## Executive summary

Flare has successfully turned XRP into a productive DeFi asset via **FAssets (FXRP)** and **Flare Smart Accounts**. The infrastructure is live and growing. The remaining gap is **consumer-grade guidance and risk clarity**. That is exactly the opportunity for Lumina.

## FAssets / FXRP

- FXRP is a 1:1 over-collateralized ERC-20 representation of XRP on Flare.
- Secured by Flare Data Connector (FDC) verification of XRPL transactions + over-collateralization by agents + community pool.
- Preferred minting path (2026): **Direct minting** to the Core Vault on XRPL using destination tag or 32-byte memo that encodes the Flare recipient. An executor finalizes on Flare.
- Core Vault improves capital efficiency and enables larger/safer redemptions.
- FXRP is also available as an Omnichain Fungible Token (OFT) via LayerZero for bridging to other chains (Base, HyperEVM, etc.), but the home and deepest liquidity remain on Flare.

### Key developer resources
- Flare Developer Hub: https://dev.flare.network/fassets/
- Minting guide: https://dev.flare.network/fassets/developer-guides/fassets-mint
- Contract registry (same address on all networks): `0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`
- Testnet: Coston2 (Chain ID 114). Faucet gives C2FLR + test FXRP + USDT0.

## Flare Smart Accounts (FSA)

- Account abstraction that lets pure XRPL users control a personal smart account on Flare **without holding FLR**.
- User signs a normal XRPL Payment; an operator + FDC proof executes the instruction on Flare.
- Critical for UX: one signature can mint FXRP and deposit into a vault.
- MasterAccountController is the central diamond. Personal accounts are deterministic per XRPL address.
- Supported instruction types include deposit into Firelight-style vaults and custom instructions.

This is the preferred onboarding path for Lumina’s “one-tap” strategies.

## Live yield destinations (priority order for Lumina)

1. **Clearstar Flare XRP Yield Vault (earnXRP via Upshift)**  
   Largest TVL. Fully on-chain allocation across Kinetic, Morpho, Firelight, LPs. Transparent.

2. **Monarq XRP Yield Vault (MXRPY)**  
   Multi-strategy (options + basis/funding + on-chain). Higher complexity, different risk profile.

3. **Firelight (stXRP)**  
   Liquid staking / Economically Secured Services. Core building block.

4. **Kinetic & Morpho**  
   Lending markets. Good for conservative supply.

5. **Spectra**  
   Yield trading / Principal Tokens. Higher sophistication.

6. **Derive**  
   Options & perps using FXRP as collateral. Higher risk, advanced users only.

Yields are variable. Never show marketing APY without clear risk labels and historical range.

## Risk surface Lumina must make transparent

- Smart contract risk of each vault/protocol
- FAssets agent / collateralization risk (though over-collateralized)
- Liquidity / withdrawal queue risk (some vaults have periods)
- Strategy risk (especially multi-strategy and options)
- Oracle / FDC risk
- Bridge / OFT risk if user later moves off Flare
- User error (wrong memo, wrong network, etc.)

Lumina’s value is turning this complexity into plain-language risk labels + ranked recommendations.

## Why a guided consumer product is needed

Even with FSA and good vaults, the average XRP holder still faces:
- Multiple interfaces
- Unclear relative risk
- No single dashboard of their positions
- Fear of irreversible mistakes

Lumina owns the “safe first experience” and then graduates users into deeper strategies.

## Testnet reality

- Primary development target: **Coston2**
- Use faucet for FXRP instead of full minting during early development
- XRPL Testnet for real minting flow testing
- Always verify contract addresses via FlareContractRegistry rather than hardcoding where possible

## Sources of truth

- https://dev.flare.network/
- https://flare.network/products/fassets
- https://xrpfi.flare.network/
- Official Flare news on FSA v1.3, vault launches, Derive integration
- Upshift / Clearstar / Monarq vault pages for live parameters
