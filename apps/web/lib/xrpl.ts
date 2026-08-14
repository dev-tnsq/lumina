import { createPublicClient, http, type PublicClient } from "viem";
import { xrpToDrops, isValidClassicAddress, encodeAccountID } from "xrpl";
import { MASTER_ACCOUNT_CONTROLLER_ABI } from "@lumina/shared";
import { COSTON2_CONTRACTS, XRPL_TESTNET } from "@lumina/shared";
import { coston2 } from "./wagmi";
const publicClient: PublicClient = createPublicClient({
  chain: coston2,
  transport: http(),
});

export { isValidClassicAddress };

/**
 * The XRPL address of a Flare Smart Account is the base58 (XRPL) encoding of
 * its EVM address bytes, per Flare's FSA address scheme.
 */
export function evmToXrplAddress(evmAddress: `0x${string}`): string {
  const bytes = Uint8Array.from(Buffer.from(evmAddress.slice(2), "hex"));
  return encodeAccountID(bytes);
}

/** Convert an XRP amount (decimal string) to drops (integer string). */
export function xrpAmountToDrops(amount: string): string | null {
  try {
    return xrpToDrops(amount);
  } catch {
    return null;
  }
}

/**
 * Derive the deterministic Flare Smart Account for an XRPL address,
 * reading straight from the MasterAccountController on Coston2.
 */
export async function getPersonalAccount(xrplAddress: string): Promise<`0x${string}`> {
  return publicClient.readContract({
    address: COSTON2_CONTRACTS.masterAccountController,
    abi: MASTER_ACCOUNT_CONTROLLER_ABI,
    functionName: "getPersonalAccount",
    args: [xrplAddress],
  }) as Promise<`0x${string}`>;
}

export const XRPL_TESTNET_CONFIG = XRPL_TESTNET;
