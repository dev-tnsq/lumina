"use client";

import { useState } from "react";
import type { Strategy } from "@lumina/shared";
import {
  encodeVaultDepositMemo,
  buildXrplPayment,
  FSA_INSTRUCTION,
  fxrpAmountToLots,
  formatUnitsValue,
  FXRP_LOT_SIZE,
  XRPL_TESTNET,
} from "@lumina/shared";
import {
  isValidClassicAddress,
  xrpAmountToDrops,
  getPersonalAccount,
  evmToXrplAddress,
} from "@/lib/xrpl";

/**
 * The preferred Flare Smart Account path. Lumina prepares the exact XRPL
 * payment that moves XRP into the FSA and deposits FXRP into the vault —
 * one XRPL signature is the whole point of the FSA design.
 *
 * The destination is the FSA's XRPL address (the XRPL encoding of its EVM
 * address), the amount is the XRP being converted, and the memo carries the
 * FSA instruction (deposit into vaultId, amount in FXRP drops) encoded with
 * Flare's official encoder.
 */
export function FsaDepositFlow({
  strategy,
  initialAmount,
}: {
  strategy: Strategy;
  /** Pre-filled by an agent intent (?amount=). */
  initialAmount?: string;
}) {
  const vault = strategy.vault;
  const [xrplAddress, setXrplAddress] = useState("");
  const [amount, setAmount] = useState(initialAmount ?? "");
  const [derived, setDerived] = useState<`0x${string}` | null>(null);
  const [deriving, setDeriving] = useState(false);
  const [derivedError, setDerivedError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const addressValid = isValidClassicAddress(xrplAddress.trim());
  const xrpDrops = xrpAmountToDrops(amount || "0");
  const lots = xrpDrops != null ? fxrpAmountToLots(BigInt(xrpDrops)) : null;

  const fsaXrplAddress = derived && derived !== "0x0000000000000000000000000000000000000000"
    ? evmToXrplAddress(derived)
    : null;

  async function derive() {
    if (!addressValid) return;
    setDeriving(true);
    setDerivedError(null);
    try {
      const addr = await getPersonalAccount(xrplAddress.trim());
      setDerived(addr);
    } catch (e) {
      setDerivedError(
        `Could not read the registry on Coston2: ${(e as Error).message?.slice(0, 160)}`
      );
    } finally {
      setDeriving(false);
    }
  }

  const memo = (() => {
    if (xrpDrops == null || vault == null) return null;
    try {
      const instruction =
        vault.type === "firelight"
          ? FSA_INSTRUCTION.FIRELIGHT_DEPOSIT
          : FSA_INSTRUCTION.UPSHIFT_DEPOSIT;
      return encodeVaultDepositMemo({
        instruction,
        drops: BigInt(xrpDrops),
        vaultId: vault.vaultId,
      });
    } catch {
      return null;
    }
  })();

  const paymentJson =
    memo && fsaXrplAddress && xrpDrops
      ? buildXrplPayment({
          account: xrplAddress.trim(),
          destination: fsaXrplAddress,
          amount: xrpDrops,
          memoHex: memo,
        })
      : null;

  async function copyPayment() {
    if (!paymentJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(paymentJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can copy from the textarea */
    }
  }

  if (!vault) {
    return (
      <p className="rounded-2xl border border-gold/30 bg-gold-soft p-4 text-[13px] leading-snug text-gold">
        No FSA vault is registered for this strategy on Coston2, so the guided FSA path
        is not available. Try a live strategy.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step 1 — XRPL address */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold text-ink">1 · Your XRPL Testnet address</h3>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          Lumina reads your deterministic Flare Smart Account for this address from the
          on-chain registry. One XRPL signature will control it.
        </p>
        <input
          type="text"
          value={xrplAddress}
          onChange={(e) => {
            setXrplAddress(e.target.value);
            setDerived(null);
          }}
          placeholder="rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
          aria-label="XRPL testnet address"
          className="mt-3 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-muted/60 focus:border-brand"
        />
        {xrplAddress !== "" && !addressValid && (
          <p className="mt-1.5 text-xs text-danger">
            That doesn&apos;t look like a valid XRPL address.
          </p>
        )}
        <button
          type="button"
          disabled={!addressValid || deriving}
          onClick={derive}
          className="mt-3 w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-brand disabled:opacity-40"
        >
          {deriving
            ? "Reading registry…"
            : derived
              ? "Re-read my smart account"
              : "Find my smart account"}
        </button>
        {derivedError && <p className="mt-2 text-xs text-danger">{derivedError}</p>}
        {derived && (
          <div className="mt-3 space-y-2 rounded-xl border border-brand/30 bg-brand-soft p-3">
            <div>
              <p className="text-xs text-muted">Flare Smart Account (EVM, Coston2)</p>
              <p className="mt-0.5 font-mono text-sm font-semibold break-all text-brand">
                {derived}
              </p>
            </div>
            {fsaXrplAddress && (
              <div>
                <p className="text-xs text-muted">Its XRPL address (payment destination)</p>
                <p className="mt-0.5 font-mono text-sm font-semibold break-all text-brand">
                  {fsaXrplAddress}
                </p>
              </div>
            )}
            {derived === "0x0000000000000000000000000000000000000000" && (
              <p className="text-[12px] leading-snug text-ink-soft">
                This address has no smart account yet — it is created the first time the
                Flare testnet tooling mints FXRP for it. The prepared payment stays
                correct.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Step 2 — amount */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold text-ink">2 · How much XRP to deposit</h3>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5 focus-within:border-brand">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            aria-label="Amount in XRP"
            className="w-full bg-transparent text-lg font-bold text-ink outline-none placeholder:text-line"
          />
          <span className="shrink-0 text-sm font-semibold text-muted">XRP</span>
        </div>
        {xrpDrops != null && lots != null && amount !== "" && (
          <div className="mt-2 space-y-1 text-[12px] leading-snug text-muted">
            <p>
              = {xrpDrops} drops · {lots} lot{lots === 1n ? "" : "s"} (1 lot ={" "}
              {formatUnitsValue(FXRP_LOT_SIZE, 6)} FXRP)
            </p>
            {lots === 0n && (
              <p className="text-warn">
                FAsset deposits are sized in lots. Below one lot the minting path will
                not accept the amount.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Step 3 — payment */}
      <section className="card p-5">
        <h3 className="text-sm font-semibold text-ink">3 · Review the prepared payment</h3>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          The XRPL payment to your smart account. The memo is the FSA instruction —{" "}
          {vault.type === "firelight"
            ? "Firelight deposit (0x11)"
            : "Upshift deposit (0x21)"}{" "}
          into vaultId {vault.vaultId} — encoded with Flare&apos;s official
          @flarenetwork/smart-accounts-encoder.
        </p>

        {paymentJson ? (
          <>
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-line/60 bg-[#04070c] p-3 font-mono text-[11px] leading-relaxed text-ink-soft">
              {JSON.stringify(paymentJson, null, 2)}
            </pre>
            <button
              type="button"
              onClick={copyPayment}
              data-copied={copied ? "true" : "false"}
              className="mt-3 w-full rounded-xl border border-brand/40 bg-brand/10 px-4 py-2.5 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-[#03201b]"
            >
              {copied ? "Copied ✓" : "Copy transaction JSON"}
            </button>
          </>
        ) : (
          <p className="mt-3 text-[13px] text-muted">
            Enter your XRPL address, find your smart account, and set an amount to
            prepare the payment.
          </p>
        )}

        <ol className="mt-4 space-y-2 border-t border-line pt-3 text-[13px] leading-snug text-ink-soft">
          <li className="flex gap-2">
            <span className="font-bold text-brand">1.</span>
            <span>
              Get test XRP on {XRPL_TESTNET.name} from the{" "}
              <a
                href={XRPL_TESTNET.faucetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand underline"
              >
                official XRPL faucet
              </a>
              .
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-brand">2.</span>
            <span>
              Sign and submit this payment with an XRPL wallet (e.g. Xaman). The XRPL
              signature is the single authorization the FSA needs.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-brand">3.</span>
            <span>
              The FSA confirms the payment reference, the deposit executes on Flare, and
              you receive vault shares. Track it on the Coston2 explorer and the
              Dashboard.
            </span>
          </li>
        </ol>

        <p className="mt-3 rounded-xl border border-gold/30 bg-gold-soft p-3 text-[12px] leading-snug text-gold">
          Testnet-only: XRP and FXRP on test networks have no real value. The memo uses
          the same FSA instruction encoding as production, so the mainnet transition is
          mechanical.
        </p>
      </section>
    </div>
  );
}
