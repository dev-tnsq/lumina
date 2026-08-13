import {
  type PublicClient,
  hexToBigInt,
  pad,
  toHex,
} from "viem";
import {
  FirelightDepositInstruction,
  FXRPTransferInstruction,
  UpshiftDepositInstruction,
  type HexString,
} from "@flarenetwork/smart-accounts-encoder";
import {
  ASSET_MANAGER_FXRP_ABI,
  ERC20_ABI,
  FLARE_CONTRACT_REGISTRY_ABI,
  MASTER_ACCOUNT_CONTROLLER_ABI,
  VAULT_ABI,
} from "./abis";
import {
  COSTON2_CONTRACTS,
  FXRP_LOT_SIZE,
} from "./constants";
import type { StrategyVault, VaultType } from "./types";

/**
 * Flare helpers — on-chain reads against Coston2.
 * Addresses are resolved via the FlareContractRegistry at runtime where
 * possible, per Flare's guidance (do not hardcode addresses).
 */

export async function getContractAddressByName(
  client: PublicClient,
  name: string
): Promise<`0x${string}`> {
  return client.readContract({
    address: COSTON2_CONTRACTS.flareContractRegistry,
    abi: FLARE_CONTRACT_REGISTRY_ABI,
    functionName: "getContractAddressByName",
    args: [name],
  });
}

/** Resolve the FXRP asset manager from the registry, then the FXRP token. */
export async function getFxrpToken(client: PublicClient): Promise<`0x${string}`> {
  const assetManager = await getContractAddressByName(client, "AssetManagerFXRP");
  return client.readContract({
    address: assetManager,
    abi: ASSET_MANAGER_FXRP_ABI,
    functionName: "fAsset",
  });
}

export async function getFxrpBalance(
  client: PublicClient,
  address: `0x${string}`
): Promise<bigint> {
  return client.readContract({
    address: COSTON2_CONTRACTS.fxrp,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  });
}

export async function getFxrpDecimals(client: PublicClient): Promise<number> {
  return client.readContract({
    address: COSTON2_CONTRACTS.fxrp,
    abi: ERC20_ABI,
    functionName: "decimals",
  });
}

/** Deterministic Flare Smart Account for an XRPL address. */
export async function getPersonalAccount(
  client: PublicClient,
  xrplAddress: string
): Promise<`0x${string}`> {
  return client.readContract({
    address: COSTON2_CONTRACTS.masterAccountController,
    abi: MASTER_ACCOUNT_CONTROLLER_ABI,
    functionName: "getPersonalAccount",
    args: [xrplAddress],
  });
}

/** Vaults registered with the MasterAccountController on Coston2. */
export async function getRegisteredVaults(
  client: PublicClient
): Promise<StrategyVault[]> {
  const [ids, addresses, types] = await client.readContract({
    address: COSTON2_CONTRACTS.masterAccountController,
    abi: MASTER_ACCOUNT_CONTROLLER_ABI,
    functionName: "getVaults",
  });
  const typeMap: Record<number, VaultType> = { 1: "firelight", 2: "upshift" };
  return ids.map((id, i) => {
    const address = addresses[i] as `0x${string}` | undefined;
    const type = typeMap[Number(types[i])] ?? "upshift";
    return {
      vaultId: Number(id),
      address: address ?? "0x0000000000000000000000000000000000000000",
      type,
      name: "",
      symbol: "",
    };
  });
}

/** Vault metadata (name/symbol/decimals) from the chain. */
export async function getVaultMetadata(
  client: PublicClient,
  vault: StrategyVault
): Promise<{ name: string; symbol: string; decimals: number }> {
  const name = (await client.readContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: "name",
  })) as string;
  const symbol = (await client.readContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: "symbol",
  })) as string;
  const decimals = (await client.readContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: "decimals",
  })) as number;
  return { name, symbol, decimals };
}

/** Vault asset token address (should be FXRP on Coston2). */
export async function getVaultAsset(
  client: PublicClient,
  vault: StrategyVault
): Promise<`0x${string}`> {
  return client.readContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: "asset",
  });
}

/** Total assets held by a vault (on-chain). */
export async function getVaultTotalAssets(
  client: PublicClient,
  vault: StrategyVault
): Promise<bigint> {
  return client.readContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: "totalAssets",
  });
}

/** Share balance of an address in a vault. */
export async function getVaultShares(
  client: PublicClient,
  vault: StrategyVault,
  holder: `0x${string}`
): Promise<bigint> {
  return client.readContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: "balanceOf",
    args: [holder],
  });
}

/** Convert a share amount into asset amount (share price read). */
export async function convertSharesToAssets(
  client: PublicClient,
  vault: StrategyVault,
  shares: bigint
): Promise<bigint> {
  return client.readContract({
    address: vault.address,
    abi: VAULT_ABI,
    functionName: "convertToAssets",
    args: [shares],
  });
}

/**
 * FSA payment-reference (memo) encoding.
 *
 * Encoding is delegated to Flare's official `@flarenetwork/smart-accounts-encoder`
 * package (the authoritative implementation). Layout per the official
 * "FAsset Instructions" spec:
 *
 * 32-byte payment reference:
 *   [0]     = instruction ID (type nibble | command nibble)
 *   [1]     = walletId
 *   [2..11] = value  (10-byte big-endian field)
 *   [12..13] = ignored (zero)         (Firelight/Upshift layout)
 *   [14..15] = vaultId                (Firelight/Upshift layout)
 *   [16..31] = ignored / recipient    (FXRP transfer layout)
 */

export const FSA_INSTRUCTION = {
  FXRP_TRANSFER: 0x01,
  FXRP_REDEEM: 0x02,
  FIRELIGHT_DEPOSIT: 0x11,
  FIRELIGHT_REDEEM: 0x12,
  FIRELIGHT_CLAIM: 0x13,
  UPSHIFT_DEPOSIT: 0x21,
  UPSHIFT_REQUEST_REDEEM: 0x22,
  UPSHIFT_CLAIM: 0x23,
} as const;

/** walletId assigned by Flare for wallet identification. Lumina uses 0x01. */
export const LUMINA_WALLET_ID = 0x01;

/** Number of lots in a given FXRP amount (1 lot = lotSize = 10 FXRP on Coston2). */
export function fxrpAmountToLots(amount: bigint): bigint {
  return amount / FXRP_LOT_SIZE;
}

export function lotsToFxrpAmount(lots: bigint): bigint {
  return lots * FXRP_LOT_SIZE;
}

export function encodeVaultDepositMemo(opts: {
  instruction: typeof FSA_INSTRUCTION.FIRELIGHT_DEPOSIT | typeof FSA_INSTRUCTION.UPSHIFT_DEPOSIT;
  walletId?: number;
  /** Amount in FXRP drops (1e-6 FXRP) to deposit. */
  drops: bigint;
  vaultId: number;
}): HexString {
  const { instruction, walletId = LUMINA_WALLET_ID, drops, vaultId } = opts;
  if (instruction === FSA_INSTRUCTION.FIRELIGHT_DEPOSIT) {
    return new FirelightDepositInstruction({ walletId, value: drops, vaultId }).encode();
  }
  return new UpshiftDepositInstruction({ walletId, value: drops, vaultId }).encode();
}

export function encodeFxrpTransferMemo(opts: {
  walletId?: number;
  drops: bigint;
  recipient: `0x${string}`;
}): HexString {
  const { walletId = LUMINA_WALLET_ID, drops, recipient } = opts;
  return new FXRPTransferInstruction({
    walletId,
    value: drops,
    recipientAddress: recipient,
  }).encode();
}

/** Decode a payment-reference memo back into a human-readable description. */
export function decodeMemo(memo: `0x${string}`): {
  instruction: number;
  walletId: number;
  value: bigint;
  vaultId: number;
  recipient?: `0x${string}`;
} {
  const bytes = hexToBytes(memo);
  const instruction = bytes[0] ?? 0;
  const walletId = bytes[1] ?? 0;
  const value = readBigUintBE(bytes, 2, 10);
  const vaultId = ((bytes[14] ?? 0) << 8) | (bytes[15] ?? 0);
  let recipient: `0x${string}` | undefined;
  if (instruction === FSA_INSTRUCTION.FXRP_TRANSFER) {
    recipient = toHex(bytes.slice(12, 32));
  }
  return { instruction, walletId, value, vaultId, recipient };
}

function readBigUintBE(bytes: Uint8Array, offset: number, length: number): bigint {
  let value = 0n;
  for (let i = 0; i < length; i++) {
    value = (value << 8n) | BigInt(bytes[offset + i] ?? 0);
  }
  return value;
}

function hexToBytes(hex: `0x${string}`): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

/** Build an XRPL Payment transaction ready to be signed by an XRPL wallet. */
export function buildXrplPayment(opts: {
  account: string;
  destination: string;
  amount: string;
  memoHex: `0x${string}`;
}): Record<string, unknown> {
  const { account, destination, amount, memoHex } = opts;
  return {
    TransactionType: "Payment",
    Account: account,
    Destination: destination,
    Amount: amount,
    Memos: [
      {
        Memo: {
          MemoType: stringToHex("lumina/fsa/v1"),
          MemoData: memoHex.slice(2),
        },
      },
    ],
    Fee: "12",
  };
}

function stringToHex(str: string): string {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hex;
}

export { hexToBigInt, pad };
