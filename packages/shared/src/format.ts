/**
 * Formatting utilities — consistent number/address formatting across Lumina.
 */

/** Format a raw integer amount with the given decimals into a human string. */
export function formatUnitsValue(value: bigint, decimals: number, maxFrac = 4): string {
  if (value < 0n) return `-${formatUnitsValue(-value, decimals, maxFrac)}`;
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const factor = 10n ** BigInt(decimals);
  const whole = abs / factor;
  const frac = abs % factor;
  if (frac === 0n) return `${negative ? "-" : ""}${whole.toString()}`;
  let fracStr = frac.toString().padStart(decimals, "0");
  fracStr = fracStr.slice(0, maxFrac).replace(/0+$/, "");
  if (fracStr.length === 0) return `${negative ? "-" : ""}${whole.toString()}`;
  return `${negative ? "-" : ""}${whole.toString()}.${fracStr}`;
}

/** Shorten an address: 0x1234…abcd */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (!address.startsWith("0x")) return address;
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Format a percentage (e.g. 5.92 -> "5.92%"). Handles negatives. */
export function formatPercent(value: number, maxFrac = 2): string {
  const str = value.toFixed(maxFrac);
  return `${str}%`;
}

/** Format an APY range honestly: "4% – 12% (reference)" */
export function formatApyRange(low: number, high: number): string {
  return `${formatPercent(low)} – ${formatPercent(high)}`;
}

/** Human time since a timestamp. */
export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/** Format TVL-ish numbers with k/M/B suffixes, e.g. "101.4k FXRP". */
export function formatCompact(value: bigint, decimals: number): string {
  const amount = Number(formatUnitsValue(value, decimals, 6));
  if (Math.abs(amount) >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return amount.toFixed(2);
}
