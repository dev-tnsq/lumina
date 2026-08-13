#!/usr/bin/env bash
#
# Deploy LuminaStrategyRegistry to Coston2 testnet.
#
# Usage:
#   COSTON2_RPC_URL=<rpc> COSTON2_PRIVATE_KEY=<key> ./scripts/deploy-registry.sh
#
# Notes:
#   - Requires a funded Coston2 deployer key (use the official faucet:
#     https://faucet.towolabs.com to get C2FLR for gas).
#   - The registry constructor takes the deployer as initial owner.
#   - Outputs the deployed address; paste it into
#     packages/shared/src/constants.ts (COSTON2_CONTRACTS.registry).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${COSTON2_RPC_URL:?Set COSTON2_RPC_URL (https://coston2-api.flare.network/ext/C/rpc)}"
: "${COSTON2_PRIVATE_KEY:?Set COSTON2_PRIVATE_KEY (deployer, funded with C2FLR)}"

echo "Deploying LuminaStrategyRegistry to Coston2..."
forge create \
  --rpc-url "$COSTON2_RPC_URL" \
  --private-key "$COSTON2_PRIVATE_KEY" \
  --broadcast \
  src/LuminaStrategyRegistry.sol:LuminaStrategyRegistry \
  --constructor-args "$(cast wallet address --private-key "$COSTON2_PRIVATE_KEY")"

echo "Done. Copy the Deployed to: address into packages/shared/src/constants.ts"
