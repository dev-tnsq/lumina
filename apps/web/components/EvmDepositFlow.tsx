"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, parseUnits } from "viem";
import type { Strategy } from "@lumina/shared";
import { ERC20_ABI, VAULT_ABI, COSTON2, COSTON2_CONTRACTS, formatUnitsValue, shortenAddress } from "@lumina/shared";

/**
 * The EVM path: a real, on-chain deposit into the vault on Coston2.
 * Steps: connect wallet → get test FXRP from the faucet if needed →
 * approve the vault → deposit. Every error surfaces with a recovery step.
 */
export function EvmDepositFlow({
  strategy,
  initialAmount,
}: {
  strategy: Strategy;
  /** Pre-filled by an agent intent (?amount=). */
  initialAmount?: string;
}) {
  const vault = strategy.vault;
  const asset = strategy.asset ?? { symbol: "FXRP", decimals: 6, address: COSTON2_CONTRACTS.fxrp as `0x${string}` };

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [amount, setAmount] = useState(initialAmount ?? "");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useReadContract({
    address: asset.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: allowance, isLoading: allowanceLoading, refetch: refetchAllowance } = useReadContract({
    address: asset.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && vault ? [address, vault.address] : undefined,
    query: { enabled: Boolean(address && vault) },
  });

  const parsed = useMemo(() => {
    if (!amount || amount === "" || Number.isNaN(Number(amount))) return null;
    try {
      return parseUnits(amount, asset.decimals);
    } catch {
      return null;
    }
  }, [amount, asset.decimals]);

  const needsApproval = parsed != null && vault != null && allowance != null && parsed > allowance;

  const { writeContractAsync, isPending: isWritePending, error: writeError } = useWriteContract();
  const {
    isPending: isReceiptPending,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash ?? undefined });

  // useWaitForTransactionReceipt keeps isPending=true while its query is
  // disabled (no hash yet). Only treat it as "confirming" when a tx hash
  // actually exists, otherwise the whole flow looks stuck.
  const isConfirming = isReceiptPending && txHash != null;

  const balanceFormatted = balance != null ? formatUnitsValue(balance, asset.decimals) : null;

  useEffect(() => {
    if (isSuccess && txHash) {
      refetchBalance();
      refetchAllowance();
    }
  }, [isSuccess, txHash, refetchBalance, refetchAllowance]);

  async function approve() {
    if (!vault || parsed == null) return;
    setTxHash(null);
    try {
      const hash = await writeContractAsync({
        address: asset.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [vault.address, parsed],
      });
      setTxHash(hash);
    } catch {
      /* surfaced via writeError */
    }
  }

  async function deposit() {
    if (!vault || parsed == null || !address) return;
    setTxHash(null);
    try {
      const hash = await writeContractAsync({
        address: vault.address,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [parsed, address],
      });
      setTxHash(hash);
    } catch {
      /* surfaced via writeError */
    }
  }

  const actionError = writeError ?? receiptError;
  const busy = isWritePending || isConfirming;

  // Approve is a permission grant, not a transfer: it only needs a valid
  // amount. Deposit is the one that requires a real, loaded balance.
  const amountValid = parsed != null && parsed > 0n;
  const balanceLoaded = balance != null;
  const insufficient = balance != null && parsed != null && parsed > balance;
  const approveDisabled = !amountValid || busy;
  const depositDisabled = !amountValid || !balanceLoaded || insufficient || busy;

  function actionHint(): string {
    if (busy) return "A transaction is in progress — wait for it to confirm.";
    if (!amountValid) return "Enter an amount above to enable the button.";
    if (!balanceLoaded) {
      if (balanceError) return "Could not read your balance — is your wallet on Coston2 (chain id 114)?";
      return "Reading your balance…";
    }
    if (insufficient) return `Insufficient balance — you have ${balanceFormatted} ${asset.symbol}.`;
    return "";
  }

  return (
    <div className="space-y-4">
      {/* Wallet connection */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">1 · Connect an EVM wallet</h3>
          {isConnected && address && (
            <span className="font-mono text-[11px] text-muted">{shortenAddress(address)}</span>
          )}
        </div>
        {!isConnected ? (
          <p className="mt-3 rounded-xl border border-line bg-surface-2 p-3 text-[13px] text-ink-soft">
            Connect your wallet from the header, then return here to deposit.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => disconnect()}
            className="mt-3 text-[13px] font-semibold text-muted underline"
          >
            Disconnect
          </button>
        )}
      </section>

      {isConnected && address && (
        <>
          {/* Balance + faucet */}
          <section className="card p-5">
            <h3 className="text-sm font-semibold text-ink">2 · Get test {asset.symbol}</h3>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              Balance:{" "}
              <span className="font-semibold text-ink">
                {balanceFormatted ?? "…"} {asset.symbol}
              </span>
            </p>
            {balance != null && balance === 0n && (
              <div className="mt-2 rounded-xl border border-gold/30 bg-gold-soft p-3 text-[13px] leading-snug text-gold">
                You have no test FXRP yet. Claim the daily Coston2 faucet allowance (
                {COSTON2.faucetUrl}) then come back. FXRP is a test token — it has no real
                value.
              </div>
            )}
          </section>

          {/* Amount */}
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">3 · How much to deposit</h3>
              {balance != null && balance > 0n && (
                <button
                  type="button"
                  onClick={() => setAmount(formatUnits(balance, asset.decimals))}
                  className="text-[13px] font-semibold text-brand"
                >
                  Max
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2.5 focus-within:border-brand">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                aria-label="Amount to deposit"
                className="w-full bg-transparent text-lg font-bold text-ink outline-none placeholder:text-line"
              />
              <span className="shrink-0 text-sm font-semibold text-muted">{asset.symbol}</span>
            </div>
            {parsed == null && amount !== "" && (
              <p className="mt-1.5 text-xs text-danger">Enter a valid number.</p>
            )}
            {balance != null && parsed != null && parsed > balance && (
              <p className="mt-1.5 text-xs text-danger">
                You only have {balanceFormatted} {asset.symbol}.
              </p>
            )}
          </section>

          {/* Execute */}
          <section className="card p-5">
            <h3 className="text-sm font-semibold text-ink">
              4 · {needsApproval ? "Approve, then deposit" : "Deposit"}
            </h3>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              First approval lets the vault move your {asset.symbol}; the deposit is a
              second transaction. Both are signed by your wallet — Lumina never touches
              your funds.
            </p>

            <div className="mt-3 flex gap-3">
              {needsApproval ? (
                <button
                  type="button"
                  disabled={approveDisabled}
                  onClick={approve}
                  className="flex-1 rounded-xl bg-brand px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-strong disabled:opacity-40"
                >
                  {isConfirming && txHash ? "Confirming…" : "Approve"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={depositDisabled}
                  onClick={deposit}
                  className="flex-1 rounded-xl bg-brand px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-strong disabled:opacity-40"
                >
                  {isConfirming && txHash ? "Depositing…" : "Deposit"}
                </button>
              )}
            </div>

            {/* Why the action button is unavailable — never leave it silent. */}
            {((needsApproval && approveDisabled) || (!needsApproval && depositDisabled)) && (
              <p className="mt-2 text-xs text-muted">{actionHint()}</p>
            )}

            {txHash && !isSuccess && (
              <p className="mt-2 font-mono text-[11px] break-all text-muted">tx {txHash}</p>
            )}

            {isSuccess && txHash && (
              <div className="mt-3 rounded-xl border border-brand/30 bg-brand-soft p-3">
                <p className="text-sm font-semibold text-brand">
                  Deposit submitted to Coston2.
                </p>
                <a
                  href={`${COSTON2.explorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-mono text-[11px] break-all text-brand underline"
                >
                  {COSTON2.explorer}/tx/{txHash}
                </a>
                <p className="mt-2 text-[13px] leading-snug text-ink-soft">
                  Shares appear in your wallet. See your position on the Dashboard (or
                  check the vault contract directly on the explorer).
                </p>
              </div>
            )}

            {actionError && (
              <div className="mt-3 rounded-xl border border-danger/30 bg-danger/5 p-3">
                <p className="text-[13px] font-semibold text-danger">Transaction failed</p>
                <p className="mt-1 text-xs leading-snug text-ink-soft">
                  {(actionError as Error).message?.slice(0, 240) ??
                    "The wallet rejected the transaction."}{" "}
                  You can retry. If the vault rejects deposits, the strategy page shows
                  its current on-chain status.
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {!vault && (
        <p className="rounded-2xl border border-gold/30 bg-gold-soft p-4 text-[13px] leading-snug text-gold">
          This strategy has no registered vault on Coston2, so the EVM path is not
          available. Explore the live strategies instead.
        </p>
      )}
    </div>
  );
}
