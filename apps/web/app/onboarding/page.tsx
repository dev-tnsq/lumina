"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import type { RiskPreferences, RiskTier } from "@lumina/shared";
import { getStrategy, recommendLive } from "@lumina/shared";
import { RiskBadge } from "@/components/RiskBadge";

const TOLERANCE_OPTIONS: { value: RiskTier; title: string; desc: string }[] = [
  {
    value: "Conservative",
    title: "Conservative",
    desc: "I'd rather earn less than risk losing principal.",
  },
  {
    value: "Balanced",
    title: "Balanced",
    desc: "Some risk is fine for better returns.",
  },
  {
    value: "Advanced",
    title: "Advanced",
    desc: "I understand complex strategies and volatile returns.",
  },
];

const LOCKUP_OPTIONS = [
  { value: "none", title: "No lock-ups", desc: "I need my money available quickly." },
  { value: "some", title: "Some is OK", desc: "I can wait a few days if the yield is better." },
  { value: "comfortable", title: "Comfortable waiting", desc: "I'm happy to wait full withdrawal periods." },
] as const;

const PREFERENCES_KEY = "lumina.risk-preferences.v1";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [tolerance, setTolerance] = useState<RiskTier | null>(null);
  const [lockup, setLockup] = useState<(typeof LOCKUP_OPTIONS)[number]["value"] | null>(null);
  const [simplicity, setSimplicity] = useState<boolean>(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.title = "Find your fit · Lumina";
  }, []);

  function finish() {
    if (!tolerance || !lockup) return;
    const prefs: RiskPreferences = {
      riskTolerance: tolerance,
      lockupComfort: lockup,
      simplicity,
    };
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch {
      /* storage may be unavailable (private mode) — proceed without persisting */
    }
    setDone(true);
  }

  if (done && tolerance && lockup) {
    return <Results tolerance={tolerance} lockup={lockup} simplicity={simplicity} />;
  }

  const canContinue =
    step === 0 ? tolerance != null : step === 1 ? lockup != null : true;

  return (
    <div className="container-phone pb-safe">
      <header className="px-4 pt-5">
        <Link href="/" className="text-[13px] font-semibold text-brand">
          ← Home
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
          {step === 0 && "How do you feel about risk?"}
          {step === 1 && "How quickly do you need your money?"}
          {step === 2 && "One last preference"}
        </h1>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`}
            />
          ))}
        </div>
      </header>

      <main className="px-4">
        {step === 0 && (
          <div className="mt-4 space-y-3">
            {TOLERANCE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setTolerance(o.value)}
                aria-pressed={tolerance === o.value}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  tolerance === o.value
                    ? "border-brand bg-brand-soft"
                    : "border-line bg-surface hover:border-brand/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{o.title}</p>
                  <RiskBadge tier={o.value} size="sm" />
                </div>
                <p className="mt-1 text-[13px] leading-snug text-muted">{o.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-3">
            {LOCKUP_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setLockup(o.value)}
                aria-pressed={lockup === o.value}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  lockup === o.value
                    ? "border-brand bg-brand-soft"
                    : "border-line bg-surface hover:border-brand/50"
                }`}
              >
                <p className="text-sm font-semibold text-ink">{o.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">{o.desc}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setSimplicity(true)}
              aria-pressed={simplicity === true}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                simplicity
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-brand/50"
              }`}
            >
              <p className="text-sm font-semibold text-ink">Simple paths first</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">
                Prefer single-vault strategies with one clear mechanism.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSimplicity(false)}
              aria-pressed={simplicity === false}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                !simplicity
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-surface hover:border-brand/50"
              }`}
            >
              <p className="text-sm font-semibold text-ink">Show me everything</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">
                I'm happy to compare complex strategies too.
              </p>
            </button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-brand"
            >
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => (step < 2 ? setStep(step + 1) : finish())}
            className="flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step < 2 ? "Continue" : "Show my matches"}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function Results({
  tolerance,
  lockup,
  simplicity,
}: {
  tolerance: RiskTier;
  lockup: RiskPreferences["lockupComfort"];
  simplicity: boolean;
}) {
  const recs = recommendLive({ riskTolerance: tolerance, lockupComfort: lockup, simplicity });

  return (
    <div className="container-phone pb-safe">
      <header className="px-4 pt-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Your matches</h1>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Ranked for a {tolerance.toLowerCase()} risk comfort
          {lockup !== "none" ? " with lock-up tolerance" : " requiring quick exits"}.
          You can always change your answers and re-rank.
        </p>
      </header>

      <main className="mt-4 space-y-3 px-4">
        {recs.map((r) => (
          <Link
            key={r.strategyId}
            href={`/strategies/${r.strategyId}`}
            className="block rounded-2xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-brand"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">
                {r.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {getStrategy(r.strategyId)?.name ?? r.strategyId}
                </p>
                <p className="text-[13px] leading-snug text-muted">{r.reason}</p>
              </div>
            </div>
          </Link>
        ))}

        <div className="flex gap-3 pt-2">
          <Link
            href="/strategies"
            className="flex-1 rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-strong"
          >
            Compare all strategies
          </Link>
          <Link
            href="/onboarding"
            className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-brand"
          >
            Re-answer
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
